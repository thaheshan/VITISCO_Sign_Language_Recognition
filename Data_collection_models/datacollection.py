
#here i used cv2 , which means open cv library for image and video processing to collect the data sets
import cv2

#in this opencv module i imported the handtracking library for hand detection and tracking the hand anywhere in the opening screen.
from cvzone.HandTrackingModule import HandDetector

#here i imported numpy library, which is for create a white background and mainpulate the matrices for resizing the images automatically 
#while tracing the hands

import numpy as np

#importing time for showing unique time differences between capturing every images
import time

#scaling and calculating the re-sizing dimensions.
import math

# Initialize the video capture (0 for default camera)
# for additional cameras we can use 1 or 2
cap = cv2.VideoCapture(0)


#hii, this is the main function for capturing the images from the camera


# Check if the camera is opened correctly
if not cap.isOpened():
    #give an error handling for the camera opening
    print("Error: Could not open camera")
    #exiting from the camera
    exit()

# Initialize the HandDetector with the option to detect one hand or two hands
#define the hand detection count per in one frame
detector = HandDetector(maxHands=4,  detectionCon=0.8, minTrackCon=0.6)

# Parameters for image processing
offset = 20
image_size = 300
counter = 0
total_images=350 

# Folder to save the cropped images

folder = r"C:\Users\AYMAN BROS\Desktop\Test git"

# Start video capture loop
#until we give the exit requirement input it will run to capture the images
while True:

    # Capture frame-by-frame
    success, image = cap.read()
    
    #error handling for capturing images on real-time.
    #if not cap.read working this error handling message will showup in the terminal
    #use skip for wait until the successful capture of the frames
    if not success or image is None or image.size == 0:

        print("Failed to capture image, skipping this frame...")
        continue  # Skip this loop iteration if the frame isn't captured properly



    # Resize the image for faster processing (optional)
    image = cv2.resize(image, (940, 620))

    # Find hands in the captured image
    hands, image = detector.findHands(image)

    #checking if hands mean, if true
    if hands:

        # Initialize bounding box limits with first detected hand
        x_min, y_min, x_max, y_max = float('inf'), float('inf'), 0, 0

        for hand in hands:
            if "lmList" in hand:
                lmList = hand['lmList']
                handType = hand["type"]

                for lm in lmList:
                    cv2.circle(image, (lm[0], lm[1]), 5, (0, 255, 0), -1)

                # Update bounding box for each detected hand
                x, y, w, h = hand['bbox']
                x_min, y_min = min(x_min, x), min(y_min, y)
                x_max, y_max = max(x_max, x + w), max(y_max, y + h)

        # Expand bounding box slightly to ensure hands merge properly
        x_min, y_min = max(0, x_min - offset), max(0, y_min - offset)
        x_max, y_max = min(image.shape[1], x_max + offset), min(image.shape[0], y_max + offset)

        # Crop the combined hand region
        image_crop = image[y_min:y_max, x_min:x_max]

        # Convert to grayscale & apply Gaussian blur
        gray = cv2.cvtColor(image_crop, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)


        # Crop the combined hand region
        image_crop = image[y_min:y_max, x_min:x_max]

        # Create a white image background (300x300 pixels)
        image_white = np.ones((image_size, image_size, 3), np.uint8) * 255

        # Aspect ratio calculation
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

        # Display the cropped combined hand region
        cv2.imshow('Cropped Image', image_crop)
        cv2.imshow('Resized Image', image_white)

    # Display the original image from the camera feed
    cv2.imshow("Original Image", image)

    # Wait for key press
    key = cv2.waitKey(1)

    # If 's' key is pressed, save the cropped hand image to the specified folder
    # If 's' key is pressed, start capturing 400 images automatically
    if key == ord('s') and hands:
        print("Starting image capture...")

        for i in range(total_images):  # <-- Make sure this line is properly aligned
            success, image = cap.read()
            if not success:
                print(f"Skipping frame {i + 1}")
                continue  

            hands, image = detector.findHands(image)
            if hands:
                x_min, y_min, x_max, y_max = hands[0]['bbox'][0], hands[0]['bbox'][1], hands[0]['bbox'][0] + hands[0]['bbox'][2], hands[0]['bbox'][1] + hands[0]['bbox'][3]

                for hand in hands:
                    x, y, w, h = hand['bbox']
                    x_min = min(x_min, x)
                    y_min = min(y_min, y)
                    x_max = max(x_max, x + w + w)
                    y_max = max(y_max, y + h + h)

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

                time.sleep(0.05)  # Small delay to avoid overloading CPU

            if counter >= total_images:
                print("Image capture complete!")
                break  # Stops the loop after reaching 400 images


    # If 'Esc' key is pressed, exit the loop
    if key == 27:  # Escape key to exit
        break

# Release the video capture and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
