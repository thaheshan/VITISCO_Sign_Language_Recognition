import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';

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
        <Image 
          source={require('./assets/image 01.png')} 
          style={styles.letterImage}
          resizeMode="contain"
        />

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
  },
  letterText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#000',
  },
  letterImage: {
    width: 500, // Adjust size accordingly
    height: 400,
    marginTop: -60, // Adds spacing below the letter "A"
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
