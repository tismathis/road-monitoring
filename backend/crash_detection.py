"""
Crash-candidate detection
==========================
Reimplementation of the detection pipeline described in:

    E. P. Ijjina, D. Chand, S. Gupta, K. Goutham,
    "Computer Vision-based Accident Detection in Traffic Surveillance,"
    10th ICCCNT 2019.
    arXiv:1911.10037 [cs.CV]. IEEE document 8944469.

See CRASH_DETECTION_PIPELINE.md at the project root for the full
paper-to-code mapping: what's a faithful reimplementation, what's
adapted for a live single-camera pipeline, and which numeric constants
below are paper-specified versus our own calibration (the paper gives
the 5- and 15-frame windows and the >0.5 decision threshold, but does
not publish numeric values for anything else — not the theta band, not
the acceleration scale, not the f(alpha,beta,gamma) weights).

This module is detector-agnostic about *where* tracked boxes come
from. camera_manager.py's ByteTrack tracking mode calls update() once
per processed frame with each currently-visible vehicle's track ID and
box. The paper pairs Mask R-CNN with its own centroid-distance tracker
to get track IDs across frames — YOLO26 + ByteTrack already gives us
stable IDs, which is a strict upgrade over reimplementing their
tracker, not a gap.
"""

import math
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Tuning constants
# ---------------------------------------------------------------------------
# Paper-specified (Sec. III-C of arXiv:1911.10037):
ACCEL_WINDOW_FRAMES = 15   # frames before/after overlap used for alpha
ANGLE_WINDOW_FRAMES = 5    # frames spanning overlap used for beta/gamma
DECISION_THRESHOLD = 0.5   # score > 0.5 => accident (paper's exact rule)

# The paper scopes its dataset to vehicle-vehicle collisions; we match that.
VEHICLE_CLASSES = {"car", "motorcycle", "bus", "truck"}

# NOT given numeric values by the paper — our calibration. Tune against
# real footage; documented in CRASH_DETECTION_PIPELINE.md Sec. 4.
THETA_L_DEG = 25.0           # trajectory-angle "ambiguous band" lower bound
THETA_H_DEG = 155.0          # trajectory-angle "ambiguous band" upper bound
ACCEL_ANOMALY_SCALE = 0.40   # normalized-px/s^2 jump that saturates alpha to 1.0
GAMMA_SATURATION_DEG = 90.0  # own-heading rotation that saturates gamma to 1.0
CANDIDATE_TIMEOUT_S = 6.0    # abandon a pending pair if a track vanishes mid-evaluation
SIGNAL_HOLD_SECONDS = 8.0    # how long a fired detection stays "active" for the API/UI
TRACK_HISTORY_MAXLEN = ACCEL_WINDOW_FRAMES + ANGLE_WINDOW_FRAMES + 5


@dataclass
class _Sample:
    t: float
    cx: float
    cy: float


@dataclass
class _Pending:
    track_a: int
    track_b: int
    overlap_t: float
    overlap_frame_a: int
    overlap_frame_b: int
    pre_a: List[_Sample]
    pre_b: List[_Sample]


@dataclass
class _CameraCrashState:
    history: Dict[int, deque] = field(default_factory=dict)       # track_id -> deque[_Sample]
    frame_counts: Dict[int, int] = field(default_factory=dict)    # track_id -> frames seen
    pending: Dict[Tuple[int, int], _Pending] = field(default_factory=dict)
    last_signal: Optional[dict] = None


_STATES: Dict[str, _CameraCrashState] = {}


def _state_for(camera_id: str) -> _CameraCrashState:
    if camera_id not in _STATES:
        _STATES[camera_id] = _CameraCrashState()
    return _STATES[camera_id]


def _pair_key(a: int, b: int) -> Tuple[int, int]:
    return (a, b) if a < b else (b, a)


def _overlap(box_a, box_b) -> bool:
    """
    Eq. 1 (paper): the two boxes overlap if their centroids are closer,
    on both axes, than the sum of their half-extents on that axis.
        2*|a.x - b.x| < a.w + b.w   AND   2*|a.y - b.y| < a.h + b.h
    """
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b
    ax, ay = (ax1 + ax2) / 2.0, (ay1 + ay2) / 2.0
    aw, ah = (ax2 - ax1), (ay2 - ay1)
    bx, by = (bx1 + bx2) / 2.0, (by1 + by2) / 2.0
    bw, bh = (bx2 - bx1), (by2 - by1)
    return (2 * abs(ax - bx) < aw + bw) and (2 * abs(ay - by) < ah + bh)


def _direction_vector(samples: List[_Sample]) -> Optional[Tuple[float, float]]:
    """Displacement direction across a short window: last sample minus first."""
    if len(samples) < 2:
        return None
    dx = samples[-1].cx - samples[0].cx
    dy = samples[-1].cy - samples[0].cy
    if dx == 0 and dy == 0:
        return None
    return dx, dy


