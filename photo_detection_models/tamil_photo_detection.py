#import cv2 for the opencv hand detection libraries.
import cv2

#import this for ecpecially import the requirement libaries for hand detection and detect boundaries with landmarks.
from cvzone.HandTrackingModule import HandDetector

#import the classifier from the cvzone, because of it's requirement for the hand gesture recognition libraries.
from cvzone.ClassificationModule import Classifier

#import the numpy python library for the numerical calculation operations
import numpy as np

#import the math for the calculations
import math

#import the time for the video frame reate contro with the video or frame capture with it's real live time stamps
import time



#declare a variable to give the camera options
cap = cv2.VideoCapture(0)

#declare a variable with the hand count for every single frame to be counted there
detector = HandDetector(maxHands=2)




#here i imported the needed files for the gesture recongnitions
#i imported the well-trained model with it's suitable lables for the gesture recognition
# A well-trained keras recogition model imported here with it's suitable labels
classifier = Classifier("../sinhala data trained model/keras_model.h5", "../labels.txt")




#giving padding size aroung the bundary square wth odd set and image size
#capture image count
offset = 20
imgSize = 300
counter = 0


# Frame rate control
#giving value for maximum fps per frame for it's smoothnessqqq
fps_limit = 30  # Limit to 30 fps for smoother performance


#a time stamp for the previous frames for the frame rate cotrol
prev_time = 0

#give exception handling for camera proper working ensurement 
while True:

  #giving boolean value with the checking variable for the camera capture for the every frames are working properly with the given camera
  sucess, img = cap.read()

 # Handle unsuccessful frame capture
  if not success:
      print("Failed to capture image from webcam here!")
      break
     
    #stores the copy of output from the every frames for the detection of the images
  imgOutput = img.copy()
  hands, img = detector.findHands(img)

    # Check if a hand is detected
  if hands:
      hand = hands[0]
      x, y, w, h = hand['bbox']

      imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255

      imgCrop = img[y - offset:y + h + offset, x - offset:x + w + offset]
      imgCropShape = imgCrop.shape

      aspectRatio = h / w

        # Resize image based on aspect ratio
      if aspectRatio > 1:
          k = imgSize / h
          wCal = math.ceil(k * w)
          imgResize = cv2.resize(imgCrop, (wCal, imgSize))
          imgResizeShape = imgResize.shape
          wGap = math.ceil((imgSize - wCal) / 2)
          imgWhite[:, wGap:wCal + wGap] = imgResize
      else:
          k = imgSize / w
          hCal = math.ceil(k * h)
          imgResize = cv2.resize(imgCrop, (imgSize, hCal))
          imgResizeShape = imgResize.shape
          hGap = math.ceil((imgSize - hCal) / 2)
          imgWhite[hGap:hCal + hGap, :] = imgResize

        # Get prediction from the classifier
        #giving a confidece score for each labels here
      prediction, index = classifier.getPrediction(imgWhite, draw=False)
      confidence = prediction[index] * 100  # Convert to percentage


      label_with_confidence = f"{labels[index]}: {confidence:.2f}%"
        
        # Draw rectangle and display label
      cv2.rectangle(imgOutput, (x - offset, y - offset - 70), (x - offset + 400, y - offset + 60 - 50), (0, 255, 0), cv2.FILLED)
      cv2.putText(imgOutput, label_with_confidence, (x, y - 30), cv2.FONT_HERSHEY_COMPLEX, 2, (0, 0, 0), 2)
      cv2.rectangle(imgOutput, (x - offset, y - offset), (x + w + offset, y + h + offset), (0, 255, 0), 4)

        # Display crop and white image
      cv2.imshow('ImageCrop', imgCrop)
      cv2.imshow('ImageWhite', imgWhite)

    # Display the main output
  cv2.imshow('Image', imgOutput)

    # Limit frame rate
  current_time = time.time()
  if current_time - prev_time < 1 / fps_limit:
      time.sleep(1 / fps_limit - (current_time - prev_time))
    
  prev_time = time.time()

    # Exit condition (press 'q' to exit)
    
  if cv2.waitKey(1) & 0xFF == ord('q'):
     break







# Release resources
cap.release()
cv2.destroyAllWindows()





