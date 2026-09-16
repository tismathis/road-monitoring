"""
Camera Configuration Registry
==============================
Central configuration defining all cameras in the road monitoring system.

Adding a new camera is as simple as adding a CameraConfig entry to the CAMERAS list.
No code changes required elsewhere.
"""

from dataclasses import dataclass, field
from typing import Literal, List, Optional, Tuple


@dataclass
class CameraConfig:
    """Configuration for a single camera in the system"""

    # Core identification
    id: str                          # Unique identifier (e.g., "traffic_01", "parking_gaborone_main")
    name: str                        # Display name (e.g., "Main Street Traffic")
    location_label: str              # Human-readable location (e.g., "Gaborone Main St & Independence Ave")
    stream_url: str                  # YouTube URL or RTSP stream
    camera_type: Literal["traffic", "parking", "pedestrian"]
    detection_mode: Literal["tracking", "sahi"]

    # Detection parameters
    confidence_threshold: float = 0.12
    detection_imgsz: int = 1920
    track_classes: Optional[List[int]] = None  # COCO class IDs to track

    # SAHI-specific params (only used if detection_mode == "sahi")
    roi_polygon: Optional[List[Tuple[int, int]]] = None  # [(x1,y1), (x2,y2), ...] for parking ROI
    slice_height: int = 640
    slice_width: int = 640
    overlap_ratio: float = 0.2
    process_interval: float = 2.0    # Seconds between SAHI inference (slow mode for parked cars)

    # Tracking-specific params (only used if detection_mode == "tracking")
    tracker_config: str = "custom_bytetrack.yaml"

    # Map position for frontend
    position: Tuple[float, float] = (0.0, 0.0)  # (lat, lng)

    # Metadata
    total_parking_spots: Optional[int] = None  # Only for parking cameras


# =====================================================================
# CENTRAL CAMERA REGISTRY
# =====================================================================
# Modify this list to add/remove cameras from the system

CAMERAS: List[CameraConfig] = [
    # Traffic Camera - Main Street Gaborone
    CameraConfig(
        id="traffic_main_gaborone",
        name="Gaborone Main Traffic",
        location_label="Main St & Independence Ave",
        stream_url="https://www.youtube.com/watch?v=gTO_FJzv70k",
        camera_type="traffic",
        detection_mode="tracking",
        confidence_threshold=0.12,
        detection_imgsz=1920,
        track_classes=[0, 1, 2, 3, 5, 7],  # person, bicycle, car, motorcycle, bus, truck
        tracker_config="custom_bytetrack.yaml",
        position=(-24.6282, 25.9231),
    ),

    # Parking Lot Camera - CBD Parking
    CameraConfig(
        id="parking_gaborone_lot1",
        name="Main Parking Lot",
        location_label="Gaborone CBD Parking",
        stream_url="https://www.youtube.com/watch?v=EPKWu223XEg",
        camera_type="parking",
        detection_mode="sahi",
        confidence_threshold=0.15,
        track_classes=[2, 3, 5, 7],  # car, motorcycle, bus, truck
        roi_polygon=[(450, 250), (600, 250), (1900, 1000), (1500, 1100)],  # Original perfect ROI
        slice_height=640,
        slice_width=640,
        overlap_ratio=0.2,
        process_interval=2.0,
        total_parking_spots=19,
        position=(-24.6290, 25.9240),
    ),
]


# Build lookup dict for O(1) access by ID
CAMERA_BY_ID = {cam.id: cam for cam in CAMERAS}


# COCO class mapping (shared across all cameras)
CLASS_MAP = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}
