import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const HandPointer = () => (
  <View style={styles.handContainer}>
    <Svg width={100} height={100} viewBox="0 0 100 100">
      {/* Hand */}
      <Path 
        d="M30 40 C30 35, 35 30, 40 30 C45 30, 50 33, 50 40 L50 70 C50 75, 45 80, 40 80 C35 80, 30 75, 30 70 Z" 
        fill="#f5d0a9" 
      />
      {/* Finger pointing up */}
      <Path 
        d="M40 30 C40 25, 43 20, 48 20 C53 20, 56 25, 56 30 L56 40 C56 45, 53 50, 48 50 C43 50, 40 45, 40 40 Z" 
        fill="#f5d0a9" 
      />
      {/* Sleeve */}
      <Path 
        d="M30 70 C30 85, 45 85, 50 85 L50 70 Z" 
        fill="#e74c3c" 
      />
    </Svg>
  </View>
);

const ProgressBar = ({ current, total }) => {
  const progress = (current / total) * 100;
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{current}/{total}</Text>
    </View>
  );
};

const AlphabetLearningScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.basicText}>BASIC LEVEL</Text>
      </View>
      
      <Text style={styles.levelText}>LEVEL 01</Text>
      
      <ProgressBar current={1} total={6} />
      
      <View style={styles.letterContainer}>
        <Text style={styles.letterText}>A</Text>
        <HandPointer />
      </View>
      
      <TouchableOpacity style={styles.nextButton}>
        <Text style={styles.nextButtonText}>NEXT</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5c6e8',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 30,
    alignItems: 'center',
  },
  basicText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
    marginVertical: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5d5b8d',
    borderRadius: 10,
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  letterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  letterText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#000',
  },
  handContainer: {
    position: 'absolute',
    right: width * 0.1,
    bottom: height * 0.1,
  },
  nextButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AlphabetLearningScreen;