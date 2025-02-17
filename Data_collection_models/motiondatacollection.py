import cv2
import numpy as np
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
import time
from matplotlib import pyplot as plt
import mediapipe as mp

mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# Constants Configuration
DATA_COLLECTION_PATH = os.path.join('MP_Data')
DATA_ACTIONS = np.array([])
SEQUENCES_NUM = 30
SEQUENCE_LENGTH = 30
HOLD_DURATION = 3  # Seconds before each sequence recording
FRAME_DELAY = 30   # Milliseconds between frame captures

def media_pipe_detection_model(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR), results

def draw_landmarks(image, results):
    if results.pose_landmarks:
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)
    if results.left_hand_landmarks:
        mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
    if results.right_hand_landmarks:
        mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)

def collect_data():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Camera inaccessible")
        return

    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        for action in DATA_ACTIONS:
            for sequence in range(SEQUENCES_NUM):
                # Pre-sequence countdown
                start_hold = time.time()
                while time.time() - start_hold < HOLD_DURATION:
                    ret, frame = cap.read()
                    if not ret: break
                    
                    # Visual feedback preparation
                    img, results = media_pipe_detection_model(frame, holistic)
                    draw_landmarks(img, results)
                    
                    # Display countdown
                    remaining = HOLD_DURATION - (time.time() - start_hold)
                    cv2.putText(img, f"Preparing: {action}", (30, 50), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                    cv2.putText(img, f"Starting in: {remaining:.1f}s", (30, 100),
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 2)
                    cv2.imshow('Data Collection', img)
                    if cv2.waitKey(10) & 0xFF == ord('q'):
                        cap.release()
                        cv2.destroyAllWindows()
                        return

                # Frame collection loop
                for frame_num in range(SEQUENCE_LENGTH):
                    ret, frame = cap.read()
                    if not ret: break

                    # Process and display
                    img, results = media_pipe_detection_model(frame, holistic)
                    draw_landmarks(img, results)
                    
                    # Collection feedback
                    cv2.putText(img, f"Recording: {action}", (30, 50), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.putText(img, f"Sequence: {sequence} Frame: {frame_num}", (30, 100),
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.imshow('Data Collection', img)
                    
                    # Save keypoints
                    keypoints = np.concatenate([
                        np.array([[res.x, res.y, res.z, res.visibility] 
                         for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4),
                        # Add other keypoint extractions as in original code
                    ])
                    save_path = os.path.join(DATA_COLLECTION_PATH, action, str(sequence), str(frame_num))
                    np.save(save_path, keypoints)
                    
                    # Frame delay and exit check
                    if cv2.waitKey(FRAME_DELAY) & 0xFF == ord('q'):
                        cap.release()
                        cv2.destroyAllWindows()
                        return

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    # Create data directories
    for action in DATA_ACTIONS:
        for seq in range(SEQUENCES_NUM):
            os.makedirs(os.path.join(DATA_COLLECTION_PATH, action, str(seq)), exist_ok=True)
    
    collect_data()