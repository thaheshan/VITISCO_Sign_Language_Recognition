import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const GestureDetectionScreen = ({navigation, route}) => {
  const [isDetecting, setIsDetecting] = useState(true);
  const [timer, setTimer] = useState(2);
  const [detectedText, setDetectedText] = useState('jht');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) return prev - 1;
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}:${Math.floor((seconds % 1) * 100).toString().padStart(2, '0')}`;
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D4C5F9" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hand Gesture Detection</Text>
        <TouchableOpacity style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Camera View with Hand Detection */}
      <View style={styles.cameraContainer}>
        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>



      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <Text style={styles.detectingText}>Detecting....</Text>
        
        <TouchableOpacity style={styles.captureButton}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.translateButton} onPress={() => navigation.navigate('TextToSpeech', {}, { animation: 'slide_from_right' })}>
          <Text style={styles.translateButtonText} >Translate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4C5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  timerContainer: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: '#ff4444',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  detectedTextContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    zIndex: 10,
  },
  detectedText: {
    color: '#00ff00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  skeletonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  detectingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    fontWeight: '500',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#333',
  },
  translateButton: {
    backgroundColor: '#E6DAFE',
    borderRadius: 15,
    paddingHorizontal: 40,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
  },
  translateButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});

export default GestureDetectionScreen;