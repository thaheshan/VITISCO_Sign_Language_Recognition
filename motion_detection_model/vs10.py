import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import to_categorical

# Initialize Mediapipe and camera
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)
model = load_model('./gesture_model_10.h5')

# Label mapping (the same as used during training)
label_mapping = {'thanks': 0, 'hello': 1, 'I_love_you': 2}

# Function to process webcam image and get keypoints
def media_pipe_detection_model(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    return image, results

def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]) if results.pose_landmarks else np.zeros((33, 4))
    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]) if results.face_landmarks else np.zeros((468, 3))
    left_hand = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]) if results.left_hand_landmarks else np.zeros((21, 3))
    right_hand = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]) if results.right_hand_landmarks else np.zeros((21, 3))
    return np.concatenate([pose.flatten(), face.flatten(), left_hand.flatten(), right_hand.flatten()])

# Real-time detection
with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        # Perform detection
        image, results = media_pipe_detection_model(frame, holistic)
        
        # Extract keypoints and process for prediction
        keypoints = extract_keypoints(results)
        keypoints = keypoints.reshape(1, 1, 1662)
  # Reshape as per your training data

        # Predict gesture
        prediction = model.predict(keypoints)
        predicted_label = np.argmax(prediction, axis=1)
        predicted_class = list(label_mapping.keys())[predicted_label[0]]
        confidence = np.max(prediction) * 100

        # Display the prediction on the frame
        cv2.putText(image, f'Gesture: {predicted_class}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(image, f'Confidence: {confidence:.2f}%', (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        # Show the frame
        cv2.imshow("Gesture Recognition", image)

        # Exit the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
