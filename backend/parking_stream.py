"""
Parking Lot Stream Processing Module - YOLOv8 Based
====================================================
This module handles live streaming from a YouTube parking lot camera
and uses YOLOv8 to detect cars directly (no mask required).

How it works:
- Stream video from YouTube
- Use YOLOv8 to detect cars in each frame
- Count detected cars as occupied spots
- Calculate available spots = total - occupied
- Draw bounding boxes and display statistics

This approach works with ANY camera angle!
"""

import cv2
import threading
import time
import subprocess
from ultralytics import YOLO
import numpy as np

# =====================================================================
# CONFIGURATION SECTION
# =====================================================================

# YouTube live stream URL for the parking lot camera
PARKING_YOUTUBE_URL = 'https://www.youtube.com/watch?v=EPKWu223XEg'

# Total number of parking spots in this lot
# Adjust this value to match your actual parking lot capacity
TOTAL_PARKING_SPOTS = 50

# YOLOv8 model to use for car detection
# Options: yolov8n.pt (fastest), yolov8s.pt, yolov8m.pt, yolov8l.pt, yolov8x.pt (most accurate)
YOLO_MODEL = "yolov8n.pt"  # Nano model - fast and good enough for parking detection

# Detection confidence threshold (0.0 - 1.0)
# Lower = more detections (but more false positives)
# Higher = fewer detections (but more misses)
CONFIDENCE_THRESHOLD = 0.35

# COCO classes for vehicles
# We'll only detect these classes in the parking lot
VEHICLE_CLASSES = {
    2: "car",        # Regular cars
    3: "motorcycle", # Motorcycles
    5: "bus",        # Buses
    7: "truck"       # Trucks
}

# =====================================================================
# GLOBAL STATE VARIABLES
# =====================================================================

# Stores the latest processed frame as JPEG bytes for streaming
latest_parking_frame = None

# Thread lock to prevent race conditions when accessing the frame
parking_frame_lock = threading.Lock()

# Parking statistics: total spots and available spots
parking_stats = {
    "total_spots": TOTAL_PARKING_SPOTS,
    "available_spots": TOTAL_PARKING_SPOTS,  # Initially all available
    "occupied_spots": 0
}

# Thread lock for safe access to parking statistics
parking_stats_lock = threading.Lock()

# Load YOLOv8 model at module initialization
print(f"Loading YOLOv8 model: {YOLO_MODEL}...")
model = YOLO(YOLO_MODEL)
print(f"✓ YOLOv8 model loaded successfully")

# =====================================================================
# YOUTUBE STREAM HANDLING
# =====================================================================

def resolve_youtube_url(youtube_url):
    """
    Resolve a YouTube URL to a direct stream URL using yt-dlp.

    Args:
        youtube_url: YouTube video/live stream URL

    Returns:
        Direct stream URL that can be opened by OpenCV

    Why we need this:
    - OpenCV can't directly open YouTube URLs
    - yt-dlp extracts the actual video stream URL
    - The -g flag gets the URL without downloading
    """
    try:
        print(f"Resolving YouTube URL: {youtube_url}")

        # Run yt-dlp to get the direct stream URL
        # -g: Get URL only, don't download
        # timeout=20: Don't wait forever if it fails
        result = subprocess.run(
            ["yt-dlp", "-g", youtube_url],
            capture_output=True,
            text=True,
            timeout=20
        )

        # Get the first line of output (the stream URL)
        resolved_url = result.stdout.strip().split("\n")[0]

        if resolved_url:
            print(f"✓ Stream URL resolved successfully")
            return resolved_url
        else:
            print("✗ Failed to resolve stream URL")
            return youtube_url

    except Exception as e:
        print(f"✗ Error resolving YouTube URL: {e}")
        return youtube_url


# =====================================================================
# YOLO DETECTION AND PROCESSING
# =====================================================================

def detect_vehicles(frame):
    """
    Detect vehicles in a frame using YOLOv8.

    Args:
        frame: OpenCV BGR image

    Returns:
        Tuple of (annotated_frame, vehicle_count)

    Process:
    1. Run YOLOv8 inference on the frame
    2. Filter detections to only vehicle classes
    3. Draw bounding boxes on the frame
    4. Count total vehicles detected
    """

    # Run YOLOv8 inference
    # - conf: Confidence threshold
    # - classes: List of class IDs to detect (vehicles only)
    # - verbose: Don't print detection info to console
    results = model(
        frame,
        conf=CONFIDENCE_THRESHOLD,
        classes=list(VEHICLE_CLASSES.keys()),
        verbose=False
    )

    # Get annotated frame with bounding boxes
    # YOLOv8's plot() method draws boxes, labels, and confidence scores
    annotated_frame = results[0].plot()

    # Count vehicles detected
    vehicle_count = 0
    if results[0].boxes is not None:
        vehicle_count = len(results[0].boxes)

    return annotated_frame, vehicle_count


