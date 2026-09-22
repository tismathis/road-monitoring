"""
Unified Multi-Camera Processing Engine
=======================================
Generic camera worker that supports both ByteTrack tracking mode and SAHI sliced inference mode.
Per-camera state isolation with thread-safe locks.
Custom bounding box rendering with corner-bracket style.
"""

import cv2
import numpy as np
import threading
import time
import subprocess
from collections import deque
from dataclasses import dataclass, field
from typing import Dict, Optional

from ultralytics import YOLO
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction

from camera_config import CAMERA_BY_ID, CameraConfig, CLASS_MAP
import crash_detection


# =====================================================================
# PER-CAMERA STATE DATACLASS
# =====================================================================

@dataclass
class CameraState:
    """Thread-safe state for a single camera"""

    camera_id: str

    # Video frame state
    latest_frame: Optional[bytes] = None
    frame_lock: threading.Lock = field(default_factory=threading.Lock)

    # Detection statistics
    counts: Dict[str, int] = field(default_factory=dict)
    counts_lock: threading.Lock = field(default_factory=threading.Lock)
    seen_track_ids: set = field(default_factory=set)

    # History snapshots (60 snapshots @ 10s = 10 minutes of history)
    history: deque = field(default_factory=lambda: deque(maxlen=60))
    history_lock: threading.Lock = field(default_factory=threading.Lock)
    last_snapshot_time: float = 0

    # Heatmap points
    heatmap_points: deque = field(default_factory=lambda: deque(maxlen=80))
    heatmap_lock: threading.Lock = field(default_factory=threading.Lock)

    # Parking-specific state
    parking_stats: Dict = field(default_factory=dict)
    parking_stats_lock: threading.Lock = field(default_factory=threading.Lock)

    # Status
    is_online: bool = False
    last_frame_time: float = 0
    error_message: str = ""


# =====================================================================
# GLOBAL REGISTRIES
# =====================================================================

# Global registry of camera states (keyed by camera_id)
CAMERA_STATES: Dict[str, CameraState] = {}
CAMERA_THREADS: Dict[str, threading.Thread] = {}

# Shared YOLO models (loaded once, thread-safe for inference)
YOLO_MODEL = None
SAHI_MODEL = None
MODEL_LOCK = threading.Lock()


# =====================================================================
# MODEL LOADING
# =====================================================================

def load_models():
    """Load YOLO models once at startup (thread-safe)"""
    global YOLO_MODEL, SAHI_MODEL

    with MODEL_LOCK:
        if YOLO_MODEL is None:
            print("Loading YOLO26n model for tracking mode...")
            YOLO_MODEL = YOLO("yolo26n.pt")
            print("✓ YOLO26n loaded successfully")

        if SAHI_MODEL is None:
            print("Loading SAHI-wrapped YOLO26n model for sliced inference...")
            SAHI_MODEL = AutoDetectionModel.from_pretrained(
                model_type="ultralytics",
                model_path="yolo26n.pt",
                confidence_threshold=0.15,  # Default, overridden per-camera
                device="cpu",
            )
            print("✓ SAHI model loaded successfully")


# =====================================================================
# YOUTUBE STREAM HANDLING
# =====================================================================

def resolve_stream_url(url: str) -> str:
    """
    Resolve YouTube URL to direct stream using streamlink.
    streamlink works better with OpenCV than yt-dlp for live streams.
    """
    if "youtube.com" in url or "youtu.be" in url:
        try:
            # Try streamlink first (better for live streams + OpenCV)
            result = subprocess.run(
                ["streamlink", "--stream-url", url, "best"],
                capture_output=True,
                text=True,
                timeout=20
            )
            resolved = result.stdout.strip()
            if resolved and resolved.startswith('http'):
                print(f"✓ Streamlink resolved: {resolved[:80]}...")
                return resolved

            # Fallback to yt-dlp if streamlink not available
            print("Streamlink failed, trying yt-dlp...")
            result = subprocess.run(
                ["yt-dlp", "-f", "best", "-g", url],
                capture_output=True,
                text=True,
                timeout=20
            )
            resolved = result.stdout.strip().split("\n")[0]
            if resolved:
                print(f"✓ yt-dlp resolved: {resolved[:80]}...")
                return resolved

            return url
        except Exception as e:
            print(f"Stream resolution failed: {e}")
            return url
    return url


