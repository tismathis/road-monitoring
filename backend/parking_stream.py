"""
Parking Lot Stream Processing Module - YOLO26 + SAHI Based
====================================================
This module handles live streaming from a YouTube parking lot camera
and uses YOLO26 combined with SAHI (Slicing Aided Hyper Inference) to
detect small/distant parked cars that standard single-pass detection misses.

How it works:
- Stream video from YouTube
- Crop each frame down to a polygon-shaped Region of Interest (ROI) that
  follows the actual angled parking row — a plain rectangle either cuts
  off spots or includes a wedge of road, so we use a custom shape instead
- Black out everything inside the crop that falls outside that polygon,
  so only real parking-spot pixels are ever analyzed
- Slice that masked region into overlapping tiles and run YOLO26 on each
  tile (SAHI), since small/distant cars get lost when a whole frame is
  resized down for standard inference
- Merge tile-level detections back into full-frame coordinates
- Count detected vehicles within the ROI as occupied spots
- Calculate available spots = total - occupied
- Draw bounding boxes and display statistics
"""

import cv2
import numpy as np
import threading
import time
import subprocess
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction

# =====================================================================
# CONFIGURATION SECTION
# =====================================================================

# YouTube live stream URL for the parking lot camera
PARKING_YOUTUBE_URL = 'https://www.youtube.com/watch?v=EPKWu223XEg'

# Total number of parking spots in this lot
TOTAL_PARKING_SPOTS = 19

# YOLO26 model to use for car detection (via SAHI)
YOLO_MODEL = "yolo26n.pt"

# Detection confidence threshold (0.0 - 1.0)
# Lower than a plain single-pass setup since cropping+slicing already
# reduces false positives from irrelevant background, so we can afford
# to catch more borderline-confidence real detections
CONFIDENCE_THRESHOLD = 0.15

# COCO classes for vehicles we care about
VEHICLE_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}
VEHICLE_CLASS_NAMES = list(VEHICLE_CLASSES.values())

# ---- Region of Interest (ROI) — polygon shape, not a rectangle ----
# Points trace the actual parking-spot area, following the diagonal
# angle of the spots. Go roughly clockwise, starting from the top-left
# of the parking row.
# TUNE THESE to match your specific camera's parking-spot area — adjust
# each point, restart, and check the drawn outline against the real feed.
ROI_POLYGON = np.array([
    (450, 250),   # top-left
    (600, 250),  # top-right
    (1900, 1000),  # bottom-right
    (1500, 1100),  # bottom-left
], dtype=np.int32)

# ---- SAHI slicing settings ----
SLICE_HEIGHT = 640
SLICE_WIDTH = 640
OVERLAP_HEIGHT_RATIO = 0.2
OVERLAP_WIDTH_RATIO = 0.2

# Since SAHI runs the detector multiple times per frame (once per tile),
# it's meaningfully slower than single-pass inference. Parked cars don't
# move between checks, so we process at a slower interval rather than
# trying to hit full video frame rate.
PROCESS_EVERY_N_SECONDS = 2.0

# =====================================================================
# GLOBAL STATE VARIABLES
# =====================================================================

latest_parking_frame = None
parking_frame_lock = threading.Lock()

parking_stats = {
    "total_spots": TOTAL_PARKING_SPOTS,
    "available_spots": TOTAL_PARKING_SPOTS,
    "occupied_spots": 0
}
parking_stats_lock = threading.Lock()

# Load the SAHI-wrapped YOLO26 model once at module initialization
print(f"Loading YOLO26 model via SAHI: {YOLO_MODEL}...")
detection_model = AutoDetectionModel.from_pretrained(
    model_type="ultralytics",
    model_path=YOLO_MODEL,
    confidence_threshold=CONFIDENCE_THRESHOLD,
    device="cpu",
)
print("✓ YOLO26 + SAHI model loaded successfully")

# =====================================================================
# YOUTUBE STREAM HANDLING
# =====================================================================

