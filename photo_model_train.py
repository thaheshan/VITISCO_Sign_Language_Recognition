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
classifier = Classifier()


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






# Release resources
cap.release()
cv2.destroyAllWindows()


