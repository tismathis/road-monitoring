from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
from fastapi.responses import StreamingResponse

import time

# Import unified camera manager
from camera_manager import start_all_cameras, get_camera_state, CAMERA_STATES, calculate_traffic_kpis, calculate_parking_kpis
from camera_config import CAMERAS, CAMERA_BY_ID

# Import authentication router and dependencies
from auth import router as auth_router
from auth_utils import get_current_user, require_role, require_role_query
from models import UserResponse


app = FastAPI()

@app.on_event("startup")
def startup_event():
    """
    Initialize all camera workers from the CAMERAS registry.
    Loads YOLO models once and starts worker threads for each camera.
    """
    start_all_cameras()

# Register authentication router
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# =====================================================================
# GENERIC MULTI-CAMERA ENDPOINTS
# =====================================================================

@app.get("/cameras", dependencies=[Depends(require_role(["operator", "admin"]))])
def list_cameras():
    """
    Get list of all cameras with status and stats preview.

    Returns:
        [
            {
                "id": "traffic_main_gaborone",
                "name": "Gaborone Main Traffic",
                "location": "Main St & Independence Ave",
                "type": "traffic",
                "position": [-24.6282, 25.9231],
                "is_online": true,
                "last_frame_time": 1694123456.789,
                "thumbnail_url": "/cameras/traffic_main_gaborone/stream",
                "stats_preview": {"car": 45, "person": 12}
            }
        ]
    """
    result = []
    for cam_id, config in CAMERA_BY_ID.items():
        state = get_camera_state(cam_id)

        stats_preview = {}
        if state:
            with state.counts_lock:
                stats_preview = dict(state.counts)

        result.append({
            "id": config.id,
            "name": config.name,
            "location": config.location_label,
            "type": config.camera_type,
            "position": list(config.position),
            "is_online": state.is_online if state else False,
            "last_frame_time": state.last_frame_time if state else 0,
            "thumbnail_url": f"/cameras/{cam_id}/stream",
            "stats_preview": stats_preview,
        })

    return result


def camera_mjpeg_generator(camera_id: str):
    """Generic MJPEG stream generator for any camera"""
    state = get_camera_state(camera_id)
    if not state:
        yield b''
        return

    while True:
        with state.frame_lock:
            frame = state.latest_frame

        if frame is not None:
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        time.sleep(0.05)


