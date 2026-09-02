import cv2
import numpy as np
import os
import yt_dlp
from util import get_parking_spots_bboxes

youtube_url = 'https://www.youtube.com/watch?v=EPKWu223XEg'
mask_path = '/Users/mathismaomuhlebui/Desktop/infosys/road_monitoring/parking_slot_test/clf-data/real_crop_v5.png'


def get_stream_url(youtube_url):
    ydl_opts = {
        'format': 'best[protocol=m3u8]/best',
        'quiet': True,
        'js_runtimes': {'deno': {}},
        'remote_components': ['ejs:github']
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info['url']
print("Resolving YouTube stream URL...")
stream_url = get_stream_url(youtube_url)

cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)

# Load the mask as a grayscale image
mask = cv2.imread(mask_path, 0)
if mask is None:
    raise FileNotFoundError(f"Could not load mask image at: {mask_path}")

mask_h, mask_w = mask.shape
print(f"Mask resolution: {mask_w}x{mask_h}")

connected_components_result = cv2.connectedComponentsWithStats(mask, 4, cv2.CV_32S)

spots = get_parking_spots_bboxes(connected_components_result)

# Filter out tiny noise components - real parking spots should be reasonably sized
MIN_WIDTH = 15
MIN_HEIGHT = 15
spots = [s for s in spots if s[2] >= MIN_WIDTH and s[3] >= MIN_HEIGHT]

print(f"Kept {len(spots)} parking spots after filtering noise")

for i in range(len(spots)):
    print(spots[i])


if not cap.isOpened():
    print("Error: Could not open YouTube stream.")
    exit(1)

print("Stream opened successfully! Press 'q' to quit.")

while True:
    ret, frame = cap.read()

    if not ret:
        print("Stream ended or frame could not be read")
        break

    # Resize frame to match the mask's resolution so spot coordinates line up
    frame = cv2.resize(frame, (mask_w, mask_h))

    for spot in spots:
        x1, y1, w, h = spot
        frame = cv2.rectangle(frame, (x1, y1), (x1 + w, y1 + h), (255, 0, 0), 2)

    cv2.imshow('Video Feed - Press Q to Quit', frame)

    if cv2.waitKey(25) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("Video closed.")