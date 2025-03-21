import cv2
import numpy as np
import os
import time
import mediapipe as mp

# Set CUDA to CPU-only mode
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# Initialize Mediapipe Solutions
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# Constants Configuration
DATA_COLLECTION_PATH = os.path.join('MP_Data')
DATA_ACTIONS = np.array(["thanks", "hello", "I_love_you"])
SEQUENCES_NUM = 30
SEQUENCE_LENGTH = 30
HOLD_DURATION = 3  # Seconds before each sequence recording
FRAME_DELAY = 60   # Milliseconds between frame captures

# Kalman Filter Setup
def initialize_kalman_filter():
    kalman = cv2.KalmanFilter(4, 2)
    kalman.measurementMatrix = np.array([[1, 0, 0, 0], [0, 1, 0, 0]], dtype=np.float32)  # For x, y coordinates
    kalman.transitionMatrix = np.array([[1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 0], [0, 0, 0, 1]], dtype=np.float32)
    kalman.processNoiseCov = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], dtype=np.float32) * 0.03
    return kalman

# Function to process image with Mediapipe
def media_pipe_detection_model(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR), results

# Function to draw landmarks
def draw_landmarks(image, results):
    if results.face_landmarks:
        mp_drawing.draw_landmarks(image, results.face_landmarks, mp_holistic.FACEMESH_TESSELATION, 
                                  mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=1, circle_radius=1),
                                  mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=1, circle_radius=1))
    if results.pose_landmarks:
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)
    if results.left_hand_landmarks:
        mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
    if results.right_hand_landmarks:
        mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)

# Data collection function
def collect_data():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Camera inaccessible")
        return
    
    with mp_holistic.Holistic(min_detection_confidence=0.7, min_tracking_confidence=0.7) as holistic:
        kalman_filter = initialize_kalman_filter()
        
        for action in DATA_ACTIONS:
            for sequence in range(SEQUENCES_NUM):
                # Pre-sequence countdown
                start_hold = time.time()
                while time.time() - start_hold < HOLD_DURATION:
                    ret, frame = cap.read()
                    if not ret: break
                    img, results = media_pipe_detection_model(frame, holistic)
                    draw_landmarks(img, results)
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
                
                for frame_num in range(SEQUENCE_LENGTH):
                    ret, frame = cap.read()
                    if not ret: break
                    img, results = media_pipe_detection_model(frame, holistic)
                    draw_landmarks(img, results)
                    cv2.putText(img, f"Recording: {action}", (30, 50), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.putText(img, f"Sequence: {sequence} Frame: {frame_num}", (30, 100),
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.imshow('Data Collection', img)
                    
                    keypoints = np.concatenate([
                        np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() 
                        if results.pose_landmarks else np.zeros(33*4),
                        np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten()
                        if results.face_landmarks else np.zeros(468*3),
                        np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten()
                        if results.left_hand_landmarks else np.zeros(21*3),
                        np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten()
                        if results.right_hand_landmarks else np.zeros(21*3)
                    ])
                    
                    # Apply Kalman Filter to the landmark data (filtering X, Y for simplicity)
                    for i in range(0, len(keypoints), 4):  # Assuming each landmark has 4 components (x, y, z, visibility)
                        x, y = keypoints[i], keypoints[i+1]
                        
                        kalman_filter.correct(np.array([x, y], dtype=np.float32))
                        predicted = kalman_filter.predict()
                        
                        # Update keypoints with filtered x, y values
                        keypoints[i], keypoints[i+1] = predicted[0], predicted[1]
                    
                    save_path = os.path.join(DATA_COLLECTION_PATH, action, str(sequence), str(frame_num))
                    np.save(save_path, keypoints)
                    
                    if cv2.waitKey(FRAME_DELAY) & 0xFF == ord('q'):
                        cap.release()
                        cv2.destroyAllWindows()
                        return
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    for action in DATA_ACTIONS:
        for seq in range(SEQUENCES_NUM):
            os.makedirs(os.path.join(DATA_COLLECTION_PATH, action, str(seq)), exist_ok=True)
    collect_data()
