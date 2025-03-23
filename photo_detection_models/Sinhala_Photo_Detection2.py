import cv2
import numpy as np
import base64
import time
import logging
import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
from PIL import Image, ImageDraw, ImageFont
import io

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes and origins

# Custom classifier that forces the input size to our desired value
class MyClassifier(Classifier):
    def __init__(self, modelPath, input_size=200):
        super().__init__(modelPath)
        self.input_size = input_size
        logger.info(f"Classifier initialized with input size: {input_size}")

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
            logger.error(f"Error in prediction: {str(e)}")
            logger.error(traceback.format_exc())
            return [0]*10, 0  # Return a default value to prevent crashes

# Initialize detector and classifier
logger.info("Initializing hand detector...")
detector = HandDetector(maxHands=2)

# Load classifier model safely
model_path = "../hand_gesture_model_sinhala.h5"
try:
    logger.info(f"Loading classifier model from: {model_path}")
    if not os.path.exists(model_path):
        logger.warning(f"Model file not found at {model_path}, searching in current directory...")
        # Try to find model in current directory
        if os.path.exists("hand_gesture_model_sinhala.h5"):
            model_path = "hand_gesture_model_sinhala.h5"
            logger.info(f"Found model in current directory: {model_path}")
        else:
            logger.error("Model file not found!")

    classifier = MyClassifier(model_path, input_size=200)
    logger.info("Classifier loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    logger.error(traceback.format_exc())
    exit()

# Load gesture actions dynamically
try:
    labels_path = './labels.txt'
    logger.info(f"Loading labels from: {labels_path}")
    if os.path.exists(labels_path):
        with open(labels_path, "r", encoding="utf-8") as f:
            actions = [line.strip() for line in f.readlines()]
        logger.info(f"Loaded {len(actions)} labels: {', '.join(actions)}")
    else:
        actions = ['ං', 'ග්', 'චි', 'ටි', 'ඩි', 'ත්', 'ද්', 'න්', 'ෆ', 'ෟ']  # Default fallback labels
        logger.warning(f"Labels file not found, using default labels: {', '.join(actions)}")
except Exception as e:
    logger.error(f"Error loading labels: {str(e)}")
    actions = ['ං', 'ග්', 'චි', 'ටි', 'ඩි', 'ත්', 'ද්', 'න්', 'ෆ', 'ෟ']  # Default fallback labels
    logger.warning(f"Using default labels due to error: {', '.join(actions)}")

# Load Sinhala font
font_path = "../Iskoola Pota Regular.ttf"


try:
    logger.info(f"Loading Sinhala font from: {font_path}")
    if not os.path.exists(font_path):
        logger.warning(f"Sinhala font not found at {font_path}, searching in common locations...")
        # Try common font locations
        common_font_paths = [
            "/usr/share/fonts/truetype/sinhala/lklug.ttf",  # Debian/Ubuntu
            "/usr/share/fonts/truetype/lklug/lklug.ttf",
            "fonts/sinhala_font.ttf",
            "../fonts/sinhala_font.ttf",
            "assets/fonts/sinhala_font.ttf",
            "../assets/fonts/sinhala_font.ttf",
        ]
        for path in common_font_paths:
            if os.path.exists(path):
                font_path = path
                logger.info(f"Found Sinhala font at: {font_path}")
                break
        else:
            logger.warning("Sinhala font not found, text rendering may use fallback fonts")
    
    # Try to load the font to verify it works
    try:
        sinhala_font = ImageFont.truetype(font_path, 36)
        logger.info("Sinhala font loaded successfully")
    except Exception as e:
        logger.warning(f"Could not load Sinhala font: {str(e)}")
except Exception as e:
    logger.error(f"Error in font loading process: {str(e)}")
    logger.error(traceback.format_exc())

# Image size parameters
offset = 20
imgSize = 200

@app.route('/detect', methods=['POST'])
def detect_gesture():
    try:
        logger.info("Received detection request")
        
        # Get image from request
        data = request.json
        if not data:
            logger.warning("No JSON data in request")
            return jsonify({"error": "No data provided"}), 400
            
        image_data = data.get('image')
        
        if not image_data:
            logger.warning("No image data in request")
            return jsonify({"error": "No image provided"}), 400
        
        # Convert base64 to image
        try:
            # Handle data URI or raw base64
            if ',' in image_data:
                image_bytes = base64.b64decode(image_data.split(',')[1])
            else:
                image_bytes = base64.b64decode(image_data)
                
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                logger.error("Failed to decode image")
                return jsonify({"error": "Invalid image data"}), 400
                
            logger.info(f"Image decoded successfully, shape: {img.shape}")
        except Exception as e:
            logger.error(f"Error decoding image: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({"error": f"Error decoding image: {str(e)}"}), 400
        
        # Process image
        logger.info("Finding hands in image...")
        hands, img = detector.findHands(img)
        
        result = {
            "detected": False,
            "gestures": []
        }
        
        if hands:
            logger.info(f"Detected {len(hands)} hands")
            result["detected"] = True
            
            for i, hand in enumerate(hands):
                logger.info(f"Processing hand {i+1}")
                x, y, w, h = hand['bbox']

                # Ensure crop region is within bounds
                y1, y2 = max(0, y - offset), min(img.shape[0], y + h + offset)
                x1, x2 = max(0, x - offset), min(img.shape[1], x + w + offset)
                imgCrop = img[y1:y2, x1:x2]
                
                if imgCrop.size == 0:
                    logger.warning(f"Hand {i+1}: Cropped image has zero size, skipping")
                    continue

                # Preprocess image for classifier
                imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
                
                try:
                    imgResize = cv2.resize(imgCrop, (imgSize, imgSize))
                    imgWhite[:imgResize.shape[0], :imgResize.shape[1]] = imgResize
                
                    # Get prediction
                    logger.info(f"Getting prediction for hand {i+1}")
                    prediction, index = classifier.getPrediction(imgWhite, draw=False)
                    confidence = float(prediction[index])
                    
                    # Guard against index out of range
                    if index < len(actions):
                        label = actions[index]
                    else:
                        logger.warning(f"Index {index} out of range for actions list (length {len(actions)})")
                        label = "Unknown"
                    
                    logger.info(f"Hand {i+1}: Detected gesture '{label}' with confidence {confidence:.2f}")
                    
                    # Add to results
                    result["gestures"].append({
                        "label": label,
                        "confidence": confidence,
                        "position": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
                    })
                    
                    # Optional: Draw the recognized character on the image for debugging
                    try:
                        # Convert OpenCV image to PIL
                        pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                        draw = ImageDraw.Draw(pil_img)
                        
                        # Draw with Sinhala font if available
                        if 'sinhala_font' in globals():
                            draw.text((x, y-50), label, font=sinhala_font, fill=(255, 0, 0))
                        else:
                            # Fallback to default font
                            cv2.putText(img, label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 0, 0), 2)
                            
                        # No need to convert back since we're not returning the image
                    except Exception as e:
                        logger.error(f"Error drawing text: {str(e)}")
                        
                except Exception as e:
                    logger.error(f"Error processing hand {i+1}: {str(e)}")
                    logger.error(traceback.format_exc())
        else:
            logger.info("No hands detected in image")
        
        logger.info(f"Returning result: {result}")
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Unhandled error in detect_gesture: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/test', methods=['GET', 'POST'])
def test():
    """Simple test endpoint to verify server is running"""
    return jsonify({
        "status": "ok", 
        "message": "Python gesture detection service is running",
        "version": "1.0.0"
    })

@app.route('/api/message', methods=['GET'])
def message():
    """Compatibility endpoint for React Native app"""
    return jsonify({
        "message": "Python service is available"
    })

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Log startup info
    logger.info(f"Starting Flask server on port {port}")
    logger.info(f"Debug mode: {app.debug}")
    logger.info(f"Model path: {model_path}")
    logger.info(f"Labels: {actions}")
    logger.info(f"Sinhala font path: {font_path}")
    
    # Run the app on 0.0.0.0 to make it accessible from other devices
    app.run(host='0.0.0.0', port=port, debug=True)