import cv2
import numpy as np
import imageio.v3 as iio
import imageio_ffmpeg

def clean_intro():
    input_path = 'Animating_MX_Master_2S_mouse_20260914120005.mp4'
    output_path = 'public/media/intro-animation.mp4'
    
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Processing intro video: {total} frames at {fps} FPS...")

    # Watermark bounding box coordinates with padding
    y1, y2 = 855, 945
    x1, x2 = 1695, 1785

    writer = imageio.get_writer(
        output_path,
        fps=fps,
        codec='libx264',
        quality=8,
        pixelformat='yuv420p',
        macro_block_size=None,
        ffmpeg_log_level='error'
    )

    count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        h, w, _ = frame.shape
        mask = np.zeros((h, w), dtype=np.uint8)
        mask[y1:y2, x1:x2] = 255

        # Telea Inpainting to cleanly wipe the AI watermark star
        clean_frame = cv2.inpaint(frame, mask, 5, cv2.INPAINT_TELEA)

        # Convert BGR (OpenCV) to RGB (imageio)
        rgb_frame = cv2.cvtColor(clean_frame, cv2.COLOR_BGR2RGB)
        writer.append_data(rgb_frame)

        count += 1
        if count % 40 == 0 or count == total:
            print(f"Processed {count}/{total} frames ({(count/total)*100:.1f}%)")

    cap.release()
    writer.close()
    print(f"Successfully created clean watermark-free intro video: {output_path}")

if __name__ == '__main__':
    import imageio
    clean_intro()