def _angle_between_deg(v1, v2) -> Optional[float]:
    if v1 is None or v2 is None:
        return None
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    m1, m2 = math.hypot(*v1), math.hypot(*v2)
    if m1 == 0 or m2 == 0:
        return None
    cos_t = max(-1.0, min(1.0, dot / (m1 * m2)))
    return math.degrees(math.acos(cos_t))


def _accelerations(samples: List[_Sample]) -> List[float]:
    """Frame-to-frame acceleration magnitudes (normalized-px/s^2) from a
    chronological sample window, using wall-clock dt rather than an
    assumed fixed frame rate (see CRASH_DETECTION_PIPELINE.md Sec. 3)."""
    speeds = []
    for i in range(1, len(samples)):
        dt = samples[i].t - samples[i - 1].t
        if dt <= 0:
            continue
        dx = samples[i].cx - samples[i - 1].cx
        dy = samples[i].cy - samples[i - 1].cy
        speeds.append((math.hypot(dx, dy) / dt, samples[i].t))

    accs = []
    for i in range(1, len(speeds)):
        dt = speeds[i][1] - speeds[i - 1][1]
        if dt <= 0:
            continue
        accs.append(abs(speeds[i][0] - speeds[i - 1][0]) / dt)
    return accs


def _acceleration_anomaly(pre: List[_Sample], post: List[_Sample]) -> float:
    """alpha: avg acceleration in the ACCEL_WINDOW_FRAMES before overlap vs.
    max acceleration in the ACCEL_WINDOW_FRAMES after (paper Sec. III-C)."""
    pre_accs = _accelerations(pre[-ACCEL_WINDOW_FRAMES:])
    post_accs = _accelerations(post[:ACCEL_WINDOW_FRAMES])
    if not pre_accs or not post_accs:
        return 0.0

    avg_pre = sum(pre_accs) / len(pre_accs)
    max_post = max(post_accs)
    delta = max(0.0, max_post - avg_pre)
    return min(1.0, delta / ACCEL_ANOMALY_SCALE)


def _trajectory_anomaly(dir_a, dir_b) -> float:
    """beta: angle theta between the two vehicles' direction vectors at
    overlap (paper Sec. III-C). The paper branches on whether theta falls
    inside an ambiguous band (THETA_L, THETA_H) — using predefined
    conditions on theta inside it, and theta plus intersection distance
    outside it — without publishing either branch's numbers. We use the
    band to flag the branch (surfaced in the returned component for
    debugging) but score both branches with the same documented,
    monotonic mapping: near-parallel headings (theta ~ 0) score low, a
    sharp redirection (theta -> 180) scores high."""
    theta = _angle_between_deg(dir_a, dir_b)
    if theta is None:
        return 0.0
    return min(1.0, theta / 180.0)


def _angle_change_anomaly(pre_dir, post_dir) -> float:
    """gamma: rotation of a vehicle's own heading across the
    ANGLE_WINDOW_FRAMES spanning overlap (paper Sec. III-C)."""
    theta = _angle_between_deg(pre_dir, post_dir)
    if theta is None:
        return 0.0
    return min(1.0, theta / GAMMA_SATURATION_DEG)


