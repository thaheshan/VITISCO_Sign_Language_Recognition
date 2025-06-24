import cv2
import numpy as np
import time
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
from PIL import Image, ImageDraw, ImageFont
import os
import pygame  # For audio playback
import threading
from gtts import gTTS  # Google Text-to-Speech

import tensorflow as tf



# Custom classifier that forces the input size to our desired value.
class MyClassifier(Classifier):
    def __init__(self, modelPath, input_size=200):
        super().__init__(modelPath)
        self.input_size = input_size

    def getPrediction(self, img, draw=True):
        try:
            img_resized = cv2.resize(img, (self.input_size, self.input_size))
            blob = cv2.dnn.blobFromImage(img_resized, scalefactor=1/255.0, size=(self.input_size, self.input_size), swapRB=True)
            
            # Convert (1, 3, H, W) → (1, H, W, 3)
            blob = np.transpose(blob, (0, 2, 3, 1))  

            prediction = self.model.predict(blob)
            index = np.argmax(prediction)
            return prediction[0], index
        except Exception as e:
            print("Error in prediction:", e)
            return [0]*10, 0  # Return a default value to prevent crashes

# Function to draw Sinhala text on an OpenCV image
def putSinhalaText(img, text, position, font_path="../Iskoola Pota Regular.ttf", font_size=32, color=(0, 0, 0)):
    """
    Draw Sinhala text on an OpenCV image using PIL.
    - img: OpenCV image
    - text: Sinhala text
    - position: Tuple (x, y)
    - font_path: Path to Sinhala-supporting TTF font
    - font_size: Font size
    - color: Text color (BGR)
    """
    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)

    try:
        font = ImageFont.truetype(font_path, font_size)
    except Exception as e:
        print("Error loading font:", e)
        return img  # Return original image if font loading fails

    draw.text(position, text, font=font, fill=color)
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

# Text-to-Speech function for Sinhala
def speak_text(text, lang='si'):
    """
    Convert text to speech and play it
    - text: Text to speak
    - lang: Language code ('si' for Sinhala)
    """
    # Create output directory if it doesn't exist
    if not os.path.exists("audio_cache"):
        os.makedirs("audio_cache")
    
    # Generate a filename based on the text content
    filename = f"audio_cache/speech_{hash(text) % 10000}.mp3"
    
    # Only generate speech file if it doesn't already exist
    if not os.path.exists(filename):
        try:
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.save(filename)
        except Exception as e:
            print(f"Error generating speech: {e}")
            return
    
    # Play the audio in a non-blocking way
    try:
        pygame.mixer.init()
        pygame.mixer.music.load(filename)
        pygame.mixer.music.play()
    except Exception as e:
        print(f"Error playing audio: {e}")

# Class to manage text accumulation and sentence formation
class TextAccumulator:
    def __init__(self):
        self.current_text = ""
        self.sentence_buffer = ""
        self.last_gesture = ""
        self.last_gesture_time = 0
        self.sentence_timeout = 5  # seconds to wait before considering a sentence complete
        self.speaking_lock = threading.Lock()
        
    def add_gesture(self, gesture, confidence):
        current_time = time.time()
        
        # Skip if same gesture detected multiple times in a row (with a threshold)
        if gesture == self.last_gesture and current_time - self.last_gesture_time < 1.0:
            return False
        
        # Check if we should finalize the current sentence due to timeout
        if current_time - self.last_gesture_time > self.sentence_timeout and self.sentence_buffer:
            self.finalize_sentence()
        
        # Add the new gesture to our buffer
        self.sentence_buffer += gesture
        self.last_gesture = gesture
        self.last_gesture_time = current_time
        return True
    
    def finalize_sentence(self):
        """Finalize the current sentence and speak it"""
        if not self.sentence_buffer:
            return
        
        # Add the sentence to our accumulated text
        if self.current_text:
            self.current_text += " "
        self.current_text += self.sentence_buffer
        
        # Speak the sentence in a separate thread
        threading.Thread(target=self._speak_sentence, args=(self.sentence_buffer,)).start()
        
        # Clear the buffer for the next sentence
        self.sentence_buffer = ""
    
    def _speak_sentence(self, text):
        with self.speaking_lock:
            speak_text(text)
    
    def get_display_text(self):
        """Get text to display on screen"""
        if self.current_text and self.sentence_buffer:
            return f"{self.current_text} | {self.sentence_buffer}"
        elif self.sentence_buffer:
            return f"| {self.sentence_buffer}"
        else:
            return self.current_text
    
    def clear_all(self):
        """Clear all accumulated text"""
        self.current_text = ""
        self.sentence_buffer = ""

