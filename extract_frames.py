import cv2
import os
import glob
import numpy as np

# Ensure frames directory exists
output_dir = os.path.join(os.getcwd(), 'public', 'frames')
os.makedirs(output_dir, exist_ok=True)

# Look for disassembly video
video_candidates = glob.glob(os.path.join('public', 'media', '*disassembles*.mp4')) + \
                   glob.glob(os.path.join('public', 'media', 'disassembly-video.mp4')) + \
                   glob.glob('*.mp4')

if not video_candidates:
    print("No video found!")
    exit(1)

video_path = video_candidates[0]
print(f"Extracting frames from: {video_path}")

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"Total video frames: {total_frames}, FPS: {fps}, Resolution: {width}x{height}")

TARGET_FRAME_COUNT = 240
# Calculate sample indices across video
frame_indices = np.linspace(0, total_frames - 1, TARGET_FRAME_COUNT, dtype=int)

extracted = 0
for target_idx, frame_num in enumerate(frame_indices):
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
    ret, frame = cap.read()
    if ret:
        filename = os.path.join(output_dir, f"frame_{target_idx:03d}.jpg")
        # Save at high quality JPEG
        cv2.imwrite(filename, frame, [cv2.IMWRITE_JPEG_QUALITY, 92])
        extracted += 1

cap.release()
print(f"Successfully extracted {extracted} frames to {output_dir}")
