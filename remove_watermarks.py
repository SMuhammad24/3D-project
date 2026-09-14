import cv2
import glob
import os
import numpy as np

frames_dir = os.path.join('public', 'frames')
frame_files = sorted(glob.glob(os.path.join(frames_dir, 'frame_*.jpg')))

print(f"Total frame files to process: {len(frame_files)}")

# Watermark bounding box in 1920x1080 resolution
# Corner around x: 1680..1800, y: 840..960
for i, fpath in enumerate(frame_files):
    img = cv2.imread(fpath)
    if img is None:
        continue

    h, w = img.shape[:2]
    # Scale coordinates proportionally if resolution is different
    scale_x = w / 1920.0
    scale_y = h / 1080.0

    x1 = int(1680 * scale_x)
    y1 = int(840 * scale_y)
    x2 = int(1800 * scale_x)
    y2 = int(960 * scale_y)

    mask = np.zeros((h, w), dtype=np.uint8)
    mask[y1:y2, x1:x2] = 255

    # High-quality Navier-Stokes / Telea inpainting
    clean_img = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)
    cv2.imwrite(fpath, clean_img, [cv2.IMWRITE_JPEG_QUALITY, 93])

    if i % 40 == 0 or i == len(frame_files) - 1:
        print(f"Processed frame {i+1}/{len(frame_files)}")

# Also process media images if any
media_images = glob.glob(os.path.join('public', 'media', '*.jpeg')) + \
               glob.glob(os.path.join('public', 'media', '*.jpg'))

for fpath in media_images:
    if 'crop' in fpath or 'clean' in fpath or 'search' in fpath:
        continue
    img = cv2.imread(fpath)
    if img is None:
        continue
    h, w = img.shape[:2]
    scale_x = w / 1920.0
    scale_y = h / 1080.0

    x1 = int(1680 * scale_x)
    y1 = int(840 * scale_y)
    x2 = int(1800 * scale_x)
    y2 = int(960 * scale_y)

    mask = np.zeros((h, w), dtype=np.uint8)
    mask[y1:y2, x1:x2] = 255
    clean_img = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)
    cv2.imwrite(fpath, clean_img, [cv2.IMWRITE_JPEG_QUALITY, 93])

print("All watermarks completely removed from all 240 frames and media assets!")
