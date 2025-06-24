# -*- coding: utf-8 -*-
import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from pathlib import Path

# Path to dataset
dataset_path = Path(r"C:\Users\Thahe\Desktop\data collection")

# Image settings
image_size = 300
batch_size = 32
epochs = 10  # Consider increasing this (see below)

# Load images and labels
X, y = [], []
class_labels = {}
for idx, folder in enumerate(sorted(dataset_path.iterdir())):
    if folder.is_dir():
        class_labels[str(folder.name)] = idx

num_classes = len(class_labels)
print(f"Detected {num_classes} classes: {class_labels}")

for label_name, label_idx in class_labels.items():
    folder_path = dataset_path / label_name
    for file in folder_path.iterdir():
        if file.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
            continue
        try:
            with file.open('rb') as f:
                img_bytes = np.frombuffer(f.read(), np.uint8)
                img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
        except Exception as e:
            print(f"Error reading {file}: {str(e)}")
            continue

        if img is None:
            print(f"Warning: Could not decode image {file}")
            continue

        img = cv2.resize(img, (image_size, image_size))
        img = img / 255.0
        X.append(img)
        y.append(label_idx)

X = np.array(X, dtype=np.float32)
y = np.array(y)
print("Total samples:", len(X))
print("Unique classes:", np.unique(y))

# Split dataset
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
y_train = keras.utils.to_categorical(y_train, num_classes)
y_val = keras.utils.to_categorical(y_val, num_classes)

# Data Augmentation
datagen = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2
)
datagen.fit(X_train)

# CNN Model
model = keras.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(image_size, image_size, 3)),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Flatten(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),
    layers.BatchNormalization(),
    layers.Dense(num_classes, activation='softmax')
])

# Compile
model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Callbacks
early_stopping = keras.callbacks.EarlyStopping(
    monitor='val_loss', patience=5, restore_best_weights=True)

reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss', factor=0.5, patience=3)

# Train
history = model.fit(datagen.flow(X_train, y_train, batch_size=batch_size),
                    epochs=epochs,
                    validation_data=(X_val, y_val),
                    callbacks=[early_stopping, reduce_lr])

# Save
model.save("VITISCO3.h5")
print("✅ Model training completed and saved as VITISCO2.h5")
