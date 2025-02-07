
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
detector = HandDetector(maxHands=2)

# Parameters for image processing
offset = 20
image_size = 300
counter = 0

# Folder to save the cropped images
folder = r"../Sinhala Letters//sample"

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
    image = cv2.resize(image, (640, 480))

    # Find hands in the captured image
    hands, image = detector.findHands(image)

    #checking if hands mean, if true
    if hands:
        # Initialize bounding box limits with the first detected hand
        x_min, y_min, x_max, y_max = hands[0]['bbox'][0], hands[0]['bbox'][1], hands[0]['bbox'][0] + hands[0]['bbox'][2], hands[0]['bbox'][1] + hands[0]['bbox'][3]

    
    # Loop through all detected hands and expand the bounding box
        for hand in hands:
            x, y, w, h = hand['bbox']
            x_min = min(x_min, x)
            y_min = min(y_min, y)
            x_max = max(x_max, x + w)
            y_max = max(y_max, y + h)

        # Add offset to make sure hands are not cut off
        x_min, y_min = max(0, x_min - offset), max(0, y_min - offset)
        x_max, y_max = min(image.shape[1], x_max + offset), min(image.shape[0], y_max + offset)

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
    if key == ord('s') and hands:
        counter += 1
        # Save image with a better naming convention including timestamp
        filename = f"{folder}/Image_{time.time():.6f}.jpg"  # More precise timestamp
        cv2.imwrite(filename, image_white)
        print(f"Saved {counter} images at {filename}")

    # If 'Esc' key is pressed, exit the loop
    if key == ord(1):  # Escape key to exit
        break

# Release the video capture and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
