import React, { useState, useEffect, useRef } from 'react';
import { 
  Platform,
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView, 
  Animated, 
  Easing,
  Image,
  Alert,
  Modal
} from 'react-native';
import * as Haptics from 'expo-haptics';

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
          timeRemaining < 10 && timerStyles.timeWarning
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

// Quiz Intro Screen Component
const QuizIntroScreen = ({ quizTitle, xpReward, questionsCount, achievements, onStart }) => {
  return (
    <View style={introStyles.container}>
      <View style={introStyles.card}>
        <Text style={introStyles.title}>Ready for the Quiz?</Text>
        <Text style={introStyles.quizTitle}>{quizTitle}</Text>
        
        <View style={introStyles.infoContainer}>
          <View style={introStyles.infoItem}>
            <Text style={introStyles.infoIcon}>🎯</Text>
            <Text style={introStyles.infoValue}>{questionsCount}</Text>
            <Text style={introStyles.infoLabel}>Questions</Text>
          </View>
          
          <View style={introStyles.infoDivider} />
          
          <View style={introStyles.infoItem}>
            <Text style={introStyles.infoIcon}>⏱️</Text>
            <Text style={introStyles.infoValue}>30s</Text>
            <Text style={introStyles.infoLabel}>Per Question</Text>
          </View>
          
          <View style={introStyles.infoDivider} />
          
          <View style={introStyles.infoItem}>
            <Text style={introStyles.infoIcon}>🌟</Text>
            <Text style={introStyles.infoValue}>{xpReward}</Text>
            <Text style={introStyles.infoLabel}>XP Reward</Text>
          </View>
        </View>
        
        <View style={introStyles.achievementsContainer}>
          <Text style={introStyles.achievementsTitle}>Complete to earn:</Text>
          {achievements.map((achievement, index) => (
            <View key={index} style={introStyles.achievementItem}>
              <Text style={introStyles.achievementIcon}>{achievement.icon}</Text>
              <View style={introStyles.achievementTextContainer}>
                <Text style={introStyles.achievementTitle}>{achievement.title}</Text>
                <Text style={introStyles.achievementDesc}>{achievement.description}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={introStyles.startButton} onPress={onStart}>
          <Text style={introStyles.startButtonText}>START QUIZ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Exit Warning Modal Component
const ExitWarningModal = ({ visible, onStay, onExit }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={warningStyles.modalOverlay}>
        <View style={warningStyles.modalContent}>
          <Text style={warningStyles.warningTitle}>Are you sure?</Text>
          <Text style={warningStyles.warningText}>
            You have scored less than 3/5 correct answers. 
            Exiting now means you won't gain full experience 
            from this quiz. Would you like to try again?
          </Text>
          <View style={warningStyles.buttonContainer}>
            <TouchableOpacity 
              style={warningStyles.stayButton}
              onPress={onStay}
            >
              <Text style={warningStyles.stayButtonText}>Stay & Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={warningStyles.exitButton}
              onPress={onExit}
            >
              <Text style={warningStyles.exitButtonText}>Exit Anyway</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Quiz Results Screen Component
const QuizResultsScreen = ({ correctAnswers, totalQuestions, xpEarned, achievementsUnlocked, onRetry, onExit }) => {
  const achievementAnimValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate achievements appearing
    Animated.timing(achievementAnimValue, {
      toValue: 1,
      duration: 800,
      delay: 500,
      easing: Easing.elastic(1),
      useNativeDriver: true
    }).start();
  }, []);
  
  return (
    <View style={resultStyles.container}>
      <View style={resultStyles.card}>
        <Text style={resultStyles.title}>Quiz Complete!</Text>
        
        <View style={resultStyles.scoreContainer}>
          <Text style={resultStyles.scoreText}>
            {correctAnswers}/{totalQuestions}
          </Text>
          <Text style={resultStyles.subtitle}>Questions Answered Correctly</Text>
        </View>
        
        <View style={resultStyles.xpContainer}>
          <Text style={resultStyles.xpText}>🌟 {xpEarned} XP Earned</Text>
        </View>
        
        <View style={resultStyles.statsContainer}>
          <View style={resultStyles.statItem}>
            <Text style={resultStyles.statValue}>{Math.round((correctAnswers / totalQuestions) * 100)}%</Text>
            <Text style={resultStyles.statLabel}>Accuracy</Text>
          </View>
          
          <View style={resultStyles.statDivider} />
          
          <View style={resultStyles.statItem}>
            <Text style={resultStyles.statValue}>{totalQuestions - correctAnswers}</Text>
            <Text style={resultStyles.statLabel}>Mistakes</Text>
          </View>
        </View>
        
        {/* Achievement Unlocked Section */}
        {achievementsUnlocked && achievementsUnlocked.length > 0 && (
          <Animated.View 
            style={[
              resultStyles.achievementsContainer,
              {
                opacity: achievementAnimValue,
                transform: [{
                  translateY: achievementAnimValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <Text style={resultStyles.achievementsTitle}>Achievements Unlocked!</Text>
            {achievementsUnlocked.map((achievement, index) => (
              <View key={index} style={resultStyles.achievementItem}>
                <Text style={resultStyles.achievementIcon}>{achievement.icon}</Text>
                <View>
                  <Text style={resultStyles.achievementTitle}>{achievement.title}</Text>
                  <Text style={resultStyles.achievementDesc}>{achievement.description}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
        
        <View style={resultStyles.buttonContainer}>
          <TouchableOpacity style={resultStyles.retryButton} onPress={onRetry}>
            <Text style={resultStyles.retryButtonText}>Retry Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={resultStyles.exitButton} onPress={onExit}>
            <Text style={resultStyles.exitButtonText}>Exit to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function SignLanguageQuizScreen({ navigate, ...props }) {

  const { quizId = 1, language = 'English', onComplete } =  props || {};
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  
  const timerRef = useRef(null);
  const optionAnim = useRef(new Animated.Value(0)).current;
  
  // Sample quiz data
  const quizData = {
    tamil: {
      1: {
        title: "Basic English Signs",
        questions: [
          {
            id: 1,
            term: "D",
            pronunciation: "Letter D",
            options: [
              { id: 1, imageSource: require('../../../assets/sign images/images (4).jpg'), isCorrect: false },
              { id: 2, imageSource: require('../../../assets/sign images/images (5).jpg'), isCorrect: true },
              { id: 3, imageSource: require('../../../assets/sign images/images (6).jpg'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/sign images/images (7).jpg'), isCorrect: false }
            ]
          },
          {
            id: 2,
            term: "C",
            pronunciation: "Letter C",
            options: [
              { id: 1, imageSource: require('../../../assets/sign images/images (7).jpg'), isCorrect: false },
              { id: 2, imageSource: require('../../../assets/sign images/images (4).jpg'), isCorrect: false },
              { id: 3, imageSource: require('../../../assets/sign images/images (5).jpg'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/sign images/images (6).jpg'), isCorrect: true }
            ]
          },
          {
            id: 3,
            term: "A",
            pronunciation: "Letter A",
            options: [
              { id: 1, imageSource: require('../../../assets/sign images/images (5).jpg'), isCorrect: false },
              { id: 2, imageSource: require('../../../assets/sign images/images (4).jpg'), isCorrect: true },
              { id: 3, imageSource: require('../../../assets/sign images/images (7).jpg'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/sign images/images (6).jpg'), isCorrect: false }
            ]
          },
          {
            id: 4,
            term: "B",
            pronunciation: "Letter B",
            options: [
              { id: 1, imageSource: require('../../../assets/sign images/images (6).jpg'), isCorrect: false },
              { id: 2, imageSource: require('../../../assets/sign images/images (4).jpg'), isCorrect: false },
              { id: 3, imageSource: require('../../../assets/sign images/images (5).jpg'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/sign images/images (7).jpg'), isCorrect: true }
            ]
          },
          {
            id: 5,
            term: "E",
            pronunciation: "Letter E",
            options: [
              { id: 1, imageSource: require('../../../assets/sign images/images (4).jpg'), isCorrect: true },
              { id: 2, imageSource: require('../../../assets/sign images/images (5).jpg'), isCorrect: false },
              { id: 3, imageSource: require('../../../assets/sign images/images (6).jpg'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/sign images/images (7).jpg'), isCorrect: false }
            ]
          }
        ],
        xpReward: 50,
        achievements: [
          {
            icon: '🏆',
            title: 'Sign Language Beginner',
            description: 'Complete your first sign language quiz'
          },
          {
            icon: '🔥',
            title: 'On a Roll',
            description: 'Answer 3 questions correctly in a row'
          },
          {
            icon: '⚡',
            title: 'Speed Learner',
            description: 'Complete the quiz in under 2 minutes'
          }
        ]
      }
    }
  };
  
  // Get current quiz and questions
  const currentQuizType = quizData[language] || quizData.tamil;
  const currentQuiz = currentQuizType[quizId] || currentQuizType[1];
  const questions = currentQuiz.questions;
  const currentQ = questions[currentQuestion];
  
  // Determine achievements unlocked based on performance
  const determineAchievementsUnlocked = () => {
    const achievements = [];
    
    // Always unlock the first achievement for completing the quiz
    achievements.push(currentQuiz.achievements[0]);
    
    // If score is perfect or near perfect, unlock the second achievement
    if (correctAnswers >= 3) {
      achievements.push(currentQuiz.achievements[1]);
    }
    
    // For the third achievement, we would need to track time, but for demo purposes:
    // Let's say if they got at least 4 correct, they did it quickly
    if (correctAnswers >= 4) {
      achievements.push(currentQuiz.achievements[2]);
    }
    
    return achievements;
  };
  
  // Start the quiz
  const handleStartQuiz = () => {
    setShowIntro(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  
  // Animation for options appearing
  useEffect(() => {
    if (!showIntro && !showResult) {
      Animated.timing(optionAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentQuestion, showIntro, showResult]);
  
  // Clear all timers - utility function
  const clearAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }
  };
  
  // Initialize timer and reset states when question changes
  useEffect(() => {
    if (showIntro || showResult) return;
    
    // Reset states for new question
    setTimeRemaining(30);
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
      clearAllTimers();
    };
  }, [currentQuestion, showIntro, showResult]);
  
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
      
      // Set timer to automatically move to next question after 3 seconds
      setAutoAdvanceTimer(setTimeout(() => {
        moveToNextQuestion();
      }, 3000));
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
    
    // Update correct answers count
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(prev => prev + currentQuiz.xpReward / questions.length);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    // Set timer to automatically move to next question after 2 seconds
    setAutoAdvanceTimer(setTimeout(() => {
      moveToNextQuestion();
    }, 2000));
  };
  
  // Move to next question or complete quiz
  const moveToNextQuestion = () => {
    clearAllTimers();
    
    if (currentQuestion < questions.length - 1) {
      // Provide haptic feedback for navigation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Complete the quiz
      completeQuiz();
    }
  };
  
  // Handle quiz completion
  const completeQuiz = () => {
    setShowResult(true);
    
    // Provide strong haptic feedback for completion
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  // Handle retry quiz
  const handleRetryQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setCorrectAnswers(0);
    setShowResult(false);
  };
  
  // Handle close button or exit functionality
  const handleExitAttempt = () => {
    // Check if user has completed the quiz and their score
    if (correctAnswers < 3 && (showResult || currentQuestion > 0)) {
      // Show warning modal if score is less than 3/5
      setShowExitWarning(true);
    } else {
      // Exit directly if score is 3 or higher or quiz not started
      navigateToLearningPathway();
    }
  };

  // Stay in quiz and retry
  const handleStayInQuiz = () => {
    setShowExitWarning(false);
    handleRetryQuiz();
  };

  // Exit to learning pathway despite low score
  const navigateToLearningPathway = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // If onComplete is provided, call it
    if (onComplete) {
      onComplete();
    } else {
      // Otherwise navigate to the LearningPathway screen
      navigate('LearningPathway');
    }
  };
  
  // Calculate XP earned
  const xpEarned = Math.round((correctAnswers / questions.length) * currentQuiz.xpReward);
  
  // Determine achievements unlocked for results screen
  const achievementsUnlocked = showResult ? determineAchievementsUnlocked() : [];
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar with XP and close button */}
      <View style={styles.topBar}>
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>🌟 {currentQuiz.xpReward}xp</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleExitAttempt}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      {showIntro ? (
        <QuizIntroScreen 
          quizTitle={currentQuiz.title}
          xpReward={currentQuiz.xpReward}
          questionsCount={questions.length}
          achievements={currentQuiz.achievements}
          onStart={handleStartQuiz}
        />
      ) : (
        <>
          {/* Progress bar */}
          <ProgressBar current={currentQuestion + 1} total={questions.length} />
          
          {!showResult ? (
            <View style={styles.contentContainer}>
              {/* Question */}
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>
                  Select the correct sign for '{currentQ.term}'
                </Text>
                <Text style={styles.pronunciationText}>
                  Pronunciation: {currentQ.pronunciation}
                </Text>
              </View>
              
              {/* Question illustration */}
              <View style={styles.questionIllustration}>
                <Text style={styles.questionLetter}>{currentQ.term}</Text>
                <Text style={styles.questionSubtext}>Find the matching sign</Text>
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
                        opacity: optionAnim,
                        transform: [{ 
                          translateY: optionAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                          }) 
                        }]
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
              
              {/* Manual continue button */}
              {selectedOption === null && timeRemaining > 0 && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => {
                    handleTimeUp();
                  }}
                >
                  <Text style={styles.skipButtonText}>SKIP</Text>
                </TouchableOpacity>
              )}
              
              {/* Next question button */}
              {(selectedOption !== null || timeRemaining === 0) && currentQuestion < questions.length - 1 && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={moveToNextQuestion}
                >
                  <Text style={styles.continueButtonText}>NEXT QUESTION</Text>
                </TouchableOpacity>
              )}
              
              {/* Finish quiz button */}
              {(selectedOption !== null || timeRemaining === 0) && currentQuestion === questions.length - 1 && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={completeQuiz}
                >
                  <Text style={styles.continueButtonText}>FINISH QUIZ</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <QuizResultsScreen 
              correctAnswers={correctAnswers}
              totalQuestions={questions.length}
              xpEarned={xpEarned}
              achievementsUnlocked={achievementsUnlocked}
              onRetry={handleRetryQuiz}
              onExit={handleExitAttempt}
            />
          )}
        </>
      )}

      {/* Exit Warning Modal */}
      <ExitWarningModal 
        visible={showExitWarning}
        onStay={handleStayInQuiz}
        onExit={navigateToLearningPathway}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  xpContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  xpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4c63d2',
    letterSpacing: 0.5,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  questionContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    textTransform: 'capitalize',
    lineHeight: 32,
    marginBottom: 8,
  },
  pronunciationText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  questionIllustration: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
  },
  questionLetter: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4c63d2',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  optionWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  correctOption: {
    borderColor: '#10b981',
    borderWidth: 3,
    shadowColor: '#10b981',
    shadowOpacity: 0.3,
    transform: [{ scale: 1.05 }],
  },
  incorrectOption: {
    borderColor: '#ef4444',
    borderWidth: 3,
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
    transform: [{ scale: 0.95 }],
  },
  optionImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f9fafb',
  },
  correctIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  incorrectIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  indicatorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#4c63d2',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    shadowColor: '#4c63d2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  skipButton: {
    backgroundColor: '#9ca3af',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    shadowColor: '#9ca3af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});

// Enhanced Progress Bar Styles
const progressStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  progressGradient: {
    flex: 1,
    borderRadius: 8,
  },
  progressText: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
    letterSpacing: 0.3,
  }
});

// Enhanced Timer Styles
const timerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginVertical: 15,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  clockIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 0.5,
  },
  timeWarning: {
    color: '#ef4444',
    textShadowColor: 'rgba(239, 68, 68, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
});

// Enhanced Feedback Message Styles
const feedbackStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginVertical: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  correctContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  incorrectContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  timeUpContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginVertical: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  correctText: {
    color: '#047857',
  },
  incorrectText: {
    color: '#dc2626',
  },
  timeUpText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#d97706',
    letterSpacing: 0.3,
  }
});

// Enhanced Intro Screen Styles
const introStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  quizTitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  infoDivider: {
    width: 1,
    backgroundColor: 'rgba(203, 213, 225, 0.6)',
    height: '70%',
    alignSelf: 'center',
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  achievementIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#4c63d2',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4c63d2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});

// Enhanced Warning Modal Styles
const warningStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 28,
    width: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  warningText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  stayButton: {
    backgroundColor: '#4c63d2',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#4c63d2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  stayButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  exitButton: {
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(203, 213, 225, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exitButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  }
});

// Enhanced Results Screen Styles
const resultStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(243, 244, 246, 0.6)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4c63d2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  xpContainer: {
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  xpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 28,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(203, 213, 225, 0.6)',
    height: '70%',
    alignSelf: 'center',
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  achievementIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: '#4c63d2',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#4c63d2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  exitButton: {
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(203, 213, 225, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  exitButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  }
});




