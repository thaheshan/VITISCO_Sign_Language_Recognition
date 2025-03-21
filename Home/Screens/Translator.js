import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';

export default function SignLanguageTranslatorUI() {
  const navigation = useNavigation();
  const [isDetecting, setIsDetecting] = useState(true);
  const [timer, setTimer] = useState(2);
  const [convertedText, setConvertedText] = useState('');
  const [cameraType, setCameraType] = useState('front');
  
  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isDetecting) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isDetecting]);

  // Format timer as 0:00:00
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const convertToText = () => {
    const signLetters = ['A', 'B', 'C', 'D', 'E'];
    const randomLetter = signLetters[Math.floor(Math.random() * signLetters.length)];
    setConvertedText(prevText => prevText + randomLetter);
    Alert.alert("Converted", `Detected sign: ${randomLetter}`);
  };

  const toggleCameraType = () => {
    setCameraType(prevType => prevType === 'front' ? 'back' : 'front');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hand Gesture Detection</Text>
      </View>
      
      <View style={styles.cameraContainer}>
        {/* Camera placeholder instead of actual Camera component */}
        <View style={[styles.camera, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'white', fontSize: 16 }}>Camera Preview</Text>
          <Text style={{ color: 'white', marginTop: 10 }}>Camera type: {cameraType}</Text>
        </View>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isDetecting ? 'Detecting...' : 'Paused'}
          </Text>
          <TouchableOpacity 
            style={styles.recordButton}
            onPress={() => setIsDetecting(prev => !prev)}
          >
            <View style={isDetecting ? styles.recordButtonInnerActive : styles.recordButtonInner} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
          <Text style={styles.flipText}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.convertButton}
          onPress={convertToText}
        >
          <Text style={styles.convertButtonText}>Detect Sign</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.convertButton, {marginTop: 10}]}
          onPress={() => navigation.navigate('TextToSpeech', {text: convertedText}, { animation: 'slide_from_right' })}
        >
          <Text style={styles.convertButtonText}>Convert to Speech</Text>
        </TouchableOpacity>
      </View>
      
      {convertedText ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Detected Text:</Text>
          <Text style={styles.resultText}>{convertedText}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6fa', // Light purple background
  },
  header: {
    backgroundColor: '#e6e6fa',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
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
    justifyContent: 'center', // Center the content horizontally
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
  controls: {
    padding: 20,
    backgroundColor: '#e6e6fa',
  },
  convertButton: {
    backgroundColor: '#4169e1', // Royal blue
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  convertButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flipButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  flipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 18,
  }
});