def resolve_youtube_url(youtube_url):
    """
    Resolve a YouTube URL to a direct stream URL using yt-dlp.
    OpenCV can't open YouTube URLs directly; yt-dlp extracts the real
    underlying stream URL. The -g flag gets the URL without downloading.
    """
    try:
        print(f"Resolving YouTube URL: {youtube_url}")
        result = subprocess.run(
            ["yt-dlp", "-g", youtube_url],
            capture_output=True,
            text=True,
            timeout=20
        )
        resolved_url = result.stdout.strip().split("\n")[0]
        if resolved_url:
            print("✓ Stream URL resolved successfully")
            return resolved_url
        else:
            print("✗ Failed to resolve stream URL")
            return youtube_url
    except Exception as e:
        print(f"✗ Error resolving YouTube URL: {e}")
        return youtube_url


# =====================================================================
# ROI CROPPING (polygon-based)
# =====================================================================

def get_roi_bounding_box(polygon):
    """
    Smallest axis-aligned rectangle that fully contains the polygon.
    SAHI needs a rectangular image to slice, so we crop to this box
    first, then mask out the non-polygon parts within it.
    """
    x, y, w, h = cv2.boundingRect(polygon)
    return x, y, x + w, y + h


def get_roi_frame_and_mask(frame, polygon):
    """
    Crop to the polygon's bounding box, then black out everything in
    that crop that falls OUTSIDE the actual polygon shape — so YOLO
    only "sees" the parking spots themselves, not the road wedge that
    a plain rectangular crop would otherwise include.

    Returns:
        (masked_cropped_frame, (offset_x, offset_y))
        The offset is needed later to convert detection box coordinates
        (relative to this crop) back into full-frame coordinates.
    """
    x1, y1, x2, y2 = get_roi_bounding_box(polygon)
    cropped = frame[y1:y2, x1:x2].copy()

    # Shift polygon points to be relative to the crop's own coordinate
    # space, then build a mask: white (255) inside the polygon, black
    # (0) everywhere else
    shifted_polygon = polygon - [x1, y1]
    mask = np.zeros(cropped.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [shifted_polygon], 255)

    # Keep pixels inside the polygon, black out everything else
    masked = cv2.bitwise_and(cropped, cropped, mask=mask)

    return masked, (x1, y1)


# =====================================================================
# YOLO26 + SAHI DETECTION AND PROCESSING
# =====================================================================

def detect_vehicles_sahi(frame):
    """
    Detect vehicles within the polygon ROI using SAHI sliced inference.

    Args:
        frame: full-size OpenCV BGR image (the raw incoming frame)

    Returns:
        Tuple of (annotated_full_frame, vehicle_count)
    """
    roi_frame, (offset_x, offset_y) = get_roi_frame_and_mask(frame, ROI_POLYGON)

    result = get_sliced_prediction(
        roi_frame,
        detection_model,
        slice_height=SLICE_HEIGHT,
        slice_width=SLICE_WIDTH,
        overlap_height_ratio=OVERLAP_HEIGHT_RATIO,
        overlap_width_ratio=OVERLAP_WIDTH_RATIO,
        verbose=0,
    )

    annotated_frame = frame.copy()
    vehicle_count = 0

    for pred in result.object_prediction_list:
        category_name = pred.category.name
        if category_name not in VEHICLE_CLASS_NAMES:
            continue  # SAHI/YOLO may detect other COCO classes we don't want

        vehicle_count += 1

        # Box coordinates are relative to the cropped ROI — offset them
        # back into full-frame pixel coordinates for drawing
        box = pred.bbox.to_xyxy()
        x1 = int(box[0]) + offset_x
        y1 = int(box[1]) + offset_y
        x2 = int(box[2]) + offset_x
        y2 = int(box[3]) + offset_y

        confidence = pred.score.value
        label = f"{category_name} {confidence:.2f}"

        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(annotated_frame, (x1, y1 - text_h - 8), (x1 + text_w + 4, y1), (0, 255, 0), -1)
        cv2.putText(annotated_frame, label, (x1 + 2, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)

    # Draw the polygon outline (not a rectangle) so you can see exactly
    # what's being analyzed — useful while tuning ROI_POLYGON's points
    cv2.polylines(annotated_frame, [ROI_POLYGON], isClosed=True, color=(255, 200, 0), thickness=2)

    return annotated_frame, vehicle_count


def add_parking_info_overlay(frame, occupied_count, available_count, total_count):
    """
    Add parking statistics overlay to the frame.
    Semi-transparent black background; white/green/red text for
    total/available/occupied counts.
    """
    overlay = frame.copy()
    cv2.rectangle(overlay, (10, 10), (400, 150), (0, 0, 0), -1)

    alpha = 0.7
    frame = cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0)

    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.8
    thickness = 2

    cv2.putText(frame, f"Total Spots: {total_count}", (20, 45),
                font, font_scale, (255, 255, 255), thickness)
    cv2.putText(frame, f"Available: {available_count}", (20, 85),
                font, font_scale, (0, 255, 0), thickness)
    cv2.putText(frame, f"Occupied: {occupied_count}", (20, 125),
                font, font_scale, (0, 0, 255), thickness)

    return frame