# =====================================================================
# CUSTOM BOUNDING BOX RENDERING (PART 4)
# =====================================================================

def draw_custom_boxes(frame, result, config: CameraConfig):
    """
    Custom corner-bracket bounding boxes with modern security-ops aesthetic.

    Color palette:
    - Cyan (255, 255, 0) for pedestrians (person, bicycle)
    - Green (0, 255, 0) for cars (car, motorcycle)
    - Amber (0, 191, 255) for large vehicles (bus, truck)
    """
    annotated = frame.copy()

    if result.boxes is None or len(result.boxes) == 0:
        return annotated

    boxes = result.boxes.xyxy.cpu().numpy()
    classes = result.boxes.cls.cpu().numpy() if result.boxes.cls is not None else []
    confs = result.boxes.conf.cpu().numpy() if result.boxes.conf is not None else []

    # Color palette mapping
    color_map = {
        "person": (255, 255, 0),      # Cyan for pedestrians
        "bicycle": (255, 255, 0),      # Cyan for bicycles
        "car": (0, 255, 0),            # Green for cars
        "motorcycle": (0, 255, 0),     # Green for motorcycles
        "bus": (0, 191, 255),          # Amber for large vehicles
        "truck": (0, 191, 255),        # Amber for trucks
    }

    for i, box in enumerate(boxes):
        x1, y1, x2, y2 = map(int, box)
        cls_id = int(classes[i]) if i < len(classes) else -1
        conf = float(confs[i]) if i < len(confs) else 0.0
        class_name = CLASS_MAP.get(cls_id, "object")
        color = color_map.get(class_name, (255, 255, 255))

        # Corner-bracket style (thin, high-contrast)
        corner_len = min(20, (x2 - x1) // 4, (y2 - y1) // 4)
        thickness = 2

        # Draw four corner brackets
        # Top-left
        cv2.line(annotated, (x1, y1), (x1 + corner_len, y1), color, thickness)
        cv2.line(annotated, (x1, y1), (x1, y1 + corner_len), color, thickness)

        # Top-right
        cv2.line(annotated, (x2, y1), (x2 - corner_len, y1), color, thickness)
        cv2.line(annotated, (x2, y1), (x2, y1 + corner_len), color, thickness)

        # Bottom-left
        cv2.line(annotated, (x1, y2), (x1 + corner_len, y2), color, thickness)
        cv2.line(annotated, (x1, y2), (x1, y2 - corner_len), color, thickness)

        # Bottom-right
        cv2.line(annotated, (x2, y2), (x2 - corner_len, y2), color, thickness)
        cv2.line(annotated, (x2, y2), (x2, y2 - corner_len), color, thickness)

        # Semi-transparent label pill
        label = f"{class_name} {conf:.2f}"
        (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)

        # Background pill with padding
        pill_padding = 6
        pill_x1 = x1
        pill_y1 = y1 - text_h - pill_padding * 2 - 2
        pill_x2 = x1 + text_w + pill_padding * 2
        pill_y2 = y1 - 2

        # Draw semi-transparent background (0.6 alpha blend)
        overlay = annotated.copy()
        cv2.rectangle(overlay, (pill_x1, pill_y1), (pill_x2, pill_y2), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.6, annotated, 0.4, 0, annotated)

        # Draw text
        cv2.putText(
            annotated,
            label,
            (x1 + pill_padding, y1 - pill_padding - 4),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            color,
            1,
            cv2.LINE_AA
        )

    return annotated


def draw_corner_box(frame, box, class_name, confidence):
    """Draw single corner-bracket box for SAHI mode"""
    x1, y1, x2, y2 = box
    color = (0, 255, 0)  # Green for vehicles in parking

    corner_len = min(15, (x2 - x1) // 4)
    thickness = 2

    # Four corner brackets
    cv2.line(frame, (x1, y1), (x1 + corner_len, y1), color, thickness)
    cv2.line(frame, (x1, y1), (x1, y1 + corner_len), color, thickness)
    cv2.line(frame, (x2, y1), (x2 - corner_len, y1), color, thickness)
    cv2.line(frame, (x2, y1), (x2, y1 + corner_len), color, thickness)
    cv2.line(frame, (x1, y2), (x1 + corner_len, y2), color, thickness)
    cv2.line(frame, (x1, y2), (x1, y2 - corner_len), color, thickness)
    cv2.line(frame, (x2, y2), (x2 - corner_len, y2), color, thickness)
    cv2.line(frame, (x2, y2), (x2, y2 - corner_len), color, thickness)

    # Label pill
    label = f"{class_name} {confidence:.2f}"
    (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)

    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1 - text_h - 8), (x1 + text_w + 8, y1), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
    cv2.putText(frame, label, (x1 + 4, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1, cv2.LINE_AA)


# =====================================================================
# ROI EXTRACTION FOR SAHI MODE
# =====================================================================

def get_roi_frame_and_mask(frame, polygon):
    """
    Extract ROI with polygon mask for SAHI parking cameras.
    Returns (masked_cropped_frame, (offset_x, offset_y))
    """
    x, y, w, h = cv2.boundingRect(polygon)
    x2, y2 = x + w, y + h
    cropped = frame[y:y2, x:x2].copy()

    # Shift polygon to crop coordinates
    shifted_polygon = polygon - [x, y]
    mask = np.zeros(cropped.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [shifted_polygon], 255)
    masked = cv2.bitwise_and(cropped, cropped, mask=mask)

    return masked, (x, y)


# =====================================================================
# MODE-SPECIFIC PROCESSING
# =====================================================================

def process_tracking_mode(frame, config: CameraConfig, state: CameraState):
    """Process frame using ByteTrack tracking (for traffic cameras)"""
    results = YOLO_MODEL.track(
        frame,
        persist=True,
        classes=config.track_classes,
        conf=config.confidence_threshold,
        imgsz=config.detection_imgsz,
        tracker=config.tracker_config,
        verbose=False
    )

    # Custom bounding box rendering
    annotated = draw_custom_boxes(frame, results[0], config)

    # Update heatmap points
    if results[0].boxes is not None and len(results[0].boxes) > 0:
        h, w = frame.shape[:2]
        xyxy = results[0].boxes.xyxy.cpu().numpy()
        with state.heatmap_lock:
            for box in xyxy:
                cx = (box[0] + box[2]) / 2 / w
                cy = (box[1] + box[3]) / 2 / h
                bw = (box[2] - box[0]) / w
                bh = (box[3] - box[1]) / h
                state.heatmap_points.append({
                    "x": float(cx),
                    "y": float(cy),
                    "w": float(bw),
                    "h": float(bh)
                })

    # Count each tracked object once, and feed this frame's tracked boxes to
    # the crash-candidate detector (needs persistent track IDs, which is why
    # crash detection only runs in tracking mode, not SAHI/parking mode).
    if results[0].boxes is not None and results[0].boxes.id is not None:
        ids = results[0].boxes.id.cpu().numpy()
        clss = results[0].boxes.cls.cpu().numpy()
        xyxy = results[0].boxes.xyxy.cpu().numpy()
        h, w = frame.shape[:2]

        tracked = []
        with state.counts_lock:
            for track_id, cls_id, box in zip(ids, clss, xyxy):
                tid = int(track_id)
                name = CLASS_MAP.get(int(cls_id), "other")
                if tid not in state.seen_track_ids:
                    state.seen_track_ids.add(tid)
                    state.counts[name] = state.counts.get(name, 0) + 1
                tracked.append({
                    "track_id": tid,
                    "class_name": name,
                    "box": (box[0] / w, box[1] / h, box[2] / w, box[3] / h),
                })

        crash_detection.update(config.id, tracked)

    return annotated


def process_sahi_mode(frame, config: CameraConfig, state: CameraState):
    """Process frame using SAHI sliced inference (for parking cameras)"""
    # Crop to ROI polygon
    roi_polygon = np.array(config.roi_polygon, dtype=np.int32)
    roi_frame, (offset_x, offset_y) = get_roi_frame_and_mask(frame, roi_polygon)

    # Run SAHI
    result = get_sliced_prediction(
        roi_frame,
        SAHI_MODEL,
        slice_height=config.slice_height,
        slice_width=config.slice_width,
        overlap_height_ratio=config.overlap_ratio,
        overlap_width_ratio=config.overlap_ratio,
        verbose=0,
    )

    annotated = frame.copy()
    vehicle_count = 0
    h, w = frame.shape[:2]

    for pred in result.object_prediction_list:
        category_name = pred.category.name
        if category_name not in ["car", "motorcycle", "bus", "truck"]:
            continue

        vehicle_count += 1

        # Draw custom corner boxes
        box = pred.bbox.to_xyxy()
        x1 = int(box[0]) + offset_x
        y1 = int(box[1]) + offset_y
        x2 = int(box[2]) + offset_x
        y2 = int(box[3]) + offset_y
        draw_corner_box(annotated, (x1, y1, x2, y2), category_name, pred.score.value)

        # Add heatmap point (normalized coordinates)
        with state.heatmap_lock:
            cx = (x1 + x2) / 2 / w
            cy = (y1 + y2) / 2 / h
            bw = (x2 - x1) / w
            bh = (y2 - y1) / h
            state.heatmap_points.append({
                "x": float(cx),
                "y": float(cy),
                "w": float(bw),
                "h": float(bh)
            })

    # Draw ROI outline
    cv2.polylines(annotated, [roi_polygon], True, (0, 255, 255), 2)

    # Update parking stats
    with state.parking_stats_lock:
        occupied = min(vehicle_count, config.total_parking_spots)
        state.parking_stats = {
            "total_spots": config.total_parking_spots,
            "occupied_spots": occupied,
            "available_spots": max(0, config.total_parking_spots - occupied),
        }

    return annotated


# =====================================================================
# UNIFIED CAMERA WORKER
# =====================================================================

def camera_worker(camera_id: str):
    """Unified camera processing worker for any camera"""
    config = CAMERA_BY_ID[camera_id]
    state = CAMERA_STATES[camera_id]

    print(f"[{camera_id}] Starting camera worker (mode: {config.detection_mode})")

    # Handle webcam indices (like "0" for built-in camera)
    if config.stream_url.isdigit():
        stream_url = int(config.stream_url)
        print(f"[{camera_id}] Opening webcam index: {stream_url}")
    else:
        stream_url = resolve_stream_url(config.stream_url)

    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        print(f"[{camera_id}] ERROR: Could not open stream")
        state.error_message = "Stream connection failed"
        return

    state.is_online = True
    last_process_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            # For local video files, loop back to the beginning
            if isinstance(stream_url, str) and not stream_url.startswith('http'):
                print(f"[{camera_id}] Video file ended, looping back to start...")
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            else:
                # For webcams and network streams, reconnect
                print(f"[{camera_id}] Stream dropped, reconnecting...")
                state.is_online = False
                time.sleep(2)
                cap.release()

                # Re-resolve the stream URL
                if isinstance(stream_url, int):
                    # Webcam - just reopen
                    cap = cv2.VideoCapture(stream_url)
                else:
                    # Network stream - resolve again
                    stream_url = resolve_stream_url(config.stream_url)
                    cap = cv2.VideoCapture(stream_url)
                continue

        state.is_online = True
        state.last_frame_time = time.time()

        # Mode-specific processing with interval control
        now = time.time()
        should_process = (
            config.detection_mode == "tracking" or
            (config.detection_mode == "sahi" and now - last_process_time >= config.process_interval)
        )

        if should_process:
            last_process_time = now

            if config.detection_mode == "tracking":
                annotated = process_tracking_mode(frame, config, state)
            else:  # sahi
                annotated = process_sahi_mode(frame, config, state)

            # Snapshot history every 10s for analytics charts
            if now - state.last_snapshot_time >= 10:
                state.last_snapshot_time = now

                # Get snapshot based on camera mode
                if config.detection_mode == "tracking":
                    # Traffic camera - use counts and calculate flow rate
                    with state.counts_lock:
                        snapshot = dict(state.counts)

                    # Calculate flow rate for this snapshot (PART 3)
                    flow_rate = 0
                    if len(state.history) >= 1:
                        with state.history_lock:
                            if len(state.history) > 0:
                                prev_snapshot = state.history[-1]
                                for cls in ['car', 'bus', 'truck']:
                                    if cls in snapshot and cls in prev_snapshot:
                                        delta = snapshot[cls] - prev_snapshot[cls]
                                        flow_rate += max(0, delta)

                    snapshot['flow_rate'] = flow_rate * 6  # Scale to per-minute (10s intervals)
                else:
                    # Parking camera - use parking stats
                    with state.parking_stats_lock:
                        snapshot = dict(state.parking_stats)

                with state.history_lock:
                    state.history.append({
                        "time": time.strftime("%H:%M:%S"),
                        **snapshot
                    })

            # Encode frame
            ok, jpeg = cv2.imencode(".jpg", annotated)
            if ok:
                with state.frame_lock:
                    state.latest_frame = jpeg.tobytes()

        time.sleep(0.03 if config.detection_mode == "tracking" else 0.05)


# =====================================================================
# STARTUP & ACCESS FUNCTIONS
# =====================================================================

def start_all_cameras():
    """Initialize state and start worker threads for all cameras"""
    load_models()

    for camera_id, config in CAMERA_BY_ID.items():
        # Initialize state
        state = CameraState(camera_id=camera_id)
        if config.detection_mode == "tracking":
            state.counts = {CLASS_MAP[c]: 0 for c in config.track_classes if c in CLASS_MAP}
        CAMERA_STATES[camera_id] = state

        # Start worker thread
        thread = threading.Thread(target=camera_worker, args=(camera_id,), daemon=True)
        thread.start()
        CAMERA_THREADS[camera_id] = thread
        print(f"✓ Started camera: {config.name} ({camera_id})")


def get_camera_state(camera_id: str) -> Optional[CameraState]:
    """Get state object for a camera"""
    return CAMERA_STATES.get(camera_id)


# =====================================================================
# KPI CALCULATIONS (PART 3)
# =====================================================================

def calculate_traffic_kpis(state: CameraState, config: CameraConfig):
    """
    Calculate real-time traffic KPIs from existing detection data.

    Returns:
        {
            "flow_rate": int,            # Unique new vehicles in last 60s
            "occupancy_level": str,      # "Low" | "Moderate" | "Heavy"
            "average_dwell_time": float, # Average seconds per track (pedestrian cameras)
        }
    """
    with state.history_lock:
        recent_history = list(state.history)

    # Flow rate: count new vehicles appearing in last 60s
    # Use history snapshots (each 10s apart, last 6 = 60 seconds)
    flow_rate = 0
    if len(recent_history) >= 2:
        last_6 = recent_history[-6:] if len(recent_history) >= 6 else recent_history
        if len(last_6) >= 2:
            # Delta between first and last snapshot in this 60s window
            first_counts = {k: v for k, v in last_6[0].items() if k != 'time' and k != 'flow_rate'}
            last_counts = {k: v for k, v in last_6[-1].items() if k != 'time' and k != 'flow_rate'}

            for cls in ['car', 'bus', 'truck']:
                if cls in last_counts and cls in first_counts:
                    delta = last_counts[cls] - first_counts[cls]
                    flow_rate += max(0, delta)

    # Occupancy level: qualitative label from current active track count
    with state.counts_lock:
        active_vehicles = sum(state.counts.get(c, 0) for c in ['car', 'bus', 'truck'])

    if config.camera_type == "traffic":
        # Thresholds tuned for traffic cameras (adjust per deployment)
        if active_vehicles < 10:
            occupancy_level = "Low"
        elif active_vehicles < 30:
            occupancy_level = "Moderate"
        else:
            occupancy_level = "Heavy"
    else:
        occupancy_level = "N/A"

    # Average dwell time: placeholder (requires track lifetime tracking)
    average_dwell_time = 0.0

    return {
        "flow_rate": flow_rate,
        "occupancy_level": occupancy_level,
        "average_dwell_time": average_dwell_time,
    }


def calculate_parking_kpis(state: CameraState, config: CameraConfig):
    """
    Calculate parking-specific KPIs from aggregate ROI detection.

    CURRENT IMPLEMENTATION: Aggregate ROI approach (single polygon covering all spots)
    - Counts total vehicles in ROI via SAHI sliced inference
    - No per-spot polygon calibration (would require individual spot regions)

    Metrics computable with current data:
    ✅ free_spaces: Total - occupied (already computed)
    ✅ occupancy_rate: occupied / total × 100
    ✅ occupancy_level: Low (<60%), Moderate (60-90%), Saturated (>90%)
       ^ Standard three-tier classification from parking analytics literature
    ✅ occupancy_trend: Historical % from snapshot history

    Metrics requiring per-spot tracking (NOT implemented):
    ❌ per_spot_status: Individual spot free/occupied grid (requires spot polygons)
    ❌ average_duration: Avg parking time per spot (requires spot-level dwell tracking)
    ❌ turnover_rate: Vehicles per spot per hour (requires duration data)

    Returns:
        {
            "free_spaces": int,
            "occupied_spaces": int,
            "total_spaces": int,
            "occupancy_rate": float,       # Percentage (0-100)
            "occupancy_level": str,        # "Low" | "Moderate" | "Saturated"
            "occupancy_trend": [            # Recent occupancy % history
                {"time": "HH:MM:SS", "occupancy_rate": float},
                ...
            ],
            "per_spot_available": bool,    # False (not implemented)
            "turnover_available": bool,    # False (not implemented)
        }
    """
    with state.parking_stats_lock:
        parking_stats = dict(state.parking_stats)

    # Extract current counts (from latest SAHI detection)
    total_spots = parking_stats.get("total_spots", 0)
    occupied = parking_stats.get("occupied_spots", 0)
    available = parking_stats.get("available_spots", 0)

    # Occupancy rate as percentage
    occupancy_rate = (occupied / total_spots * 100) if total_spots > 0 else 0.0

    # Occupancy level classification (standard parking literature thresholds)
    if occupancy_rate < 60:
        occupancy_level = "Low"
    elif occupancy_rate < 90:
        occupancy_level = "Moderate"
    else:
        occupancy_level = "Saturated"

    # Occupancy trend: extract occupancy % from history snapshots
    # History stores parking_stats snapshots every 10s
    occupancy_trend = []
    with state.history_lock:
        for snapshot in list(state.history):
            if "occupied_spots" in snapshot and "total_spots" in snapshot:
                ts = snapshot.get("time", "")
                occ = snapshot.get("occupied_spots", 0)
                tot = snapshot.get("total_spots", 1)
                rate = (occ / tot * 100) if tot > 0 else 0.0
                occupancy_trend.append({
                    "time": ts,
                    "occupancy_rate": round(rate, 1)
                })

    return {
        "free_spaces": available,
        "occupied_spaces": occupied,
        "total_spaces": total_spots,
        "occupancy_rate": round(occupancy_rate, 1),
        "occupancy_level": occupancy_level,
        "occupancy_trend": occupancy_trend,

        # Feature availability flags (for UI conditional rendering)
        "per_spot_available": False,  # Requires per-spot polygon calibration
        "turnover_available": False,  # Requires per-spot dwell tracking
    }
