import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

// Properly import Camera and its constants with improved validation
let Camera, CameraType, FlashMode;
try {
  const ExpoCamera = require('expo-camera');
  Camera = ExpoCamera.Camera;
  CameraType = ExpoCamera.CameraType;
  FlashMode = ExpoCamera.FlashMode;
  
  // Verify Camera is a valid component
  if (typeof Camera !== 'function' && typeof Camera !== 'object') {
    console.error("Camera is not a valid component:", Camera);
    Camera = null;
  }
} catch (error) {
  console.error("Error importing Camera:", error);
  Camera = null;
  CameraType = { front: 'front', back: 'back' };
  FlashMode = { off: 'off', torch: 'torch' };
}

import * as MediaLibrary from 'expo-media-library';

// Import API client
import SignLanguageAPI from './api';

// Optional: Import Haptics if available
let Haptics;
try {
  Haptics = require('expo-haptics');
} catch (error) {
  // Haptics not available, create dummy functions
  Haptics = {
    impactAsync: () => Promise.resolve(),
    notificationAsync: () => Promise.resolve(),
    ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
    NotificationFeedbackType: { Success: 'success', Error: 'error' }
  };
}

export default function SignLanguageTranslatorUI() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [convertedText, setConvertedText] = useState('');
  const [cameraType, setCameraType] = useState(CameraType?.front || 'front');
  const [flashMode, setFlashMode] = useState(FlashMode?.off || 'off');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  const cameraRef = useRef(null);
  
  // Request camera and media library permissions
  useEffect(() => {
    (async () => {
      try {
        if (!Camera) {
          setCameraError('Camera module not available');
          setHasPermission(false);
          return;
        }
        
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        
        setHasPermission(cameraStatus === 'granted');
        
        if (cameraStatus !== 'granted') {
          Alert.alert('Permission required', 'Camera permission is required for sign detection');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Permission Error', 'Failed to request camera permissions');
        setHasPermission(false);
        setCameraError(error.message);
      }
    })();
  }, []);

  // Check API connection on component mount
  useEffect(() => {
    checkApiConnection();
  }, []);
  
  // Function to check API connection
  const checkApiConnection = async () => {
    try {
      setConnectionStatus('checking');
      const result = await SignLanguageAPI.testConnection();
      console.log('API connection result:', result.data);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('API connection failed:', error);
      setConnectionStatus('disconnected');
      Alert.alert(
        'Connection Error',
        'Could not connect to the server. Please check your network and server settings.',
        [
          { text: 'Retry', onPress: checkApiConnection },
          { text: 'OK' }
        ]
      );
    }
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isDetecting) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      
      // Set up continuous detection if detection is on
      startContinuousDetection();
    } else {
      clearInterval(interval);
      stopContinuousDetection();
    }
    
    return () => {
      clearInterval(interval);
      stopContinuousDetection();
    };
  }, [isDetecting]);

  // Start continuous detection
  const startContinuousDetection = () => {
    // Clear any existing interval
    if (detectionInterval) {
      clearInterval(detectionInterval);
    }
    
    // Set new interval for detection (every 2 seconds)
    const interval = setInterval(() => {
      if (!isProcessing) {
        detectGesture();
      }
    }, 2000);
    
    setDetectionInterval(interval);
  };

  // Stop continuous detection
  const stopContinuousDetection = () => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
  };

  // Format timer as 0:00:00
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Take picture and detect gesture
  const detectGesture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        
        // Provide haptic feedback
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (error) {
            // Haptics not available, ignore
          }
        }
        
        // Take photo
        const photo = await cameraRef.current.takePictureAsync({ 
          base64: true,
          quality: 0.8,
          exif: false
        });
        
        console.log('Photo taken, sending to API for gesture detection');
        
        // Use API client to send to backend
        const result = await SignLanguageAPI.detectGesture(
          `data:image/jpeg;base64,${photo.base64}`
        );
        
        console.log('Gesture detection result:', result);
        
        // Process response
        if (result.detected && result.gestures.length > 0) {
          const gesture = result.gestures[0]; // Use first detected gesture
          
          // Provide success haptic feedback
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              // Haptics not available, ignore
            }
          }
          
          // Add detected character to the text
          setConvertedText(prevText => prevText + gesture.label);
          
          // Optional: Save the image to device gallery
          if (gesture.confidence > 0.85) { // Only save high-confidence detections
            try {
              await MediaLibrary.saveToLibraryAsync(photo.uri);
            } catch (error) {
              console.log('Error saving image:', error);
            }
          }
        } else {
          // No gesture detected - provide error haptic feedback
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } catch (error) {
              // Haptics not available, ignore
            }
          }
          console.log('No gesture detected or confidence too low');
        }
      } catch (error) {
        console.error('Error detecting gesture:', error);
        Alert.alert('Detection failed', 'Failed to detect gesture. Please check your network connection and try again.');
        
        // Error haptic feedback
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch (error) {
            // Haptics not available, ignore
          }
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Toggle camera type
  const toggleCameraType = () => {
    setCameraType(prevType => 
      prevType === (CameraType?.front || 'front') 
        ? (CameraType?.back || 'back') 
        : (CameraType?.front || 'front')
    );
  };

  // Toggle flash (only for back camera)
  const toggleFlash = () => {
    if (cameraType === (CameraType?.back || 'back')) {
      setFlashMode(prevMode => 
        prevMode === (FlashMode?.off || 'off')
          ? (FlashMode?.torch || 'torch')
          : (FlashMode?.off || 'off')
      );
    }
  };

  // Toggle detection
  const toggleDetection = () => {
    setIsDetecting(prev => !prev);
    
    // Provide haptic feedback
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not available, ignore
      }
    }
  };

  // Clear detected text
  const clearText = () => {
    setConvertedText('');
    
    // Provide haptic feedback
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available, ignore
      }
    }
  };

  // Convert to speech
  const convertToSpeech = async () => {
    if (!convertedText) {
      Alert.alert('No text', 'Please detect signs first to convert to speech');
      return;
    }
    
    try {
      // Provide haptic feedback
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
          // Haptics not available, ignore
        }
      }
      
      // Send text to backend using API client
      const result = await SignLanguageAPI.textToSpeech(convertedText);
      
      // Navigate to TTS screen with text and audio URL from response
      navigation.navigate('TextToSpeech', {
        text: convertedText,
        audioUrl: result.audioUrl || null
      });
    } catch (error) {
      console.error('Error converting to speech:', error);
      Alert.alert('Conversion failed', 'Failed to convert text to speech. Please check your network connection.');
    }
  };

  // For camera module testing
  const checkCameraModuleAvailability = () => {
    console.log('Camera module availability check:');
    console.log('Camera available:', Camera !== null);
    console.log('CameraType available:', CameraType !== null);
    console.log('FlashMode available:', FlashMode !== null);
  };

  // Run check
  useEffect(() => {
    checkCameraModuleAvailability();
  }, []);

  // Render connection status indicator
  const renderConnectionStatus = () => {
    if (connectionStatus === 'checking') {
      return (
        <View style={styles.connectionStatus}>
          <ActivityIndicator size="small" color="#4169e1" />
          <Text style={styles.connectionStatusText}>Checking connection...</Text>
        </View>
      );
    } else if (connectionStatus === 'connected') {
      return (
        <View style={styles.connectionStatus}>
          <View style={styles.connectedIndicator} />
          <Text style={styles.connectionStatusText}>Server connected</Text>
        </View>
      );
    } else {
      return (
        <TouchableOpacity style={styles.connectionStatus} onPress={checkApiConnection}>
          <View style={styles.disconnectedIndicator} />
          <Text style={styles.connectionStatusText}>Server disconnected - Tap to retry</Text>
        </TouchableOpacity>
      );
    }
  };

  // If permission not granted
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4169e1" />
        <Text style={styles.loadingText}>Requesting camera permissions...</Text>
      </SafeAreaView>
    );
  }
  
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          {cameraError ? `Camera error: ${cameraError}` : 'Camera permission not granted'}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={async () => {
            try {
              if (!Camera) {
                Alert.alert('Camera Module Error', 'The camera module is not available on this device.');
                return;
              }
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            } catch (error) {
              console.error('Error requesting camera permission:', error);
              Alert.alert('Permission Error', 'Failed to request camera permissions');
            }
          }}
        >
          <Text style={styles.retryButtonText}>Request Permission Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Fallback camera component if needed
  const FallbackCameraComponent = () => (
    <View style={[styles.camera, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: 'white', fontSize: 16 }}>Camera Module Error</Text>
      <Text style={{ color: 'white', marginTop: 10 }}>
        Camera type: {cameraType === (CameraType?.front || 'front') ? 'front' : 'back'}
      </Text>
      <TouchableOpacity 
        style={{ marginTop: 20, backgroundColor: '#4169e1', padding: 10, borderRadius: 5 }}
        onPress={detectGesture}
      >
        <Text style={{ color: 'white' }}>Take Photo Anyway</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e6e6fa" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hand Gesture Detection</Text>
        {renderConnectionStatus()}
      </View>
      
      <View style={styles.cameraContainer}>
        {/* Improved Camera component check */}
        {(Camera && typeof Camera === 'function') ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            flashMode={flashMode}
            ratio="16:9"
            onError={(error) => {
              console.error("Camera error:", error);
              setCameraError(error.message || "Unknown camera error");
            }}
          />
        ) : (
          <FallbackCameraComponent />
        )}
        
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isDetecting ? 'Detecting...' : 'Paused'}
          </Text>
          <TouchableOpacity 
            style={styles.recordButton}
            onPress={toggleDetection}
          >
            <View style={isDetecting ? styles.recordButtonInnerActive : styles.recordButtonInner} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraType}>
            <Text style={styles.cameraButtonText}>Flip</Text>
          </TouchableOpacity>
          
          {cameraType === (CameraType?.back || 'back') && (
            <TouchableOpacity style={styles.cameraButton} onPress={toggleFlash}>
              <Text style={styles.cameraButtonText}>
                {flashMode === (FlashMode?.torch || 'torch') ? 'Flash Off' : 'Flash On'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[
            styles.convertButton,
            isProcessing && styles.disabledButton
          ]}
          onPress={detectGesture}
          disabled={isProcessing}
        >
          <Text style={styles.convertButtonText}>Detect Sign</Text>
        </TouchableOpacity>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.clearButton,
              !convertedText && styles.disabledActionButton
            ]}
            onPress={clearText}
            disabled={!convertedText}
          >
            <Text style={styles.actionButtonText}>Clear Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.speechButton,
              !convertedText && styles.disabledActionButton
            ]}
            onPress={convertToSpeech}
            disabled={!convertedText}
          >
            <Text style={styles.actionButtonText}>Convert to Speech</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Detected Text:</Text>
        <Text style={styles.resultText}>
          {convertedText || "No signs detected yet"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6fa', // Light purple background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#e6e6fa',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    marginHorizontal: 10,
    marginBottom: 5,
    marginTop: 5,
  },
  connectionStatusText: {
    fontSize: 12,
    marginLeft: 5,
  },
  connectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#32cd32', // Lime green
  },
  disconnectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff6347', // Tomato red
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 20,
    margin: 10,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    borderRadius: 20,
  },
  timerContainer: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 70, 70, 0.8)', // Red timer background
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  timer: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginRight: 10,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  recordButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  recordButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'red',
  },
  recordButtonInnerActive: {
    width: 20,
    height: 20,
    borderRadius: 3,
    backgroundColor: 'red',
  },
  cameraControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  controls: {
    padding: 20,
    backgroundColor: '#e6e6fa',
  },
  convertButton: {
    backgroundColor: '#4169e1', // Royal blue
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0', // Gray when disabled
  },
  convertButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#ff6347', // Tomato red
  },
  speechButton: {
    backgroundColor: '#32cd32', // Lime green
  },
  disabledActionButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#ddd',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 18,
    color: '#333',
    minHeight: 30,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  processingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#4169e1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 40,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