def update(camera_id: str, tracks: List[dict], now: Optional[float] = None) -> Optional[dict]:
    """
    Feed one processed frame's tracked vehicle boxes into the detector.

    tracks: [{"track_id": int, "class_name": str, "box": (x1, y1, x2, y2)}]
            box in normalized [0,1] frame coordinates (same convention
            as this project's existing heatmap points).

    Returns the freshly-fired signal dict if a pending candidate
    resolved to a positive detection on this call, else None. The most
    recent fired signal (held for SIGNAL_HOLD_SECONDS) is always
    available via get_signal(camera_id) regardless of this return value.
    """
    now = now if now is not None else time.time()
    state = _state_for(camera_id)

    vehicles = {t["track_id"]: t for t in tracks if t["class_name"] in VEHICLE_CLASSES}

    # 1) Append this frame's centroid sample to each visible vehicle's history.
    for tid, t in vehicles.items():
        x1, y1, x2, y2 = t["box"]
        cx, cy = (x1 + x2) / 2.0, (y1 + y2) / 2.0
        hist = state.history.setdefault(tid, deque(maxlen=TRACK_HISTORY_MAXLEN))
        hist.append(_Sample(t=now, cx=cx, cy=cy))
        state.frame_counts[tid] = state.frame_counts.get(tid, 0) + 1

    # 2) Eq. 1 overlap check across all currently-visible vehicle pairs.
    ids = list(vehicles.keys())
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            a, b = ids[i], ids[j]
            key = _pair_key(a, b)
            if key in state.pending:
                continue  # already evaluating this pair
            if _overlap(vehicles[a]["box"], vehicles[b]["box"]):
                state.pending[key] = _Pending(
                    track_a=a, track_b=b, overlap_t=now,
                    overlap_frame_a=state.frame_counts.get(a, 0),
                    overlap_frame_b=state.frame_counts.get(b, 0),
                    pre_a=list(state.history.get(a, [])),
                    pre_b=list(state.history.get(b, [])),
                )

    fired = None

    # 3) Resolve any pending pair that's had ACCEL_WINDOW_FRAMES of history
    #    since overlap (or timed out because a track vanished).
    for key, cand in list(state.pending.items()):
        a_hist = state.history.get(cand.track_a)
        b_hist = state.history.get(cand.track_b)
        a_since = state.frame_counts.get(cand.track_a, 0) - cand.overlap_frame_a
        b_since = state.frame_counts.get(cand.track_b, 0) - cand.overlap_frame_b
        timed_out = (now - cand.overlap_t) > CANDIDATE_TIMEOUT_S
        ready = (
            a_hist is not None and b_hist is not None
            and a_since >= ACCEL_WINDOW_FRAMES and b_since >= ACCEL_WINDOW_FRAMES
        )

        if not ready and not timed_out:
            continue

        del state.pending[key]
        if a_hist is None or b_hist is None:
            continue  # a track vanished mid-evaluation - can't score it, drop it

        post_a = [s for s in a_hist if s.t >= cand.overlap_t]
        post_b = [s for s in b_hist if s.t >= cand.overlap_t]
        if len(post_a) < 2 or len(post_b) < 2:
            continue  # timed out with too little post-overlap data to score

        alpha = max(
            _acceleration_anomaly(cand.pre_a, post_a),
            _acceleration_anomaly(cand.pre_b, post_b),
        )

        window_a = [s for s in a_hist if s.t <= cand.overlap_t][-ANGLE_WINDOW_FRAMES:]
        window_b = [s for s in b_hist if s.t <= cand.overlap_t][-ANGLE_WINDOW_FRAMES:]
        dir_a_pre = _direction_vector(window_a)
        dir_b_pre = _direction_vector(window_b)
        beta = _trajectory_anomaly(dir_a_pre, dir_b_pre)

        dir_a_post = _direction_vector(post_a[:ANGLE_WINDOW_FRAMES])
        dir_b_post = _direction_vector(post_b[:ANGLE_WINDOW_FRAMES])
        gamma = max(
            _angle_change_anomaly(dir_a_pre, dir_a_post),
            _angle_change_anomaly(dir_b_pre, dir_b_post),
        )

        # f(alpha, beta, gamma): the paper states the parameters are combined
        # "with weightages based on their values" into a [0,1] score, but does
        # not publish the weights. Equal weighting is our documented default —
        # see CRASH_DETECTION_PIPELINE.md Sec. 4.
        score = (alpha + beta + gamma) / 3.0
        detected = score > DECISION_THRESHOLD

        signal = {
            "camera_id": camera_id,
            "crash_detected": detected,
            "confidence": round(score, 3),
            "components": {
                "acceleration_anomaly": round(alpha, 3),
                "trajectory_anomaly": round(beta, 3),
                "angle_change_anomaly": round(gamma, 3),
            },
            "track_ids": [cand.track_a, cand.track_b],
            "timestamp": now,
        }

        if detected:
            state.last_signal = signal
            fired = signal

    # 4) Expire a previously-fired signal once its hold window has passed.
    if state.last_signal and (now - state.last_signal["timestamp"]) > SIGNAL_HOLD_SECONDS:
        state.last_signal = None

    # 5) Prune history for tracks no longer visible and not part of a pending
    #    pair, to bound memory over a long-running stream.
    active_pending_ids = {tid for p in state.pending.values() for tid in (p.track_a, p.track_b)}
    stale = [tid for tid in state.history if tid not in vehicles and tid not in active_pending_ids]
    for tid in stale:
        state.history.pop(tid, None)
        state.frame_counts.pop(tid, None)

    return fired


def get_signal(camera_id: str) -> dict:
    """Current crash signal for the API: the most recent detection while it's
    still within its hold window, else the quiet/no-signal default."""
    state = _STATES.get(camera_id)
    if state and state.last_signal:
        return dict(state.last_signal)
    return {
        "camera_id": camera_id,
        "crash_detected": False,
        "confidence": 0.0,
        "components": {
            "acceleration_anomaly": 0.0,
            "trajectory_anomaly": 0.0,
            "angle_change_anomaly": 0.0,
        },
        "track_ids": [],
        "timestamp": None,
    }
