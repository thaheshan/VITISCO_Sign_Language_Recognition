import cv2
import numpy as np
import time
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
from PIL import Image, ImageDraw, ImageFont  # For Sinhala text rendering

# Custom classifier with forced input size
class MyClassifier(Classifier):
    def __init__(self, modelPath, input_size=300):
        super().__init__(modelPath)
        self.input_size = input_size

    def getPrediction(self, img, draw=True):
        try:
            img_resized = cv2.resize(img, (self.input_size, self.input_size))
            img_normalized = img_resized / 255.0
            img_batch = np.expand_dims(img_normalized, axis=0)
            prediction = self.model.predict(img_batch)
            index = np.argmax(prediction)
            return prediction[0], index
        except Exception as e:
            print("Error in prediction:", e)
            return [0]*10, 0

# Draw Sinhala text using PIL
def putSinhalaText(img, text, position, font_path="../Iskoola Pota Regular.ttf", font_size=32, color=(0, 0, 0)):
    try:
        pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(pil_img)
        font = ImageFont.truetype(font_path, font_size)
        draw.text(position, text, font=font, fill=color)
        return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    except Exception as e:
        print("Font/Text render error:", e)
        return img

# Setup
cap = cv2.VideoCapture(0)
detector = HandDetector(maxHands=2)
model_path = "./VITISCO3.h5"

try:
    classifier = MyClassifier(model_path, input_size=300)
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

try:
    with open("labels.txt", "r", encoding="utf-8") as f:
        actions = [line.strip() for line in f.readlines()]
except FileNotFoundError:
    actions = ['ං', 'ග්', 'චි', 'ටි', 'ඩි', 'ත්', 'ද්', 'න්', 'ෆ', 'ෟ']

offset = 20
imgSize = 300
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
            aspect_ratio = h / w

            if aspect_ratio > 1:
                k = imgSize / h
                w_cal = int(k * w)
                imgResize = cv2.resize(imgCrop, (w_cal, imgSize))
                imgWhite[:, :w_cal] = imgResize
            else:
                k = imgSize / w
                h_cal = int(k * h)
                imgResize = cv2.resize(imgCrop, (imgSize, h_cal))
                imgWhite[:h_cal, :] = imgResize

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

            if distance < 250:
                imgCrop = img[y_min:y_max, x_min:x_max]
                if imgCrop.size == 0:
                    continue

                imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
                aspect_ratio = imgCrop.shape[0] / imgCrop.shape[1]

                if aspect_ratio > 1:
                    k = imgSize / imgCrop.shape[0]
                    w_cal = int(k * imgCrop.shape[1])
                    imgResize = cv2.resize(imgCrop, (w_cal, imgSize))
                    imgWhite[:, :w_cal] = imgResize
                else:
                    k = imgSize / imgCrop.shape[1]
                    h_cal = int(k * imgCrop.shape[0])
                    imgResize = cv2.resize(imgCrop, (imgSize, h_cal))
                    imgWhite[:h_cal, :] = imgResize

                prediction, index = classifier.getPrediction(imgWhite, draw=False)
                confidence = prediction[index] * 100
                label = actions[index] if index < len(actions) else "Unknown"
                label_with_confidence = f"{label}: {confidence:.2f}%"
                imgOutput = putSinhalaText(imgOutput, label_with_confidence, (x_min, y_min - 60))
                cv2.rectangle(imgOutput, (x_min, y_min), (x_max, y_max), (255, 0, 255), 3)
                cv2.imshow("CombinedCrop", imgCrop)
            else:
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
