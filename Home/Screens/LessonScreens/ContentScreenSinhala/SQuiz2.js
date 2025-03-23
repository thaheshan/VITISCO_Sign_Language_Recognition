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
  Image,
  Alert,
  Modal
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

  const { quizId = 1, language = 'tamil', onComplete } =  props || {};
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30); // Changed to 30 seconds
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const optionAnim = useRef(new Animated.Value(0)).current;
  
  // Sample quiz data
  const quizData = {
    tamil: {
      1: {
        title: "Basic Sinhala Signs",
        questions: [
          {
            id: 1,
            term: "ඊ", // Friend in Tamil
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
            term: " ඍ", // Hello in Tamil
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
            term: "උ", // Thank you in Tamil
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
            term: " ඍ", // Good morning in Tamil
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
            term: "ඌ", // Happy in Tamil
            videoSource: require('../../../assets/videos/Scene - Jackie.mp4'),
            options: [
              { id: 1, imageSource: require('../../../assets/b4.png'), isCorrect: true },
              { id: 2, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 3, imageSource: require('../../../assets/b4.png'), isCorrect: false },
              { id: 4, imageSource: require('../../../assets/b4.png'), isCorrect: false }
            ]
          },
   
        ],
        xpReward: 40,
        achievements: [
          {
            icon: '🏆',
            title: 'Tamil Beginner',
            description: 'Complete your first Tamil sign language quiz'
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
      // Additional quizzes could be added here
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
    setTimeRemaining(30); // Set to 30 seconds
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
      clearAllTimers();
      
      if (videoRef.current) {
        videoRef.current.pauseAsync().catch(error => {
          console.log("Video pause error:", error);
        });
      }
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
    
    // If onComplete is provided, call it (similar to navigateNext in the second file)
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
          {/* Progress bar (only show if not in intro screen) */}
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
              
              {/* Manual continue button (only visible when timeRemaining > 0 and no answer selected) */}
              {selectedOption === null && timeRemaining > 0 && (
                <TouchableOpacity
                  style={[styles.skipButton]}
                  onPress={() => {
                    handleTimeUp();
                  }}
                >
                  <Text style={styles.skipButtonText}>SKIP</Text>
                </TouchableOpacity>
              )}
              
              {/* Skip to results button (only visible when answer is selected or time is up) */}
              {(selectedOption !== null || timeRemaining === 0) && currentQuestion < questions.length - 1 && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={moveToNextQuestion}
                >
                  <Text style={styles.continueButtonText}>NEXT QUESTION</Text>
                </TouchableOpacity>
              )}
              
              {/* Finish quiz button (only visible on last question when answered) */}
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
    textTransform: 'capitalize',
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
  skipButton: {
    backgroundColor: '#9291b9',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 10,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

// Intro Screen Styles
const introStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 16,
    color: '#5d5b8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#383773',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoDivider: {
    width: 1,
    backgroundColor: '#ddd',
    height: '80%',
    alignSelf: 'center',
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383773',
    marginBottom: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#383773',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

const warningStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  stayButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  stayButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitButton: {
    backgroundColor: '#f0f0ff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exitButtonText: {
    color: '#383773',
    fontSize: 16,
    fontWeight: '600',
  }
});

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

// Results Screen Styles
const resultStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5d5b8d',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  xpContainer: {
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  xpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383773',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: '#f8f8ff',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#383773',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
  },
  buttonContainer: {
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitButton: {
    backgroundColor: '#f0f0ff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exitButtonText: {
    color: '#383773',
    fontSize: 16,
    fontWeight: '600',
  }
});




