import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView, 
  Animated, 
  Easing,
  Image
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

// Progress Bar Component
const ProgressBar = ({ current, total }) => {
  const progress = (current / total) * 100;
  
  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.progressBarContainer}>
        <View style={[progressStyles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={progressStyles.progressText}>{current} of {total}</Text>
    </View>
  );
};

// Timer Component
const Timer = ({ timeRemaining }) => {
  return (
    <View style={timerStyles.container}>
      <Text style={timerStyles.clockIcon}>⏱️</Text>
      <Text 
        style={[
          timerStyles.timeText, 
          timeRemaining < 5 && timerStyles.timeWarning
        ]}
      >
        {timeRemaining}s
      </Text>
    </View>
  );
};

// Feedback Message Component
const FeedbackMessage = ({ isCorrect, timeUp }) => {
  if (timeUp && isCorrect === null) {
    return (
      <View style={feedbackStyles.timeUpContainer}>
        <Text style={feedbackStyles.timeUpText}>
          Time's up! The correct sign has been highlighted.
        </Text>
      </View>
    );
  }
  
  if (isCorrect === null) return null;
  
  return (
    <View style={[
      feedbackStyles.container, 
      isCorrect ? feedbackStyles.correctContainer : feedbackStyles.incorrectContainer
    ]}>
      <Text style={[
        feedbackStyles.text,
        isCorrect ? feedbackStyles.correctText : feedbackStyles.incorrectText
      ]}>
        {isCorrect 
          ? "Great job! That's correct!" 
          : "Not quite right. Keep practicing!"}
      </Text>
    </View>
  );
};

