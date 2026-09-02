import cv2
import numpy as np

# Create a simple test video
width, height = 1920, 1080
fps = 30
duration = 10  # seconds

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter('parking_slot_test/clf-data/video.mp4', fourcc, fps, (width, height))

print("Creating test video...")

for i in range(fps * duration):
    # Create a frame with moving text and graphics
    frame = np.zeros((height, width, 3), dtype=np.uint8)

    # Add gradient background
    for y in range(height):
        frame[y, :] = [int(50 + (y / height) * 100), int(30 + (y / height) * 80), 60]

    # Add moving circle
    center_x = int(width / 2 + 300 * np.sin(i / 30))
    center_y = int(height / 2 + 200 * np.cos(i / 30))
    cv2.circle(frame, (center_x, center_y), 50, (0, 255, 255), -1)

    # Add text
    text = f"Test Video - Frame {i}/{fps * duration}"
    cv2.putText(frame, text, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)

    # Add parking lot simulation (rectangles)
    for j in range(10):
        x = 100 + j * 180
        y = 500
        color = (0, 255, 0) if (i + j) % 3 == 0 else (0, 0, 255)
        cv2.rectangle(frame, (x, y), (x + 150, y + 300), color, 3)

    out.write(frame)

    if (i + 1) % 30 == 0:
        print(f"Progress: {i + 1}/{fps * duration} frames")

out.release()
print("Test video created at: parking_slot_test/clf-data/video.mp4")
