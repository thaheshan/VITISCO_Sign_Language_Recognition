
#here i used cv2 , which means open cv library for image and video processing to collect the data sets
import cv2

#in this opencv module i imported the handtracking library for hand detection and tracking the hand anywhere in the opening screen
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
folder = r"C:\Users\Thahe\Desktop\Sign System Detection\Data\thank you"

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
        hand = hands[0]
        #processsing the detected hand, with x axis , y axis and it's height and weight.

        x, y, w, h = hand['bbox']  # Bounding box coordinates (x, y, width, height)

        # Create a white image to place the resized hand image
        #creating a white background, in the size of 300*300 pixels.
        image_white = np.ones((image_size, image_size, 3), np.uint8) * 255

        # Crop the hand image from the frame with boundary checks
        #crop and re-size the hand region here with it's height abd weight and it's frame boundaries
        y1, y2 = max(0, y - offset), min(image.shape[0], y + h + offset)
        x1, x2 = max(0, x - offset), min(image.shape[1], x + w + offset)
        image_crop = image[y1:y2, x1:x2]
        image_crop_shape = image_crop.shape


        aspect_ratio = h / w  # Calculate aspect ratio of the hand region

        if aspect_ratio > 1:  # If the hand is taller than it is wide
            scale = image_size / h
            width_cal = math.ceil(scale * w)
            image_resized = cv2.resize(image_crop, (width_cal, image_size))
            width_gap = math.ceil((image_size - width_cal) / 2)
            image_white[:, width_gap:width_cal + width_gap] = image_resized

        else:  # If the hand is wider than it is tall
            scale = image_size / w
            height_cal = math.ceil(scale * h)
            image_resized = cv2.resize(image_crop, (image_size, height_cal))
            height_gap = math.ceil((image_size - height_cal) / 2)
            image_white[height_gap:height_cal + height_gap, :] = image_resized

        # Display the cropped hand and the resized hand on a white background
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
    if key == 27:  # Escape key to exit
        break

# Release the video capture and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
