import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const GestureDetectionScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [timer, setTimer] = useState(2);
  const cameraRef = useRef(null);


  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      console.log('📸 Captured image:', photo.uri);

      // Send to API
      const response = await axios.post(API_URL, {
        image: photo.base64,
      });

      setDetectedText(response.data?.prediction || 'No gesture detected');
    } catch (error) {
      console.error('❌ API Error:', error.message);
      Alert.alert('API Error', 'Failed to send image to backend.');
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D4C5F9" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hand Gesture Detection</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <Camera
          style={{ flex: 1 }}
          type={Camera.Constants.Type.back}
          ref={cameraRef}
          onCameraReady={() => setCameraReady(true)}
          ratio="16:9"
        />

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}</Text>
        </View>

        {/* Detected Text */}
        {detectedText !== '' && (
          <View style={styles.detectedTextContainer}>
            <Text style={styles.detectedText}>{detectedText}</Text>
          </View>
        )}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <Text style={styles.detectingText}>Detecting....</Text>

        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.translateButton}
          onPress={() => navigation.navigate('TextToSpeech')}
        >
          <Text style={styles.translateButtonText}>Translate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D4C5F9' },
  header: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: 20, position: 'relative',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  closeButton: {
    position: 'absolute', right: 20, backgroundColor: 'white',
    borderRadius: 20, width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  cameraContainer: {
    flex: 1, backgroundColor: '#f5f5f5',
    marginHorizontal: 20, marginTop: 10, borderRadius: 20, overflow: 'hidden',
    position: 'relative',
  },
  timerContainer: {
    position: 'absolute', top: 20, left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: '#ff4444', borderRadius: 15,
    paddingHorizontal: 12, paddingVertical: 6, zIndex: 10,
  },
  timerText: { color: 'white', fontSize: 14, fontWeight: '600' },
  detectedTextContainer: {
    position: 'absolute', top: 80, left: 20, zIndex: 10,
  },
  detectedText: { color: '#00ff00', fontSize: 24, fontWeight: 'bold' },
  bottomContainer: {
    paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center',
  },
  detectingText: {
    fontSize: 16, color: '#333', marginBottom: 20, fontWeight: '500',
  },
  captureButton: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  captureButtonInner: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 3, borderColor: '#333',
  },
  translateButton: {
    backgroundColor: '#E6DAFE', borderRadius: 15,
    paddingHorizontal: 40, paddingVertical: 18, width: '100%',
    alignItems: 'center',
  },
  translateButtonText: {
    fontSize: 16, color: '#333', fontWeight: '600',
  },
});

export default GestureDetectionScreen;
