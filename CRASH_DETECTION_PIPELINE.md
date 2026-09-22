# Crash-Candidate Detection Pipeline

This document explains the crash-candidate detector added to the live traffic
camera pipeline, how it maps to its source paper, and exactly which parts are
a faithful reimplementation versus an adaptation or an unvalidated heuristic
choice. It follows the same honesty convention the rest of this project uses
for its real-vs-approximated boundaries (see the "not implemented" /
"requires per-spot tracking" flags in `backend/camera_manager.py`'s KPI
functions for the established pattern).

## 1. Source paper

> E. P. Ijjina, D. Chand, S. Gupta, K. Goutham, **"Computer Vision-based
> Accident Detection in Traffic Surveillance,"** 10th International
> Conference on Computing, Communication and Networking Technologies
> (ICCCNT), 2019.
> arXiv: [1911.10037](https://arxiv.org/abs/1911.10037) [cs.CV]
> IEEE document: 8944469

The paper detects vehicular accidents in surveillance video with a two-stage
pipeline: (1) Mask R-CNN object detection + a custom centroid-distance
tracker, feeding a bounding-box overlap test (their Eq. 1); (2) once two
tracked vehicles overlap, three anomaly parameters — **α (Acceleration
Anomaly)**, **β (Trajectory Anomaly)**, **γ (Change-in-Angle Anomaly)** — are
computed over a short window of frames around the overlap and combined into a
single accident-likelihood score in `[0, 1]`. A score above 0.5 is reported
as an accident.

## 2. What existed in this project before this work

Before this change, there was no crash-candidate detector anywhere in the
codebase — only a stub: `GET /cameras/{camera_id}/crash-signal` in
`backend/main.py` returned a hardcoded `"Crash detection not yet
implemented"`. `camera_manager.py`'s tracking pipeline ran YOLO26 + ByteTrack
for detection counts and heatmap points, but kept no per-track trajectory
history — nothing needed to compute overlap, deceleration, or trajectory
signals survived past the current frame. This is a from-scratch
implementation guided directly by the paper's methodology, not a refinement
of prior ad hoc code.

## 3. Architecture

```
camera_manager.py (process_tracking_mode, tracking-mode cameras only)
  -> per-frame tracked vehicle boxes (track_id, class, normalized xyxy)
  -> crash_detection.update(camera_id, tracks)
       -> per-track centroid history (crash_detection.py, module-private)
       -> Eq. 1 overlap check across all currently-visible vehicle pairs
       -> on overlap: schedule (alpha, beta, gamma) evaluation
       -> on resolution: f(alpha, beta, gamma) -> score -> crash_detected
main.py
  -> GET /cameras/{camera_id}/crash-signal -> crash_detection.get_signal(camera_id)
frontend/src/hooks/useCrashSignals.js
  -> polls /cameras/{id}/crash-signal for every camera with a road_node_id
  -> frontend/src/pages/GraphPage.jsx, GraphPage3D.jsx
       -> maps signal -> the one mapped road-graph node's hasAlert state
```

`crash_detection.py` is intentionally detector-agnostic about where boxes
come from — it only requires `(track_id, class_name, box)` per frame, so it
runs the same way regardless of which camera feeds it.

## 4. Paper-to-code mapping

### 4.1 Faithful reimplementation

**Eq. 1 — bounding-box overlap.** The paper's condition:

```
2·|a.x − b.x| < a.α + b.α   AND   2·|a.y − b.y| < a.β + b.β
```

(centroids `x, y`; box width/height `α, β` — the paper reuses α/β for both
Eq. 1's box dimensions and the later anomaly parameters; this codebase avoids
that collision by naming the overlap check `_overlap()` and never reusing
`alpha`/`beta` for box dimensions.) `crash_detection._overlap()` implements
this exactly, operating on frame-normalized `[0,1]` coordinates — the
inequality is scale-invariant per axis, so normalizing doesn't change which
pairs it fires on, and it stays consistent with this project's existing
normalized heatmap-point convention.

**The three named anomaly parameters and their structure.** `alpha`
(`_acceleration_anomaly`), `beta` (`_trajectory_anomaly`), and `gamma`
(`_angle_change_anomaly`) each follow the paper's described computation:

- **α:** average acceleration in the 15 frames before overlap vs. the
  maximum acceleration in the 15 frames after — the paper's exact frame
  windows (`ACCEL_WINDOW_FRAMES = 15`).
- **β:** the angle θ between the two vehicles' direction vectors at the
  moment of overlap.
- **γ:** the rotation of a vehicle's own heading across a 5-frame window
  spanning the overlap — the paper's exact window (`ANGLE_WINDOW_FRAMES = 5`).

**The decision rule.** `score = f(alpha, beta, gamma)`, accident if
`score > 0.5` — the paper's exact threshold (`DECISION_THRESHOLD = 0.5`).

**Scope: vehicle-vehicle collisions.** The paper's dataset and framing is
vehicle-vehicle. `crash_detection.py` restricts candidate pairs to
`{car, motorcycle, bus, truck}` (`VEHICLE_CLASSES`), the same restriction,
rather than also pairing pedestrians/bicycles into "collision" candidates the
paper never claims to detect.

**Tracking.** The paper pairs Mask R-CNN with its own custom centroid-
distance tracker specifically *because* Mask R-CNN alone gives no track
continuity across frames. This project already has persistent track IDs from
YOLO26 + ByteTrack, which is a strict upgrade over reimplementing the
paper's simpler nearest-centroid tracker for this step — not a gap.

### 4.2 Adapted for a live, single-camera pipeline

**No fixed frame rate.** The paper's dataset runs at a controlled 30 fps
with clean, evenly-spaced frame indices, so "15 frames" is also exactly "0.5
seconds" for them. This pipeline processes a live YouTube stream where
inference time, network jitter, and stream buffering mean the actual
wall-clock spacing between processed frames varies — `time.sleep(0.03)` in
`camera_manager.py` is a rate *cap*, not a guarantee. `crash_detection.py`
counts **processed frames** per track for the paper's window sizes (the
closest faithful equivalent to their frame-indexed windows), but computes
all velocity/acceleration math from **wall-clock timestamps**
(`time.time()`), not an assumed `1/30s` step. This is an honest adaptation,
not an approximation presented as identical — a genuinely slower or
stuttering stream changes what "15 frames" represents in real time, exactly
as it would for any live deployment of this method.