@app.get("/cameras/{camera_id}/stream")
def generic_camera_stream(
    camera_id: str,
    user: UserResponse = Depends(require_role_query(["operator", "admin"]))
):
    """
    Stream from any camera by ID. Auth via query param: ?token=<jwt>

    Usage: /cameras/traffic_main_gaborone/stream?token=<jwt>
    """
    if camera_id not in CAMERA_BY_ID:
        return {"error": "Camera not found"}

    return StreamingResponse(
        camera_mjpeg_generator(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/cameras/{camera_id}/stats", dependencies=[Depends(require_role(["operator", "admin"]))])
def generic_camera_stats(camera_id: str):
    """Get detection stats for a camera"""
    state = get_camera_state(camera_id)
    if not state:
        return {"error": "Camera not found"}

    config = CAMERA_BY_ID[camera_id]

    # Return counts for tracking mode, parking stats for sahi mode
    if config.detection_mode == "tracking":
        with state.counts_lock:
            return dict(state.counts)
    else:  # sahi / parking
        with state.parking_stats_lock:
            return dict(state.parking_stats)


@app.get("/cameras/{camera_id}/history", dependencies=[Depends(require_role(["operator", "admin"]))])
def generic_camera_history(camera_id: str):
    """Get history snapshots for a camera"""
    state = get_camera_state(camera_id)
    if not state:
        return []

    with state.history_lock:
        return list(state.history)


@app.get("/cameras/{camera_id}/heatmap-points", dependencies=[Depends(require_role(["operator", "admin"]))])
def generic_camera_heatmap(camera_id: str):
    """Get heatmap points for a camera"""
    state = get_camera_state(camera_id)
    if not state:
        return []

    with state.heatmap_lock:
        return list(state.heatmap_points)


@app.get("/cameras/{camera_id}/kpis", dependencies=[Depends(require_role(["operator", "admin"]))])
def generic_camera_kpis(camera_id: str):
    """
    Get calculated KPIs for any camera type.

    Dispatches to:
    - calculate_parking_kpis() for parking cameras (occupancy %, level, trend)
    - calculate_traffic_kpis() for traffic cameras (flow rate, occupancy, dwell)
    """
    state = get_camera_state(camera_id)
    config = CAMERA_BY_ID.get(camera_id)

    if not state or not config:
        return {"error": "Camera not found"}

    # Dispatch to appropriate KPI calculator based on camera type
    if config.camera_type == "parking":
        return calculate_parking_kpis(state, config)
    else:
        return calculate_traffic_kpis(state, config)


@app.get("/cameras/{camera_id}/crash-signal", dependencies=[Depends(require_role(["operator", "admin"]))])
def generic_camera_crash_signal(camera_id: str):
    """Placeholder for future crash detection signals"""
    return {
        "camera_id": camera_id,
        "crash_detected": False,
        "confidence": 0.0,
        "timestamp": None,
        "message": "Crash detection not yet implemented"
    }


# =====================================================================
# LEGACY ENDPOINTS (Backward compatibility - can deprecate later)
# =====================================================================

@app.get("/camera/heatmap-points", dependencies=[Depends(require_role(["operator", "admin"]))])
def camera_heatmap_points():
    """Operator/Admin only: Get camera heatmap points (LEGACY - use /cameras/{id}/heatmap-points)"""
    # Delegate to generic endpoint for traffic camera
    return generic_camera_heatmap("traffic_main_gaborone")

@app.get("/camera/history", dependencies=[Depends(require_role(["operator", "admin"]))])
def camera_history():
    """Operator/Admin only: Get camera detection history (LEGACY - use /cameras/{id}/history)"""
    return generic_camera_history("traffic_main_gaborone")

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=5433,
        dbname="gaborone_twin",
        user="mathismaomuhlebui"
    )
    
    

@app.get("/")
def home():
    return {"message": "Gaborone Digital Twin API is running"}

@app.get("/roads", dependencies=[Depends(get_current_user)])
def get_roads():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(
                jsonb_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(geom)::jsonb,
                    'properties', jsonb_build_object('id', id)
                )
            )
        )
        FROM roads;
    """)
    result = cur.fetchone()[0]
    cur.close()
    conn.close()
    return result

@app.get("/camera/stream")
def camera_stream(user: UserResponse = Depends(require_role_query(["operator", "admin"]))):
    """
    Operator/Admin only: Stream live camera feed (LEGACY - use /cameras/{id}/stream).

    Authentication via query parameter for <img> tag compatibility:
    /camera/stream?token=<jwt>
    """
    return generic_camera_stream("traffic_main_gaborone", user)

@app.get("/camera/stats", dependencies=[Depends(require_role(["operator", "admin"]))])
def camera_stats():
    """Operator/Admin only: Get camera detection statistics (LEGACY - use /cameras/{id}/stats)"""
    return generic_camera_stats("traffic_main_gaborone")


# =====================================================================
# PARKING LOT ENDPOINTS (LEGACY - use /cameras/{id} endpoints)
# =====================================================================

@app.get("/parking/stream")
def parking_stream(user: UserResponse = Depends(require_role_query(["operator", "admin"]))):
    """
    Operator/Admin only: Stream live parking lot video (LEGACY - use /cameras/{id}/stream).

    Authentication via query parameter for <img> tag compatibility:
    /parking/stream?token=<jwt>
    """
    return generic_camera_stream("parking_gaborone_lot1", user)


@app.get("/parking/stats", dependencies=[Depends(require_role(["operator", "admin"]))])
def parking_stats_endpoint():
    """
    Operator/Admin only: Get parking lot statistics (LEGACY - use /cameras/{id}/stats).

    Returns:
        JSON object with:
        - total_spots: Total number of parking spots
        - available_spots: Number of empty spots
        - occupied_spots: Number of occupied spots
    """
    return generic_camera_stats("parking_gaborone_lot1")


@app.get("/points", dependencies=[Depends(get_current_user)])
def get_points():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(
                jsonb_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(geom)::jsonb,
                    'properties', jsonb_build_object('id', id)
                )
            )
        )
        FROM points;
    """)
    result = cur.fetchone()[0]
    cur.close()
    conn.close()
    return result


@app.get("/historical_crashes", dependencies=[Depends(get_current_user)])
def get_historical_crashes():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(
                jsonb_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(geom)::jsonb,
                    'properties', jsonb_build_object(
                        'id', id,
                        'year', year,
                        'severity', severity,
                        'fatalities', fatalities,
                        'source', source,
                        'is_fake', is_fake
                    )
                )
            )
        )
        FROM historical_crashes;
    """)
    result = cur.fetchone()[0]
    cur.close()
    conn.close()
    return result

@app.get("/stats/crashes-by-year", dependencies=[Depends(get_current_user)])
def crashes_by_year():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT year, COUNT(*) as total, SUM(fatalities) as fatalities
        FROM historical_crashes
        GROUP BY year
        ORDER BY year;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    # Turn into a list of dicts — the shape Recharts expects
    return [{"year": r[0], "total": r[1], "fatalities": r[2]} for r in rows]

@app.get("/stats/crashes-by-severity", dependencies=[Depends(get_current_user)])
def crashes_by_severity():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT severity, COUNT(*) as total
        FROM historical_crashes
        GROUP BY severity;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"severity": r[0], "total": r[1]} for r in rows]