export default function SignLanguageQuizScreen({ navigation, route = {} }) {
  const { quizId = 1, language = 'tamil', onComplete } = route.params || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const optionAnim = useRef(new Animated.Value(0)).current;
  
  // Sample quiz data
  const quizData = {
    tamil: {
      1: {
        title: "Basic Tamil Signs",
        questions: [
          {
            id: 1,
            term: "நண்பர்", // Friend in Tamil
            pronunciation: "Nanbar",
            videoSource: require('../../../assets/videos/Scene - Jackie.mp4'), // Replace with actual video path
            options: [
              { id: 1, imageSource: require('../../../assets/b4.png'), isCorrect: false }, // Replace with actual image paths
              { id: 2, imageSource: require('../../../assets/b4.png'), isCorrect: true },
              { id: 3, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/b4.png'), isCorrect: false }
            ]
          },
          {
            id: 2,
            term: "வணக்கம்", // Hello in Tamil
            pronunciation: "Vanakkam",
            videoSource: require('../../../assets/videos/Scene - Jackie.mp4'),
            options: [
              { id: 1, imageSource: require('../../../assets/b4.png'), isCorrect: true },
              { id: 2, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 3, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/b4.png'), isCorrect: false }
            ]
          },
          {
            id: 3,
            term: "நன்றி", // Thank you in Tamil
            pronunciation: "Nandri",
            videoSource: require('../../../assets/videos/Scene - Jackie.mp4'),
            options: [
              { id: 1, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 2, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 3, imageSource: require('../../../assets/b4.png'), isCorrect: true },
              { id: 4, imageSource: require('../../../assets/b4.png'), isCorrect: false }
            ]
          },
          {
            id: 4,
            term: "காலை வணக்கம்", // Good morning in Tamil
            pronunciation: "Kaalai Vanakkam",
            videoSource: require('../../../assets/videos/Scene - Jackie.mp4'),
            options: [
              { id: 1, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 2, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 3, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/b4.png'), isCorrect: true }
            ]
          },
          {
            id: 5,
            term: "சந்தோஷம்", // Happy in Tamil
            pronunciation: "Santosham",
            videoSource: require('../../../assets/videos/Scene - Jackie.mp4'),
            options: [
              { id: 1, imageSource: require('../../../assets/b4.png'), isCorrect: true },
              { id: 2, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 3, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/b4.png'), isCorrect: false }
            ]
          }
        ],
        xpReward: 40
      }
      // Additional quizzes could be added here
    }
  };
  
  // Get current quiz and questions
  const currentQuizType = quizData[language] || quizData.tamil;
  const currentQuiz = currentQuizType[quizId] || currentQuizType[1];
  const questions = currentQuiz.questions;
  const currentQ = questions[currentQuestion];
  
  // Animation for options appearing
  useEffect(() => {
    Animated.timing(optionAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentQuestion]);
  
  // Initialize timer and reset states when question changes
  useEffect(() => {
    // Reset states for new question
    setTimeRemaining(15);
    setSelectedOption(null);
    setIsCorrect(null);
    optionAnim.setValue(0);
    
    // Start animation
    Animated.timing(optionAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    
    // Play video if available
    if (videoRef.current) {
      videoRef.current.playAsync().catch(error => {
        console.log("Video playback error:", error);
      });
    }
    
    // Start timer countdown
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup on unmount or question change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (videoRef.current) {
        videoRef.current.pauseAsync().catch(error => {
          console.log("Video pause error:", error);
        });
      }
    };
  }, [currentQuestion]);
  
  // Handle when time runs out
  const handleTimeUp = () => {
    if (selectedOption === null) {
      // Find the correct option
      const correctOption = currentQ.options.find(opt => opt.isCorrect);
      
      // Provide haptic feedback for time up
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      // Highlight the correct answer but mark as incorrect response
      setSelectedOption(correctOption.id);
      setIsCorrect(false);
    }
  };
  
  // Handle option selection
  const handleOptionSelect = (optionId) => {
    // Prevent selection if already answered or time's up
    if (selectedOption !== null || timeRemaining === 0) return;
    
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Find selected option
    const selectedOpt = currentQ.options.find(opt => opt.id === optionId);
    setSelectedOption(optionId);
    
    // Check if answer is correct
    const correct = selectedOpt.isCorrect;
    setIsCorrect(correct);
    
    // Provide haptic feedback based on correctness
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(prev => prev + currentQuiz.xpReward / questions.length);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  // Move to next question or complete quiz
  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      // Provide haptic feedback for navigation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Complete the quiz
      setShowResult(true);
      
      // Provide strong haptic feedback for completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to completion screen after a delay
      setTimeout(() => {
        navigation.navigate('LessonComplete', {
          quizId: quizId,
          language: language,
          score: score,
          xpEarned: Math.round(score),
          totalQuestions: questions.length,
          quizTitle: currentQuiz.title,
          onComplete
        });
      }, 1500);
    }
  };
  
  // Animation styles
  const opacityAnim = optionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  
  const translateYAnim = optionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0]
  });
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar with XP and close button */}
      <View style={styles.topBar}>
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>🌟 {currentQuiz.xpReward}xp</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      {/* Progress bar */}
      <ProgressBar current={currentQuestion + 1} total={questions.length} />
      
      {!showResult ? (
        <View style={styles.contentContainer}>
          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              select the correct sign for '{currentQ.term}'
            </Text>
            <Text style={styles.pronunciationText}>
              Pronunciation: {currentQ.pronunciation}
            </Text>
          </View>
          
          {/* Video demonstration */}
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={currentQ.videoSource}
              style={styles.video}
              resizeMode="contain"
              isLooping
              shouldPlay
              useNativeControls={false}
            />
            <View style={styles.videoBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.videoBadgeText}>Watch Demo</Text>
            </View>
          </View>
          
          {/* Timer */}
          <Timer timeRemaining={timeRemaining} />
          
          {/* Options grid */}
          <View style={styles.optionsGrid}>
            {currentQ.options.map((option) => (
              <Animated.View 
                key={option.id}
                style={[
                  styles.optionWrapper,
                  {
                    opacity: opacityAnim,
                    transform: [{ translateY: translateYAnim }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedOption === option.id && option.isCorrect && styles.correctOption,
                    selectedOption === option.id && !option.isCorrect && styles.incorrectOption,
                    selectedOption !== null && option.isCorrect && styles.correctOption,
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  disabled={selectedOption !== null}
                >
                  <Image 
                    source={option.imageSource}
                    style={styles.optionImage}
                    resizeMode="contain"
                  />
                  
                  {/* Indicator for correct/incorrect */}
                  {selectedOption !== null && option.isCorrect && (
                    <View style={styles.correctIndicator}>
                      <Text style={styles.indicatorText}>✓</Text>
                    </View>
                  )}
                  
                  {selectedOption === option.id && !option.isCorrect && (
                    <View style={styles.incorrectIndicator}>
                      <Text style={styles.indicatorText}>✗</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          
          {/* Feedback message */}
          <FeedbackMessage 
            isCorrect={isCorrect} 
            timeUp={timeRemaining === 0} 
          />
          
          {/* Continue button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (selectedOption === null && timeRemaining > 0) ? styles.disabledButton : {}
            ]}
            onPress={handleContinue}
            disabled={selectedOption === null && timeRemaining > 0}
          >
            <Text style={styles.continueButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Quiz Complete!</Text>
          <Text style={styles.resultScore}>
            Score: {Math.round(score)} XP
          </Text>
          <Text style={styles.resultMessage}>
            Great job! Redirecting to results...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Progress Bar Styles
const progressStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5d5b8d',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 14,
    color: '#383773',
    fontWeight: '500',
  }
});

// Timer Styles
const timerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 10,
  },
  clockIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#383773',
  },
  timeWarning: {
    color: '#ff5252',
  }
});

// Feedback Message Styles
const feedbackStyles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 15,
    width: '100%',
  },
  correctContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  incorrectContainer: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
  },
  timeUpContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 15,
    width: '100%',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  correctText: {
    color: '#2e7d32',
  },
  incorrectText: {
    color: '#c62828',
  },
  timeUpText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#f57f17',
  }
});

// Main Component Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5c6e8',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  xpContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#383773',
  },
  closeButton: {
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#383773',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  questionContainer: {
    width: '100%',
    marginBottom: 15,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
  },
  pronunciationText: {
    fontSize: 14,
    color: '#5d5b8d',
    textAlign: 'center',
    marginTop: 5,
  },
  videoContainer: {
    width: '80%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#5d5b8d',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(93, 91, 141, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff5252',
    marginRight: 5,
  },
  videoBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  optionWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  correctOption: {
    borderColor: '#4caf50',
  },
  incorrectOption: {
    borderColor: '#ff5252',
  },
  optionImage: {
    width: '100%',
    height: 120,
  },
  correctIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4caf50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incorrectIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ff5252',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#5d5b8d',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9291b9',
    opacity: 0.7,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5d5b8d',
    marginBottom: 15,
  },
  resultMessage: {
    fontSize: 16,
    color: '#383773',
    textAlign: 'center',
  }
});