**Normalized pixel-space, not calibrated real-world speed.** Like the rest
of this project (see the heatmap points and every KPI calculation in
`camera_manager.py`), α's "acceleration" is normalized-pixels-per-second²
from one uncalibrated camera view, not km/h or m/s². The paper does not
publish real-world-calibrated thresholds either, so this doesn't diverge
from what's actually validated in the paper — but it means the acceleration
anomaly's absolute scale is scene-specific (camera distance, angle, zoom)
and would need recalibration per camera deployment.

**Live streaming vs. offline evaluation.** The paper evaluates on a
pre-recorded, curated accident/non-accident dataset. This runs continuously
on unscripted live traffic, so it has to make an online decision (fire, wait,
or time out a candidate pair, `CANDIDATE_TIMEOUT_S = 6.0`) rather than
having the full clip available to analyze.

### 4.3 Not specified by the paper — this project's calibration

The paper explicitly gives numeric values only for the frame windows (5, 15)
and the decision threshold (0.5). Every other number below is **this
project's own calibration**, not a value from the paper, and should be tuned
against real footage from each deployed camera rather than trusted as
validated:

| Constant | Value | What it controls |
|---|---|---|
| `THETA_L_DEG`, `THETA_H_DEG` | 25°, 155° | The paper's "ambiguous band" for β's branching logic — the band's existence is paper-specified, its bounds are not. |
| `ACCEL_ANOMALY_SCALE` | 0.40 (normalized-px/s²) | The acceleration delta that saturates α to 1.0. |
| `GAMMA_SATURATION_DEG` | 90° | The own-heading rotation that saturates γ to 1.0. |
| `f(alpha, beta, gamma)` weights | equal (mean of the three) | The paper states the three are combined "with weightages based on their values" but never publishes the weights. Equal weighting is the most defensible default in their absence. |
| β's two-branch scoring | both branches collapse to `theta / 180°` | The paper branches on whether θ is inside the ambiguous band — predefined conditions on θ inside it, θ plus trajectory-intersection distance outside it — without publishing either branch's actual formula. This implementation uses one documented, monotonic mapping for both branches (near-parallel headings score low, a sharp redirection scores high) rather than inventing unpublished branch formulas and presenting them as the paper's. |

## 5. What this means for the crash signal in practice

`crash_detected: true` from this pipeline means: *two vehicle bounding boxes
satisfied the paper's overlap condition, and the subsequent trajectory data
scored above the paper's decision threshold under this project's calibration
of the parameters the paper leaves unspecified.* It is **not** a validated
detector — the paper itself reports accuracy on its own curated dataset, and
none of the numbers in §4.3 have been tuned or measured against Gaborone
traffic footage specifically. It should be read the same way this project
already reads its other heuristic signals (e.g. `occupancy_level` thresholds
in `calculate_parking_kpis`): a reasonable, documented default that a real
deployment should calibrate, not a certified accident classifier.

## 6. Network-graph wiring

Each live camera is mapped to **at most one** road-graph node via an
explicit `road_node_id` field on its `CameraConfig`
(`backend/camera_config.py`) — currently just `traffic_main_gaborone -> A2`
("Independence Ave", matching the camera's `location_label` "Main St &
Independence Ave"). This mapping is hand-set, not inferred: with a single
traffic camera and no calibrated geolocation from its view, pretending to
automatically place a crash on a specific road segment would overstate the
system's actual spatial precision. A camera with no `road_node_id` (the
parking camera) simply never appears in this mapping.

`frontend/src/hooks/useCrashSignals.js` polls `/cameras/{id}/crash-signal`
only for cameras that have a `road_node_id`, and returns `{ [road_node_id]:
signal }`. `GraphPage.jsx` and `GraphPage3D.jsx` apply that signal only to
the matching node's `hasAlert` state — every other node (no camera mapped to
it) is never touched and stays in its permanent neutral state. This replaces
the previous simulated/random alert data path entirely; there is no
remaining code path that invents an alert for a node without a real camera.

## 7. Alert-state visuals

The node ignition (color crossfade + a brief scale kick), the sustained
radar-style pulse, and the alert-edge styling are one shared motion language
(`frontend/src/utils/graphAlertMotion.js`) used identically by the 2D canvas
renderer and the 3D Three.js renderer, timed to match this app's existing
`.gb-radar-ring` motif (`index.css`) rather than inventing a new one. See
that file's header comment for the full timing/easing breakdown.
