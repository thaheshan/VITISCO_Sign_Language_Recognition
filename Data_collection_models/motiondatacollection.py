import cv2
import numpy as np
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from matplotlib import pyplot as plt
import mediapipe as mp
import time


#for build and train a LSTM neural netweok
#we need to import tensorflow libraries
#the LSTM (Long Short Term) neural network, which is, 
#which is, a special type of recurrent neural network.
#it specially designed for manage/handke sequential data efficiently.

#RNN will not have long -term memory for the dependencies but LSTM will hild long term memeory here
#and why we chpse to train data with LSTM netwrok here for, hand detection ?
# because, hand sign detection means , analyzing a sequence of frames (include actions) from a video
#for every vddeos, it will have different hand positions or gestures fro the series of time.

#it can remember past frames.
#this LSTM network can store past sequence of actions for the detection in a long-term goal.
#it can easily seperate every pattern of gestures by per taken time
#it will reduce the noise from the frame dataset.
#it will make past datassets more flexible fore real word sign detection.

#for that first need to import needed dependecies for the LSTM neural network with tensorflow

#how we make the LSTM neural network implementation with tensorflow here to make a proper hand sign detection model
#1.extract the correct keypoints for the face, pose and hand landmarks
#2.convert the hand keypoints over time into sequences frames per every gesture ina time sequence 
#3.LSTM model training with the extracted dataset (train a LSTM model to learn and  classify gestures based on their motion patterns)
#4.build it accuracy with changing the components values (example epoches)

# Import Mediapipe holistic and drawing utilities
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils


def media_pipe_detection_model(image, model):
       
       """
    Perform detection using Mediapipe's holistic model.
    Args:
        image: The input BGR image.
        model: The Mediapipe holistic model instance.

    Returns:
        Processed BGR image and detection results.
    """
    
       image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
       image.flags.writeable = False  # Improve performance by disabling write
       results = model.process(image)  # Perform detection
       image.flags.writeable = True  # Re-enable writing
       image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # Convert RGB back to BGR
       return image, results



# Define constants
DATA_COLLECTION_PATH = os.path.join('MP_Data')
data_actions = np.array(["thanks", "hello", "I_love_you"])
no_of_frame_for_data = 30
sequence_length = 30




cap.release()
cv2.destroyAllWindows()