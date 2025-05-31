import cv2
import numpy as np
import time
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
from PIL import Image, ImageDraw, ImageFont  # For Sinhala text rendering

# Custom classifier with forced input size
class MyClassifier(Classifier):
    def __init__(self, modelPath, input_size=200):
        super().__init__(modelPath)
        self.input_size = input_size

    def getPrediction(self, img, draw=True):
        try:
            img_resized = cv2.resize(img, (self.input_size, self.input_size))
            blob = cv2.dnn.blobFromImage(img_resized, scalefactor=1/255.0, size=(self.input_size, self.input_size), swapRB=True)
            blob = np.transpose(blob, (0, 2, 3, 1))
            prediction = self.model.predict(blob)
            index = np.argmax(prediction)
            return prediction[0], index
        except Exception as e:
            print("Error in prediction:", e)
            return [0]*10, 0

# Draw Sinhala text using PIL
def putSinhalaText(img, text, position, font_path="../Iskoola Pota Regular.ttf", font_size=32, color=(0, 0, 0)):
    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)
    try:
        font = ImageFont.truetype(font_path, font_size)
    except Exception as e:
        print("Font load error:", e)
        return img
    draw.text(position, text, font=font, fill=color)
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

# Setup
cap = cv2.VideoCapture(0)
detector = HandDetector(maxHands=2)
model_path = "../hand_gesture_model_sinhala.h5"

try:
    classifier = MyClassifier(model_path, input_size=200)
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

try:
    with open("labels.txt", "r", encoding="utf-8") as f:
        actions = [line.strip() for line in f.readlines()]
except FileNotFoundError:
    actions = ['ං', 'ග්', 'චි', 'ටි', 'ඩි', 'ත්', 'ද්', 'න්', 'ෆ', 'ෟ']

offset = 20
imgSize = 200
fps_limit = 30
prev_time = time.time()

while True:
    success, img = cap.read()
    if not success:
        print("Camera capture failed.")
        break

    imgOutput = img.copy()
    hands, img = detector.findHands(img)

    if hands:
        if len(hands) == 1:
            hand = hands[0]
            x, y, w, h = hand['bbox']
            x1, y1 = max(x - offset, 0), max(y - offset, 0)
            x2, y2 = min(x + w + offset, img.shape[1]), min(y + h + offset, img.shape[0])
            imgCrop = img[y1:y2, x1:x2]
            if imgCrop.size == 0:
                continue
            imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
            imgResize = cv2.resize(imgCrop, (imgSize, imgSize))
            imgWhite[:imgResize.shape[0], :imgResize.shape[1]] = imgResize
            prediction, index = classifier.getPrediction(imgWhite, draw=False)
            confidence = prediction[index] * 100
            label = actions[index] if index < len(actions) else "Unknown"
            label_with_confidence = f"{label}: {confidence:.2f}%"
            imgOutput = putSinhalaText(imgOutput, label_with_confidence, (x1, y1 - 60))
            cv2.rectangle(imgOutput, (x1, y1), (x2, y2), (0, 255, 0), 4)
            cv2.imshow('ImageCrop', imgCrop)
            cv2.imshow('ImageWhite', imgWhite)

        elif len(hands) == 2:
            hand1, hand2 = hands[0], hands[1]
            x1, y1, w1, h1 = hand1['bbox']
            x2, y2, w2, h2 = hand2['bbox']

            x_min = max(min(x1, x2) - offset, 0)
            y_min = max(min(y1, y2) - offset, 0)
            x_max = min(max(x1 + w1, x2 + w2) + offset, img.shape[1])
            y_max = min(max(y1 + h1, y2 + h2) + offset, img.shape[0])

            distance = np.linalg.norm(np.array(hand1['center']) - np.array(hand2['center']))

            # If hands are close together, assume it's a combined two-hand sign
            if distance < 250:
                imgCrop = img[y_min:y_max, x_min:x_max]
                if imgCrop.size == 0:
                    continue
                imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
                imgResize = cv2.resize(imgCrop, (imgSize, imgSize))
                imgWhite[:imgResize.shape[0], :imgResize.shape[1]] = imgResize
                prediction, index = classifier.getPrediction(imgWhite, draw=False)
                confidence = prediction[index] * 100
                label = actions[index] if index < len(actions) else "Unknown"
                label_with_confidence = f"{label}: {confidence:.2f}%"
                imgOutput = putSinhalaText(imgOutput, label_with_confidence, (x_min, y_min - 60))
                cv2.rectangle(imgOutput, (x_min, y_min), (x_max, y_max), (255, 0, 255), 3)
                cv2.imshow("CombinedCrop", imgCrop)
            else:
                # Hands too far apart → skip or warn
                imgOutput = putSinhalaText(imgOutput, "Too far apart for 2H sign", (30, 30), font_size=28, color=(0, 0, 255))

    cv2.imshow('Image', imgOutput)

    current_time = time.time()
    if (elapsed := current_time - prev_time) < 1 / fps_limit:
        time.sleep(1 / fps_limit - elapsed)
    prev_time = time.time()

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