# Initialize pygame for audio
pygame.init()

# Initialize camera
cap = cv2.VideoCapture(0)
detector = HandDetector(maxHands=2)

# Initialize text accumulator
text_accumulator = TextAccumulator()

# Load classifier model safely
model_path = "./hand_gesture_model_sinhala.h5"
try:
    classifier = MyClassifier(model_path, input_size=200)
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# Load gesture actions dynamically (ensure labels.txt is UTF-8 encoded)
try:
    with open("labels.txt", "r", encoding="utf-8") as f:
        actions = [line.strip() for line in f.readlines()]
except FileNotFoundError:
    actions = ['ං', 'ග්', 'චි', 'ටි', 'ඩි', 'ත්', 'ද්', 'න්', 'ෆ', 'ෟ']  # Default fallback labels

# Image size parameters
offset = 20
imgSize = 200  
fps_limit = 30
prev_time = time.time()

# Control variables
confidence_threshold = 75  # Minimum confidence to accept a gesture
is_paused = False
last_key_press_time = 0

print("Controls:")
print("  'q' - Quit")
print("  'c' - Clear text")
print("  'p' - Pause/Resume detection")
print("  's' - Speak current sentence")
print("  'space' - Finalize current sentence")

while True:
    success, img = cap.read()
    if not success:
        print("Failed to capture image from webcam")
        break
    
    imgOutput = img.copy()
    
    # Add text display area at the bottom
    text_area = np.ones((100, img.shape[1], 3), dtype=np.uint8) * 255
    imgOutput = np.vstack([imgOutput, text_area])
    
    # Display current accumulated text
    display_text = text_accumulator.get_display_text()
    imgOutput = putSinhalaText(imgOutput, display_text, (10, img.shape[0] + 30))
    
    # Process hand gestures only if not paused
    if not is_paused:
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
                try:
                    imgResize = cv2.resize(imgCrop, (imgSize, imgSize))
                    imgWhite[:imgResize.shape[0], :imgResize.shape[1]] = imgResize
                
                    # Get prediction
                    prediction, index = classifier.getPrediction(imgWhite, draw=False)
                    confidence = prediction[index] * 100
                    
                    # Only accept predictions with confidence above threshold
                    if confidence >= confidence_threshold:
                        label = actions[index] if index < len(actions) else "Unknown"
                        label_with_confidence = f"{label}: {confidence:.2f}%"
                        
                        # Add the gesture to our text accumulator
                        if text_accumulator.add_gesture(label, confidence):
                            print(f"Detected: {label} ({confidence:.2f}%)")

                        # Draw results (use Sinhala text rendering)
                        imgOutput = putSinhalaText(imgOutput, label_with_confidence, (x1, y1 - 60))
                        
                        # Draw bounding boxes
                        cv2.rectangle(imgOutput, (x1, y1), (x2, y2), (0, 255, 0), 4)
                except Exception as e:
                    print(f"Error processing hand: {e}")
    
    # Display status information
    status = "PAUSED" if is_paused else "ACTIVE"
    cv2.putText(imgOutput, status, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255) if is_paused else (0, 255, 0), 2)
    
    cv2.imshow('Sinhala Hand Gesture Translator', imgOutput)

    # Frame rate control
    current_time = time.time()
    elapsed_time = current_time - prev_time
    if elapsed_time < 1 / fps_limit:
        time.sleep(1 / fps_limit - elapsed_time)
    prev_time = time.time()

    # Handle key presses
    key = cv2.waitKey(1) & 0xFF
    
    # Throttle key presses to prevent repeated triggers
    if current_time - last_key_press_time > 0.3:
        if key == ord('q'):
            break
        elif key == ord('c'):
            text_accumulator.clear_all()
            last_key_press_time = current_time
        elif key == ord('p'):
            is_paused = not is_paused
            last_key_press_time = current_time
        elif key == ord('s'):
            threading.Thread(target=speak_text, args=(text_accumulator.get_display_text(),)).start()
            last_key_press_time = current_time
        elif key == 32:  # Space bar
            text_accumulator.finalize_sentence()
            last_key_press_time = current_time

# Release resources
cap.release()
cv2.destroyAllWindows()
pygame.quit()