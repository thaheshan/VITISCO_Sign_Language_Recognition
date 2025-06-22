 import cv2
import numpy as np
import time
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
from PIL import Image, ImageDraw, ImageFont  # For Tamil text rendering

# Custom classifier with fixed input size
class MyClassifier(Classifier):
    def __init__(self, modelPath, input_size=200):
        super().__init__(modelPath)
        self.input_size = input_size

    def getPrediction(self, img, draw=True):
        try:
            img_resized = cv2.resize(img, (self.input_size, self.input_size))
            blob = cv2.dnn.blobFromImage(img_resized, scalefactor=1/255.0, size=(self.input_size, self.input_size), swapRB=True)
            blob = np.transpose(blob, (0, 2, 3, 1))  # Convert shape
            prediction = self.model.predict(blob)
            index = np.argmax(prediction)
            return prediction[0], index
        except Exception as e:
            print("Error in prediction:", e)
            return [0]*10, 0  # Default safe value

# Function to draw Tamil text on OpenCV images
def putTamilText(img, text, position, font_path="../Latha-Bold.ttf", font_size=32, color=(0, 0, 255)):
    """
    Draw Tamil text on an OpenCV image using PIL.
    - img: OpenCV image
    - text: Tamil text
    - position: Tuple (x, y)
    - font_path: Path to Tamil-supporting TTF font
    - font_size: Font size
    - color: Text color (BGR)
    """
    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)

    try:
        font = ImageFont.truetype(font_path, font_size)
    except Exception as e:
        print("Error loading font:", e)
        return img  # Return original image if font fails

    draw.text(position, text, font=font, fill=color)
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

# Initialize camera
cap = cv2.VideoCapture(0)
detector = HandDetector(maxHands=2)

# Load classifier model
model_path = "./hand_gesture_model_tamil.h5"
try:
    classifier = MyClassifier(model_path, input_size=200)
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# Load Tamil gesture labels dynamically
try:
    with open("labels_tamil.txt", "r", encoding="utf-8") as f:
        actions = [line.strip() for line in f.readlines()]
except FileNotFoundError:
    actions = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ']  # Default fallback Tamil labels

# Image processing parameters
offset = 20
imgSize = 200  
fps_limit = 30
prev_time = time.time()

while True:
    success, img = cap.read()
    if not success:
        print("Failed to capture image from webcam")
        break
    imgOutput = img.copy()
    hands, img = detector.findHands(img)

    if hands:
        for hand in hands:
            x, y, w, h = hand['bbox']

            # Ensure crop region is within bounds
            y1, y2 = max(0, y - offset), min(img.shape[0], y + h + offset)
            x1, x2 = max(0, x - offset), min(img.shape[1], x + w + offset)
            imgCrop = img[y1:y2, x1:x2]
            if imgCrop.size == 0:
                continue

            # Preprocess image for classifier
            imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
            imgResize = cv2.resize(imgCrop, (imgSize, imgSize))
            imgWhite[:imgResize.shape[0], :imgResize.shape[1]] = imgResize
            
            # Get prediction
            prediction, index = classifier.getPrediction(imgWhite, draw=False)
            confidence = prediction[index] * 100
            label = actions[index] if index < len(actions) else "Unknown"
            label_with_confidence = f"{label}: {confidence:.2f}%"

            # Draw results with Tamil font
            imgOutput = putTamilText(imgOutput, label_with_confidence, (x1, y1 - 60))  

            # Bounding box
            cv2.rectangle(imgOutput, (x1, y1), (x2, y2), (0, 255, 0), 4)

            # Show cropped images for debugging
            cv2.imshow('ImageCrop', imgCrop)
            cv2.imshow('ImageWhite', imgWhite)

    cv2.imshow('Image', imgOutput)

    # Frame rate control
    current_time = time.time()
    elapsed_time = current_time - prev_time
    if elapsed_time < 1 / fps_limit:
        time.sleep(1 / fps_limit - elapsed_time)
    prev_time = time.time()

    # Exit condition
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
