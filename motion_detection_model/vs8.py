import os
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import TensorBoard
from tensorflow.keras.utils import to_categorical
from sklearn.metrics import multilabel_confusion_matrix, accuracy_score

# Define Actions
actions = ['thanks']  # Add more actions if needed
label_mapping = {label: num for num, label in enumerate(actions)}

# Paths and Parameters
DATA_COLLECTION_PATH = "MP_Data"  # Ensure the correct path
no_of_sequences = 50
sequences_length = 30
min_frames = 20
feature_size = 1662  # Adjust this based on the actual shape of .npy files

# Initialize Data Storage
sequences, labels = [], []

# Load Data
for action in actions:
    for sequence in range(no_of_sequences):
        window = []
        for frame_num in range(sequences_length):
            file_path = os.path.join(DATA_COLLECTION_PATH, action, str(sequence), f"{frame_num}.npy")
            try:
                res = np.load(file_path)
                # Ensure consistent shape for all loaded arrays
                if res.shape != (feature_size,):
                    print(f"File has inconsistent shape: {file_path} - {res.shape}, reshaping to ({feature_size},)")
                    # Try to reshape if possible, otherwise pad or truncate
                    if res.size >= feature_size:
                        res = res.flatten()[:feature_size]
                    else:
                        # Pad with zeros if smaller
                        temp = np.zeros((feature_size,))
                        temp[:res.size] = res.flatten()
                        res = temp
            except FileNotFoundError:
                print(f"File missing: {file_path} — Filling with zeros")
                res = np.zeros((feature_size,))
            
            # Ensure res is exactly the right shape before appending
            res = np.reshape(res, (feature_size,))
            window.append(res)
        
        # Append sequence only if it meets the minimum frame requirement
        if len(window) >= min_frames:
            # Pad the window to sequences_length if necessary
            while len(window) < sequences_length:
                window.append(np.zeros((feature_size,)))
                
            sequences.append(window)
            labels.append(label_mapping[action])

# Ensure dataset is not empty
if len(sequences) == 0 or len(labels) == 0:
    raise ValueError("No valid sequences or labels found, please check your dataset.")

# Convert data to NumPy arrays with explicit shape control
X = np.array(sequences, dtype='float32')
y = np.array(labels)

# Verify the shape before proceeding
print(f"Dataset shape: X={X.shape}, y={y.shape}")

# One-hot encode labels
y = to_categorical(y).astype(int)

# Train-test split
x_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.5, random_state=42)

# Build LSTM Model
model = Sequential([
    LSTM(64, return_sequences=True, activation='relu', input_shape=(sequences_length, feature_size)),
    LSTM(128, return_sequences=True, activation='relu'),
    LSTM(64, return_sequences=False, activation='relu'),
    Dense(64, activation='relu'),
    Dense(32, activation='relu'),
    Dense(len(actions), activation='softmax')  # Output layer
])

# Compile the model
model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

# TensorBoard callback
log_directory = os.path.join('Logs')
tb_callback = TensorBoard(log_dir=log_directory)

# Train Model
model.fit(x_train, y_train, epochs=700, callbacks=[tb_callback])

# Save Model
model.save('gesture_model_10.h5')

# Evaluate Model
yhat = model.predict(x_test)
ytrue = np.argmax(y_test, axis=1).tolist()
yhat = np.argmax(yhat, axis=1).tolist()

# Display Evaluation Metrics
print("Confusion Matrix:", multilabel_confusion_matrix(ytrue, yhat))
print("Accuracy:", accuracy_score(ytrue, yhat))