import cv2
import threading
import time
import subprocess
from ultralytics import YOLO
import time as time_module
from collections import deque

history = deque(maxlen=60)  # keeps the last 60 snapshots
history_lock = threading.Lock()
last_snapshot_time = 0

heatmap_points = deque(maxlen=80)  # recent detection positions, normalized 0-1
heatmap_lock = threading.Lock()

# ---- CONFIG: put your live camera link here ----
CAMERA_URL = "https://www.youtube.com/watch?v=gTO_FJzv70k"

model = YOLO("yolov8m.pt")

CLASS_MAP = {0: "person", 1: "bicycle", 2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}
TRACK_CLASSES = list(CLASS_MAP.keys())

latest_frame = None
frame_lock = threading.Lock()

counts = {name: 0 for name in CLASS_MAP.values()}
counts_lock = threading.Lock()
seen_track_ids = set()


def resolve_stream_url(url):
    """If it's a YouTube link, resolve it to a direct stream URL yt-dlp can read."""
    if "youtube.com" in url or "youtu.be" in url:
        try:
            result = subprocess.run(["yt-dlp", "-g", url], capture_output=True, text=True, timeout=20)
            resolved = result.stdout.strip().split("\n")[0]
            return resolved if resolved else url
        except Exception as e:
            print("Could not resolve YouTube URL:", e)
            return url
    return url


def camera_worker():
    global latest_frame
    stream_url = resolve_stream_url(CAMERA_URL)
    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        print("ERROR: could not open camera stream — check CAMERA_URL")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            # Stream dropped — reconnect (re-resolving handles expired YouTube URLs)
            time.sleep(2)
            cap.release()
            stream_url = resolve_stream_url(CAMERA_URL)
            cap = cv2.VideoCapture(stream_url)
            continue

        results = model.track(frame, persist=True, classes=TRACK_CLASSES, conf=0.15, imgsz=1280, verbose=False)
        annotated = results[0].plot()
        
        if results[0].boxes is not None and len(results[0].boxes) > 0:
            h, w = frame.shape[:2]
            xyxy = results[0].boxes.xyxy.cpu().numpy()
            with heatmap_lock:
                for box in xyxy:
                    cx = (box[0] + box[2]) / 2 / w
                    cy = (box[1] + box[3]) / 2 / h
                    bw = (box[2] - box[0]) / w
                    bh = (box[3] - box[1]) / h
                    heatmap_points.append({"x": float(cx), "y": float(cy), "w": float(bw), "h": float(bh)})
                    
        # Count each tracked object once, the first time its ID appears
        if results[0].boxes is not None and results[0].boxes.id is not None:
            ids = results[0].boxes.id.cpu().numpy()
            clss = results[0].boxes.cls.cpu().numpy()
            with counts_lock:
                for track_id, cls_id in zip(ids, clss):
                    tid = int(track_id)
                    if tid not in seen_track_ids:
                        seen_track_ids.add(tid)
                        name = CLASS_MAP.get(int(cls_id), "other")
                        counts[name] = counts.get(name, 0) + 1
            # Log a snapshot every 10 seconds for the analytics chart
        global last_snapshot_time
        now = time_module.time()
        if now - last_snapshot_time >= 10:
            last_snapshot_time = now
            with counts_lock:
                snapshot = dict(counts)
            with history_lock:
                history.append({"time": time_module.strftime("%H:%M:%S"), **snapshot})

        ok, jpeg = cv2.imencode(".jpg", annotated)
        if ok:
            with frame_lock:
                latest_frame = jpeg.tobytes()

        time.sleep(0.03)  # roughly caps processing rate


def start_camera_thread():
    threading.Thread(target=camera_worker, daemon=True).start()


def get_latest_frame():
    with frame_lock:
        return latest_frame


def get_counts():
    with counts_lock:
        return dict(counts)
    
def get_heatmap_points():
    with heatmap_lock:
        return list(heatmap_points)
    
def get_history():
    with history_lock:
        return list(history)