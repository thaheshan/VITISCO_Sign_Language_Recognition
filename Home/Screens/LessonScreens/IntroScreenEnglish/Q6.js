import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function QuizIntroScreen({ navigate }) {
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.levelIndicator}>KNOWLEDGE CHECK (LEVEL 4)</Text>
      
      <Animated.View 
        style={[
          styles.quizIntroContainer,
          {
            opacity: fadeInAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <Text style={styles.quizIntroTitle}>Let's Test Your Knowledge</Text>
        
        <View style={styles.quizInfoCard}>
          <View style={styles.quizInfoHeader}>
            <Text style={styles.quizInfoTitle}>English Basics Quiz</Text>
            <Text style={styles.quizInfoDuration}>Duration: 10 min</Text>
          </View>
          
          <View style={styles.quizInfoContent}>
            <Text style={styles.quizInfoDescription}>
              This quiz will test your understanding of the Sinhala alphabet
              and common greetings you've learned so far.
            </Text>
            
            <View style={styles.quizTopics}>
              <Text style={styles.quizTopicItem}>• 10 multiple-choice questions</Text>
              <Text style={styles.quizTopicItem}>• Alphabet identification</Text>
              <Text style={styles.quizTopicItem}>• Basic sign recognition</Text>
              <Text style={styles.quizTopicItem}>• Matching exercises</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.rewardsPreview}>
          <Text style={styles.rewardsTitle}>Completion Rewards:</Text>
          <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🏆</Text>
              <Text style={styles.rewardValue}>+50 XP</Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🌟</Text>
              <Text style={styles.rewardValue}>Achievement Badge</Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🔓</Text>
              <Text style={styles.rewardValue}>Unlock Level 5</Text>
            </View>
          </View>
        </View>
      </Animated.View>
      
      <TouchableOpacity 
        style={styles.startQuizButton}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigate('QuizQuestions');
        }}
      >
        <Text style={styles.nextButtonText}>BEGIN QUIZ</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5c6e8',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  levelIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383773',
    marginTop: 20,
    alignSelf: 'center',
  },
  quizIntroContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  quizIntroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
    marginBottom: 20,
    textAlign: 'center',
  },
  quizInfoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  quizInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  quizInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#383773',
  },
  quizInfoDuration: {
    fontSize: 14,
    color: '#5d5b8d',
    fontWeight: '600',
  },
  quizInfoContent: {
    marginBottom: 10,
  },
  quizInfoDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  quizTopics: {
    marginTop: 10,
  },
  quizTopicItem: {
    fontSize: 15,
    color: '#555',
    marginVertical: 3,
  },
  rewardsPreview: {
    backgroundColor: 'rgba(93, 91, 141, 0.1)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(93, 91, 141, 0.3)',
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383773',
    marginBottom: 10,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  rewardValue: {
    fontSize: 14,
    color: '#555',
  },
  startQuizButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});