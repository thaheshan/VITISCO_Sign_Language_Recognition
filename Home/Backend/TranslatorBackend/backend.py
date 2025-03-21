from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import cv2
import tensorflow as tf
import threading
import time
import os
import logging
from io import BytesIO
from PIL import Image
import mediapipe as mp
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("sign_language_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables
model = None
model_loaded = False
model_loading = False
labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
          'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
          'space', 'del', 'nothing']

# Set up MediaPipe hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def load_model_async():
    """Load the TensorFlow model in a separate thread"""
    global model, model_loaded, model_loading
    
    if model_loading:
        logger.info("Model is already loading...")
        return
    
    model_loading = True
    logger.info("Loading sign language detection model...")
    
    try:
        # Load the model - replace with path to your H5 model
        model_path = 'sign_language_model.h5'
        
        # Check if model file exists
        if not os.path.exists(model_path):
            logger.error(f"Error: Model file '{model_path}' not found.")
            model_loading = False
            return
        
        # Load the model
        model = tf.keras.models.load_model(model_path)
        
        # Warm up the model with a dummy prediction
        dummy_input = np.zeros((1, 224, 224, 3), dtype=np.float32)
        model.predict(dummy_input)
        
        model_loaded = True
        logger.info("Sign language detection model loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        model_loaded = False
    finally:
        model_loading = False

# Start loading the model in a background thread when server starts
threading.Thread(target=load_model_async).start()

def detect_and_crop_hand(image):
    """Detect and crop the hand region using MediaPipe"""
    # Convert BGR image to RGB
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_height, image_width, _ = rgb_image.shape
    
    # Process the image and find hands
    results = hands.process(rgb_image)
    
    if results.multi_hand_landmarks:
        # Get the first detected hand
        hand_landmarks = results.multi_hand_landmarks[0]
        
        # Find bounding box coordinates
        x_min, y_min = image_width, image_height
        x_max, y_max = 0, 0
        
        for landmark in hand_landmarks.landmark:
            x, y = int(landmark.x * image_width), int(landmark.y * image_height)
            x_min = min(x_min, x)
            y_min = min(y_min, y)
            x_max = max(x_max, x)
            y_max = max(y_max, y)
        
        # Add padding
        padding = int(max(image_width, image_height) * 0.1)
        x_min = max(0, x_min - padding)
        y_min = max(0, y_min - padding)
        x_max = min(image_width, x_max + padding)
        y_max = min(image_height, y_max + padding)
        
        # Crop the hand region
        hand_region = image[y_min:y_max, x_min:x_max]
        
        # Make it square by finding the max dimension
        width, height = x_max - x_min, y_max - y_min
        max_dim = max(width, height)
        
        # Create a square black background
        square_hand = np.zeros((max_dim, max_dim, 3), dtype=np.uint8)
        
        # Place the hand region in the center of the square
        offset_x = (max_dim - width) // 2
        offset_y = (max_dim - height) // 2
        square_hand[offset_y:offset_y+height, offset_x:offset_x+width] = hand_region
        
        # Create a debug image with landmarks drawn on it
        debug_image = rgb_image.copy()
        mp_drawing.draw_landmarks(debug_image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
        
        # Draw bounding box
        cv2.rectangle(debug_image, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
        
        return square_hand, True, debug_image
    
    return image, False, image

def preprocess_image(image):
    """Preprocess the image for the model"""
    # Resize image to the input size expected by the model
    image = cv2.resize(image, (224, 224))
    
    # Convert to RGB if needed
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
    
    # Normalize pixel values to [0, 1]
    image = image.astype(np.float32) / 255.0
    
    # Expand dimensions to create batch of size 1
    return np.expand_dims(image, axis=0)

def save_debug_image(image, prefix="debug"):
    """Save debug image to disk for troubleshooting"""
    debug_dir = "debug_images"
    if not os.path.exists(debug_dir):
        os.makedirs(debug_dir)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    filename = f"{debug_dir}/{prefix}_{timestamp}.jpg"
    cv2.imwrite(filename, image)
    logger.info(f"Saved debug image: {filename}")
    return filename

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/model-status', methods=['GET'])
def model_status():
    """Check if the model is loaded"""
    return jsonify({
        "loaded": model_loaded,
        "loading": model_loading,
        "model_name": "sign_language_model.h5" if model_loaded else None
    })

@app.route('/reload-model', methods=['POST'])
def reload_model():
    """Force reload the model"""
    global model_loaded
    model_loaded = False
    threading.Thread(target=load_model_async).start()
    return jsonify({"message": "Model reload initiated"})

@app.route('/detect-sign', methods=['POST'])
def detect_sign():
    """Detect sign language from image"""
    if not model_loaded:
        if not model_loading:
            # Try to load the model if it's not loading already
            threading.Thread(target=load_model_async).start()
        return jsonify({"error": "Model is still loading. Please try again later."}), 503
    
    # Get image data from request
    data = request.json
    
    if 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400
    
    try:
        # Decode base64 image
        base64_data = data['image']
        # Sometimes the base64 string comes with a data URL prefix, remove it if present
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
            
        image_data = base64.b64decode(base64_data)
        
        # Convert to OpenCV format
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"error": "Could not decode image"}), 400
        
        # Process image for hand detection
        hand_image, hand_detected, debug_image = detect_and_crop_hand(img)
        
        # Save debug images if needed
        debug_path = None
        if data.get('debug', False):
            debug_path = save_debug_image(debug_image, "debug")
            if hand_detected:
                save_debug_image(hand_image, "hand")
        
        if not hand_detected:
            logger.info("No hand detected in the image")
            return jsonify({
                "detected_sign": "",
                "confidence": 0.0,
                "message": "No hand detected in the image",
                "debug_image": debug_path
            })
        
        # Preprocess the hand image for the model
        processed_image = preprocess_image(hand_image)
        
        # Make prediction
        prediction = model.predict(processed_image)
        
        # Get the index of the highest probability
        predicted_index = np.argmax(prediction[0])
        
        # Get the corresponding label
        if predicted_index < len(labels):
            predicted_label = labels[predicted_index]
        else:
            predicted_label = "Unknown"
        
        # Get confidence score
        confidence = float(prediction[0][predicted_index])
        
        # Only return a prediction if confidence is above threshold
        if confidence > 0.65:  # 65% confidence threshold
            logger.info(f"Detected sign: {predicted_label} with confidence: {confidence:.2f}")
            return jsonify({
                "detected_sign": predicted_label,
                "confidence": confidence,
                "debug_image": debug_path
            })
        else:
            logger.info(f"Low confidence detection: {predicted_label} with confidence: {confidence:.2f}")
            return jsonify({
                "detected_sign": "",
                "confidence": confidence,
                "message": "Low confidence detection",
                "debug_image": debug_path
            })
            
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/supported-signs', methods=['GET'])
def supported_signs():
    """Return the list of supported sign language symbols"""
    return jsonify({
        "symbols": labels,
        "count": len(labels)
    })

@app.route('/static/debug/<path:filename>', methods=['GET'])
def serve_debug_image(filename):
    """Serve debug images for troubleshooting"""
    return send_from_directory('debug_images', filename)

if __name__ == '__main__':
    # Check if required Python packages are installed
    try:
        import tensorflow as tf
        import mediapipe as mp
        logger.info(f"TensorFlow version: {tf.__version__}")
        logger.info(f"MediaPipe version: {mp.__version__}")
    except ImportError as e:
        logger.error(f"Missing required dependency: {str(e)}")
        logger.error("Please install required packages: pip install tensorflow mediapipe opencv-python flask flask-cors pillow")
        exit(1)
    
    # Use host='0.0.0.0' to make the server accessible from other devices on your network
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)