def add_parking_info_overlay(frame, occupied_count, available_count, total_count):
    """
    Add parking statistics overlay to the frame.

    Args:
        frame: OpenCV BGR image
        occupied_count: Number of occupied spots (cars detected)
        available_count: Number of available spots
        total_count: Total parking spots

    Returns:
        Frame with overlay added

    Visual design:
    - Semi-transparent black background for readability
    - White text for total count
    - Green text for available spots
    - Red text for occupied spots
    """

    # Create semi-transparent overlay background
    overlay = frame.copy()
    cv2.rectangle(overlay, (10, 10), (400, 150), (0, 0, 0), -1)  # Filled black rectangle

    # Blend overlay with original frame (alpha blending)
    alpha = 0.7  # Transparency: 0 = transparent, 1 = opaque
    frame = cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0)

    # Add text with statistics
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.8
    thickness = 2

    # Total spots (white text)
    cv2.putText(
        frame,
        f"Total Spots: {total_count}",
        (20, 45),
        font,
        font_scale,
        (255, 255, 255),  # White
        thickness
    )

    # Available spots (green text)
    cv2.putText(
        frame,
        f"Available: {available_count}",
        (20, 85),
        font,
        font_scale,
        (0, 255, 0),  # Green
        thickness
    )

    # Occupied spots (red text)
    cv2.putText(
        frame,
        f"Occupied: {occupied_count}",
        (20, 125),
        font,
        font_scale,
        (0, 0, 255),  # Red
        thickness
    )

    return frame


# =====================================================================
# MAIN PARKING PROCESSING THREAD
# =====================================================================

def parking_camera_worker():
    """
    Main worker thread that processes the parking lot video stream.

    This function runs continuously in the background:
    1. Opens the YouTube stream
    2. Reads frames one by one
    3. Uses YOLOv8 to detect vehicles (cars, trucks, motorcycles, buses)
    4. Counts occupied spots (number of vehicles detected)
    5. Calculates available spots (total - occupied)
    6. Annotates the frame with bounding boxes and statistics
    7. Updates global state for streaming to frontend

    The beauty of this approach:
    - No mask required!
    - Works with any camera angle
    - Automatically adapts to different parking lot layouts
    - Uses state-of-the-art object detection
    """
    global latest_parking_frame, parking_stats

    print("=" * 70)
    print("PARKING LOT MONITORING - YOLOv8 BASED")
    print("=" * 70)
    print(f"Total Parking Spots: {TOTAL_PARKING_SPOTS}")
    print(f"YOLOv8 Model: {YOLO_MODEL}")
    print(f"Confidence Threshold: {CONFIDENCE_THRESHOLD}")
    print(f"Vehicle Classes: {list(VEHICLE_CLASSES.values())}")
    print("=" * 70)

    # Resolve YouTube URL to direct stream URL
    stream_url = resolve_youtube_url(PARKING_YOUTUBE_URL)

    # Open video stream with OpenCV
    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        print("✗ Error: Could not open parking stream")
        return

    print("✓ Parking stream opened successfully - starting YOLOv8 detection loop")

    # Frame processing counter for logging
    frame_count = 0

    # Main processing loop
    while True:
        # Read one frame from the stream
        ret, frame = cap.read()

        if not ret:
            # Stream dropped - reconnect after delay
            print("Stream dropped - reconnecting in 2 seconds...")
            time.sleep(2)
            cap.release()

            # Re-resolve URL (YouTube URLs expire periodically)
            stream_url = resolve_youtube_url(PARKING_YOUTUBE_URL)
            cap = cv2.VideoCapture(stream_url)
            continue

        # Detect vehicles using YOLOv8
        # This returns the frame with bounding boxes drawn and the count of vehicles
        annotated_frame, vehicle_count = detect_vehicles(frame)

        # Calculate parking statistics
        occupied_count = min(vehicle_count, TOTAL_PARKING_SPOTS)  # Can't exceed total
        available_count = max(0, TOTAL_PARKING_SPOTS - occupied_count)  # Can't be negative

        # Update global parking statistics (thread-safe)
        with parking_stats_lock:
            parking_stats["occupied_spots"] = occupied_count
            parking_stats["available_spots"] = available_count

        # Add parking info overlay to the frame
        annotated_frame = add_parking_info_overlay(
            annotated_frame,
            occupied_count,
            available_count,
            TOTAL_PARKING_SPOTS
        )

        # Encode frame as JPEG for streaming
        ok, jpeg = cv2.imencode(".jpg", annotated_frame)

        if ok:
            # Update global frame with thread safety
            with parking_frame_lock:
                latest_parking_frame = jpeg.tobytes()

        # Logging: Print stats every 30 frames (~1 second at 30fps)
        frame_count += 1
        if frame_count % 30 == 0:
            print(f"[Frame {frame_count}] Vehicles detected: {vehicle_count} | "
                  f"Occupied: {occupied_count} | Available: {available_count}")

        # Small delay to control processing rate (~30 FPS)
        time.sleep(0.03)


# =====================================================================
# PUBLIC API FUNCTIONS
# =====================================================================

def start_parking_thread():
    """
    Start the parking processing thread as a daemon.

    Called once at server startup.
    Daemon=True means the thread will automatically stop when the main program exits.
    """
    print("\n🚗 Starting YOLOv8-based parking detection thread...")
    threading.Thread(target=parking_camera_worker, daemon=True).start()


def get_latest_parking_frame():
    """
    Get the most recent processed parking frame.

    Returns:
        JPEG-encoded frame as bytes, or None if not available

    Thread-safe: uses lock to prevent race conditions
    """
    with parking_frame_lock:
        return latest_parking_frame


def get_parking_stats():
    """
    Get current parking statistics.

    Returns:
        Dict with total_spots, available_spots, occupied_spots

    Thread-safe: uses lock to prevent race conditions
    """
    with parking_stats_lock:
        return dict(parking_stats)
