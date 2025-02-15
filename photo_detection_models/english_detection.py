import cv2
import numpy as np
import math
import time
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier

# Custom classifier that forces the input size to our desired value.
class MyClassifier(Classifier):
    def __init__(self, modelPath, input_size=200):
        # Initialize the parent Classifier.
        super().__init__(modelPath)
        self.input_size = input_size

    def getPrediction(self, img, draw=True):
        # Force resize the image to the specified input size.
        self.data = cv2.resize(img, (self.input_size, self.input_size))
        # Reshape to add batch dimension (1, input_size, input_size, 3)
        self.data = self.data.reshape(1, self.input_size, self.input_size, 3)
        # Normalize the image if needed (adjust based on your training)
        self.data = self.data.astype(np.float32) / 255.0
        # Get the prediction from the model
        prediction = self.model.predict(self.data)
        index = np.argmax(prediction)
        if draw:
            # (Optional) You can draw additional info on the image if desired.
            pass
        return prediction[0], index

# Initialize camera
cap = cv2.VideoCapture(0)

# Initialize hand detector (max 2 hands)
detector = HandDetector(maxHands=2)

# Use our custom classifier with input_size=200 (so the model gets images of shape (200,200,3))
classifier = MyClassifier("./hand_gesture_model_sinhala.h5", input_size=200)

# Parameters for cropping/resizing
offset = 20
imgSize = 200  # Our working size for the classifier

# Define gesture actions (update these with your actual labels)
actions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

# Frame rate control
fps_limit = 30
prev_time = import cv2
import numpy as np
import math
import time
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
from PIL import Image, ImageDraw, ImageFont  # Import Pillow modules

# Initialize camera
cap = cv2.VideoCapture(0)

# Initialize the hand detector
detector = HandDetector(maxHands=2)

# Initialize the gesture classifier
classifier = Classifier("./hand_gesture_model_sinhala.h5")

# Constants for padding and image size
offset = 20
imgSize = 300  # Make sure this matches your model's expected input size

# Define gesture actions with Sinhala letters
actions = ['ං', 'ග්', 'චි', 'ටි', 'ඩි', 'ත්', 'ද්', 'න්', 'ෆ', 'ෟ']

# Frame rate control
fps_limit = 30
prev_time = 0

# Load a Sinhala font using PIL (adjust path and font size as needed)
font_path = "NotoSansSinhala-Regular.ttf"  # Replace with your font file
font_size = 32  # Adjust size as needed
try:
    font = ImageFont.truetype(font_path, font_size)
except IOError:
    print("Font file not found. Please ensure the font file exists in the working directory.")
    font = ImageFont.load_default()

while True:
    success, img = cap.read()
    if not success:
        print("Failed to capture image from webcam")
        break

    imgOutput = img.copy()
    hands, img = detector.findHands(img)

    if hands:
        hand = hands[0]
        x, y, w, h = hand['bbox']

        imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
        imgCrop = img[y - offset:y + h + offset, x - offset:x + w + offset]

        if imgCrop.size == 0:
            continue

        imgResize = cv2.resize(imgCrop, (imgSize, imgSize))
        imgWhite[:imgResize.shape[0], :imgResize.shape[1]] = imgResize

        # Prepare image for classifier (if needed, normalization can be done here)
        imgInput = imgWhite  # Assuming classifier handles normalization

        # Get prediction from classifier
        prediction, index = classifier.getPrediction(imgInput, draw=False)
        confidence = prediction[index] * 100
        label_with_confidence = f"{actions[index]}: {confidence:.2f}%"

        # Instead of cv2.putText, we use PIL to draw Sinhala text
        # Convert the output image from OpenCV (BGR) to PIL image (RGB)
        img_pil = Image.fromarray(cv2.cvtColor(imgOutput, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(img_pil)
        # Draw a rectangle for background (optional, using PIL)
        draw.rectangle(((x - offset, y - offset - 70), (x - offset + 400, y - offset + 10)), fill=(0, 255, 0))
        # Draw the Sinhala label with confidence using the loaded font
        draw.text((x, y - 30), label_with_confidence, font=font, fill=(0, 0, 0))
        # Convert back to OpenCV format (BGR)
        imgOutput = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

        cv2.rectangle(imgOutput, (x - offset, y - offset), (x + w + offset, y + h + offset), (0, 255, 0), 4)
        cv2.imshow('ImageCrop', imgCrop)
        cv2.imshow('ImageWhite', imgWhite)

    cv2.imshow('Image', imgOutput)

    current_time = time.time()
    if current_time - prev_time < 1 / fps_limit:
        time.sleep(1 / fps_limit - (current_time - prev_time))
    prev_time = time.time()

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()


while True:
    # Capture a frame from the webcam
    success, img = cap.read()
    if not success:
        print("Failed to capture image from webcam")
        break

    imgOutput = img.copy()
    hands, img = detector.findHands(img)

    if hands:
        hand = hands[0]
        x, y, w, h = hand['bbox']

        # Create a white image of size (imgSize, imgSize)
        imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255

        # Crop the hand region with some padding (check ROI bounds if needed)
        imgCrop = img[y - offset:y + h + offset, x - offset:x + w + offset]
        if imgCrop.size == 0:
            continue  # Skip if the crop is invalid

        # Resize the cropped image to (imgSize, imgSize)
        imgResize = cv2.resize(imgCrop, (imgSize, imgSize))
        imgWhite[:imgResize.shape[0], :imgResize.shape[1]] = imgResize

        # We now have an image (imgWhite) of shape (200,200,3) that we pass to our classifier.
        # (Normalization is handled in our custom getPrediction method.)
        imgInput = imgWhite

        # Get prediction from our custom classifier
        prediction, index = classifier.getPrediction(imgInput, draw=False)
        confidence = prediction[index] * 100  # Convert to percentage

        label_with_confidence = f"{actions[index]}: {confidence:.2f}%"

        # Draw a filled rectangle for label background
        cv2.rectangle(imgOutput, (x - offset, y - offset - 70),
                      (x - offset + 400, y - offset + 10), (0, 255, 0), cv2.FILLED)
        cv2.putText(imgOutput, label_with_confidence, (x, y - 30),
                    cv2.FONT_HERSHEY_COMPLEX, 2, (0, 0, 0), 2)
        cv2.rectangle(imgOutput, (x - offset, y - offset),
                      (x + w + offset, y + h + offset), (0, 255, 0), 4)

        # Show the cropped and white images for debugging
        cv2.imshow('ImageCrop', imgCrop)
        cv2.imshow('ImageWhite', imgWhite)

    # Show the main output image
    cv2.imshow('Image', imgOutput)

    # Frame rate control
    current_time = time.time()
    if current_time - prev_time < 1 / fps_limit:
        time.sleep(1 / fps_limit - (current_time - prev_time))
    prev_time = time.time()

    # Exit if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release camera resources and close windows
cap.release()
cv2.destroyAllWindows()
