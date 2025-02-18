import cv2
import numpy as np
import time
import math
from cvzone.HandTrackingModule import HandDetector
from filterpy.kalman import KalmanFilter

# Initialize Video Capture
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open camera")
    exit()

# Initialize Hand Detector
detector = HandDetector(maxHands=2, detectionCon=0.8, minTrackCon=0.6)

# Kalman Filter Initialization for Hand Landmarks
def create_kalman_filter():
    kf = KalmanFilter(dim_x=4, dim_z=2)  # 4 states (x, y, vx, vy), 2 measurements (x, y)
    kf.F = np.array([[1, 0, 1, 0],
                     [0, 1, 0, 1],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]])  # Transition Matrix

    kf.H = np.array([[1, 0, 0, 0],
                     [0, 1, 0, 0]])  # Measurement Function

    kf.P *= 500  # Covariance
    kf.R *= 5  # Measurement Noise
    kf.Q *= np.eye(4)* 0.1  # Process Noise
    return kf
#update exponential moving for sommether predictions in allover landmarks, when overlapping

alpha = 0.6
ema_positions =  [None]*21

# Create Kalman Filters for 21 hand landmarks
kalman_filters = [create_kalman_filter() for _ in range(21)]

# Image Processing Parameters
offset = 20
image_size = 300
counter = 0
total_images = 300

# Folder to Save Images
folder = r"E:\Studiezzz\2nd Year\Sem 2\SDGP\English Letters\T"

# Start Video Capture Loop
while True:
    success, image = cap.read()
    if not success or image is None or image.size == 0:
        print("Failed to capture image, skipping frame...")
        continue

    image = cv2.resize(image, (940, 620))  # Resize for faster processing

    # Detect Hands
    hands, image = detector.findHands(image)

    if hands:
        x_min, y_min, x_max, y_max = float('inf'), float('inf'), 0, 0  # Bounding box limits

        for hand in hands:
            if "lmList" in hand:
                lmList = hand['lmList']

                for i, lm in enumerate(lmList):
                    x, y = lm[0], lm[1]

                       # Kalman Prediction & Update
                    kf = kalman_filters[i]
                    kf.predict()
                    z = np.array([[x], [y]])
                    kf.update(z)

                    x_est, y_est = int(kf.x[0]), int(kf.x[1])

                    # Apply EMA Smoothing
                    if ema_positions[i] is None:
                        ema_positions[i] = (x_est, y_est)
                    else:
                        ema_x = int(alpha * x_est + (1 - alpha) * ema_positions[i][0])
                        ema_y = int(alpha * y_est + (1 - alpha) * ema_positions[i][1])
                        ema_positions[i] = (ema_x, ema_y)
                        
                    # Draw Predicted (Red) or Detected (Green) Landmarks
                    if hand['type'] == "Right" and i == 0:  # If occluded, use prediction
                        cv2.circle(image, (x_est, y_est), 5, (0, 0, 255), -1)  # Red = Predicted
                    else:
                        cv2.circle(image, (x, y), 5, (0, 255, 0), -1)  # Green = Detected

                # Update Bounding Box
                x, y, w, h = hand['bbox']
                x_min, y_min = min(x_min, x), min(y_min, y)
                x_max, y_max = max(x_max, x + w), max(y_max, y + h)

        # Expand Bounding Box
        x_min, y_min = max(0, x_min - offset), max(0, y_min - offset)
        x_max, y_max = min(image.shape[1], x_max + offset), min(image.shape[0], y_max + offset)

        # Crop & Resize Image
        image_crop = image[y_min:y_max, x_min:x_max]
        image_white = np.ones((image_size, image_size, 3), np.uint8) * 255

        # Aspect Ratio Calculation
        aspect_ratio = (y_max - y_min) / (x_max - x_min)

        if aspect_ratio > 1:  # Taller than wide
            scale = image_size / (y_max - y_min)
            width_cal = math.ceil(scale * (x_max - x_min))
            image_resized = cv2.resize(image_crop, (width_cal, image_size))
            width_gap = math.ceil((image_size - width_cal) / 2)
            image_white[:, width_gap:width_cal + width_gap] = image_resized
        else:  # Wider than tall
            scale = image_size / (x_max - x_min)
            height_cal = math.ceil(scale * (y_max - y_min))
            image_resized = cv2.resize(image_crop, (image_size, height_cal))
            height_gap = math.ceil((image_size - height_cal) / 2)
            image_white[height_gap:height_cal + height_gap, :] = image_resized

        # Display Processed Images
        cv2.imshow('Cropped Image', image_crop)
        cv2.imshow('Resized Image', image_white)

    # Show Original Image
    cv2.imshow("Original Image", image)

    # Image Saving on 's' Key Press
    key = cv2.waitKey(1)
    if key == ord('s') and hands:
        print("Starting image capture...")

        for i in range(total_images):
            success, image = cap.read()
            if not success:
                print(f"Skipping frame {i + 1}")
                continue

            hands, image = detector.findHands(image)
            if hands:
                x_min, y_min, x_max, y_max = hands[0]['bbox'][0], hands[0]['bbox'][1], hands[0]['bbox'][0] + hands[0]['bbox'][2], hands[0]['bbox'][1] + hands[0]['bbox'][3]

                for hand in hands:
                    x, y, w, h = hand['bbox']
                    x_min, y_min = min(x_min, x), min(y_min, y)
                    x_max, y_max = max(x_max, x + w + w), max(y_max, y + h + h)

                x_min, y_min = max(0, x_min - offset), max(0, y_min - offset)
                x_max, y_max = min(image.shape[1], x_max + offset), min(image.shape[0], y_max + offset)

                image_crop = image[y_min:y_max, x_min:x_max]
                image_white = np.ones((image_size, image_size, 3), np.uint8) * 255

                aspect_ratio = (y_max - y_min) / (x_max - x_min)
                if aspect_ratio > 1:
                    scale = image_size / (y_max - y_min)
                    width_cal = math.ceil(scale * (x_max - x_min))
                    image_resized = cv2.resize(image_crop, (width_cal, image_size))
                    width_gap = math.ceil((image_size - width_cal) / 2)
                    image_white[:, width_gap:width_cal + width_gap] = image_resized
                else:
                    scale = image_size / (x_max - x_min)
                    height_cal = math.ceil(scale * (y_max - y_min))
                    image_resized = cv2.resize(image_crop, (image_size, height_cal))
                    height_gap = math.ceil((image_size - height_cal) / 2)
                    image_white[height_gap:height_cal + height_gap, :] = image_resized

                filename = f"{folder}/Image_{time.time():.6f}.jpg"
                cv2.imwrite(filename, image_white)
                counter += 1
                print(f"Saved {counter}/{total_images} images at {filename}")

                time.sleep(0.05)

            if counter >= total_images:
                print("Image capture complete!")
                break

    # Exit on 'Esc' key
    if key == 27:
        break

cap.release()
cv2.destroyAllWindows()