# =====================================================================
# MAIN PARKING PROCESSING THREAD
# =====================================================================

def parking_camera_worker():
    """
    Main worker thread that processes the parking lot video stream,
    using polygon ROI cropping + SAHI sliced inference for reliable
    detection of small/distant parked cars.
    """
    global latest_parking_frame, parking_stats

    print("=" * 70)
    print("PARKING LOT MONITORING - YOLO26 + SAHI BASED")
    print("=" * 70)
    print(f"Total Parking Spots: {TOTAL_PARKING_SPOTS}")
    print(f"YOLO Model: {YOLO_MODEL}")
    print(f"Confidence Threshold: {CONFIDENCE_THRESHOLD}")
    print(f"ROI Polygon points: {ROI_POLYGON.tolist()}")
    print(f"Slice size: {SLICE_WIDTH}x{SLICE_HEIGHT}")
    print(f"Vehicle Classes: {VEHICLE_CLASS_NAMES}")
    print("=" * 70)

    stream_url = resolve_youtube_url(PARKING_YOUTUBE_URL)
    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        print("✗ Error: Could not open parking stream")
        return

    print("✓ Parking stream opened successfully - starting detection loop")

    frame_count = 0
    last_process_time = 0

    while True:
        ret, frame = cap.read()

        if not ret:
            print("Stream dropped - reconnecting in 2 seconds...")
            time.sleep(2)
            cap.release()
            stream_url = resolve_youtube_url(PARKING_YOUTUBE_URL)
            cap = cv2.VideoCapture(stream_url)
            continue

        now = time.time()
        # Only run the (slower) SAHI detection every N seconds — parked
        # cars don't move between checks, so we don't need every frame
        if now - last_process_time >= PROCESS_EVERY_N_SECONDS:
            last_process_time = now

            annotated_frame, vehicle_count = detect_vehicles_sahi(frame)

            occupied_count = min(vehicle_count, TOTAL_PARKING_SPOTS)
            available_count = max(0, TOTAL_PARKING_SPOTS - occupied_count)

            with parking_stats_lock:
                parking_stats["occupied_spots"] = occupied_count
                parking_stats["available_spots"] = available_count

            annotated_frame = add_parking_info_overlay(
                annotated_frame, occupied_count, available_count, TOTAL_PARKING_SPOTS
            )

            ok, jpeg = cv2.imencode(".jpg", annotated_frame)
            if ok:
                with parking_frame_lock:
                    latest_parking_frame = jpeg.tobytes()

            frame_count += 1
            print(f"[Check {frame_count}] Vehicles detected: {vehicle_count} | "
                  f"Occupied: {occupied_count} | Available: {available_count}")

        # Small delay to avoid a tight busy-loop reading frames faster
        # than needed between processing checks
        time.sleep(0.05)


# =====================================================================
# PUBLIC API FUNCTIONS
# =====================================================================

def start_parking_thread():
    print("\n🚗 Starting YOLO26 + SAHI parking detection thread...")
    threading.Thread(target=parking_camera_worker, daemon=True).start()


def get_latest_parking_frame():
    with parking_frame_lock:
        return latest_parking_frame


def get_parking_stats():
    with parking_stats_lock:
        return dict(parking_stats)