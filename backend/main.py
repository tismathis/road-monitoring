from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
from fastapi.responses import StreamingResponse

import time
from camera_stream import start_camera_thread, get_latest_frame, get_counts, get_history, get_heatmap_points

# Import parking stream functions
# These handle the parking lot camera with spot detection
from parking_stream import start_parking_thread, get_latest_parking_frame, get_parking_stats


app = FastAPI()

@app.on_event("startup")
def startup_event():
    """
    Initialize background threads when the server starts.

    - start_camera_thread(): Starts vehicle detection camera
    - start_parking_thread(): Starts parking lot monitoring
    """
    start_camera_thread()      # Traffic camera with YOLO vehicle detection
    start_parking_thread()     # Parking lot with spot classification
    
@app.get("/camera/history")
def camera_history():
    return get_history()
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/camera/heatmap-points")
def camera_heatmap_points():
    return get_heatmap_points()

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

@app.get("/roads")
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

def mjpeg_generator():
    while True:
        frame = get_latest_frame()
        if frame is not None:
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        time.sleep(0.05)

@app.get("/camera/stream")
def camera_stream():
    return StreamingResponse(mjpeg_generator(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/camera/stats")
def camera_stats():
    return get_counts()


# =====================================================================
# PARKING LOT ENDPOINTS
# =====================================================================

def parking_mjpeg_generator():
    """
    Generator function for Motion JPEG streaming of parking lot.

    Yields:
        JPEG frames in multipart format for continuous streaming

    How it works:
    - Continuously fetches the latest parking frame
    - Wraps each frame in MJPEG format (multipart/x-mixed-replace)
    - Browser displays frames as they arrive (like a video)
    """
    while True:
        frame = get_latest_parking_frame()
        if frame is not None:
            # Yield frame in MJPEG format
            # --frame: boundary marker
            # Content-Type: declares this chunk is a JPEG image
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        time.sleep(0.05)  # ~20 FPS to avoid overwhelming the connection


@app.get("/parking/stream")
def parking_stream():
    """
    Endpoint to stream live parking lot video with annotations.

    Returns:
        StreamingResponse with multipart/x-mixed-replace MJPEG stream

    Frontend usage:
        <img src="http://localhost:8000/parking/stream" />

    The stream shows:
    - Green rectangles around empty spots
    - Red rectangles around occupied spots
    - Text overlay with total/available/occupied counts
    """
    return StreamingResponse(
        parking_mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/parking/stats")
def parking_stats_endpoint():
    """
    Get current parking lot statistics.

    Returns:
        JSON object with:
        - total_spots: Total number of parking spots
        - available_spots: Number of empty spots
        - occupied_spots: Number of occupied spots

    Example response:
        {
            "total_spots": 50,
            "available_spots": 12,
            "occupied_spots": 38
        }
    """
    return get_parking_stats()


@app.get("/points")
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


@app.get("/historical_crashes")
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

@app.get("/stats/crashes-by-year")
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

@app.get("/stats/crashes-by-severity")
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