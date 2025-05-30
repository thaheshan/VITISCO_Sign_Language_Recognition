import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Dimensions,
  BackHandler,
  ActivityIndicator
} from 'react-native';
import axios from 'axios'; // Import axios for API calls

const { width, height } = Dimensions.get('window');

const QuizApp = () => {
  // App state management
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showLanguageSelection, setShowLanguageSelection] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false); // Tracks if answer was submitted

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (!showStartScreen) {
        handleBack();
        return true;
      } else if (!showLanguageSelection && showStartScreen) {
        // Go back to language selection screen
        setShowLanguageSelection(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [showStartScreen, showLanguageSelection, currentQuestion]);

  // Fetch questions when language is selected
  useEffect(() => {
    if (selectedLanguage) {
      fetchQuestions(selectedLanguage);
    }
  }, [selectedLanguage]);

  const fetchQuestions = async (language) => {
    setLoading(true);
    setError(null);
  
    try {
      // FRONTEND CODE 
      if (language === 'english') {
        const processedQuestions = englishQuestions.map(question => {
          if (!question.hasOwnProperty('correctAnswer')) {
            return { ...question, correctAnswer: 0 }; // First option is correct by default
          }
          return question;
        });
        setQuestions(processedQuestions);
      } else if (language === 'tamil') {
        const processedQuestions = tamilQuestions.map(question => {
          if (!question.hasOwnProperty('correctAnswer')) {
            return { ...question, correctAnswer: 0 }; // First option is correct by default
          }
          return question;
        });
        setQuestions(processedQuestions);
      }
      
    } catch (err) {
      
      setError("Failed to load questions. Using local data instead.");
      
      // Use fallback questions based on selected language
      if (language === 'english') {
        const processedQuestions = englishQuestions.map(question => {
          if (!question.hasOwnProperty('correctAnswer')) {
            return { ...question, correctAnswer: 0 };
          }
          return question;
        });
        setQuestions(processedQuestions);
      } else if (language === 'tamil') {
        const processedQuestions = tamilQuestions.map(question => {
          if (!question.hasOwnProperty('correctAnswer')) {
            return { ...question, correctAnswer: 0 };
          }
          return question;
        });
        setQuestions(processedQuestions);
      }
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Save quiz results 
   */
  const saveQuizResults = async (results) => {
    
    // FRONTEND ONLY - Log results to console
    console.log("Quiz results:", {
      language: selectedLanguage,
      answers: results,
      timestamp: new Date().toISOString()
    });
  };

  // Quiz questions data for english letters 
  const englishQuestions = [
    {
      id: 1,
      title: 'Select the correct sign for A',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'B' },
        { id: 'C', text: 'C' },
      ],
      correctAnswer: 0, // A is correct
    },
    {
      id: 2,
      title: 'Select the correct sign for B',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
      correctAnswer: 1, // Second image is correct
    },
    {
      id: 3,
      title: 'Select the correct sign for C',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
      correctAnswer: 2, // Third image is correct
    },
    {
      id: 4,
      title: 'Select the correct sign for D',
      image: require('./assets/download.jpeg'),
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'C' },
        { id: 'C', text: 'B' },
      ],
      correctAnswer: 1, // C is correct
    },
    {
      id: 5,
      title: 'Select the correct sign for E',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
      correctAnswer: 3, // Fourth image is correct
    },
    {
      id: 6,
      title: 'Select the correct sign for F',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
      correctAnswer: 0, // First image is correct
    },
    {
      id: 7,
      title: 'Find the sign ',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'E' },
        { id: 'B', text: 'A' },
        { id: 'C', text: 'G' },
      ],
      correctAnswer: 2, // G is correct
    },

  ];

  // Tamil quiz questions data (local data)
  const tamilQuestions = [
    {
      id: 1,
      title: 'Select the correct Tamil letter for this sign ',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'அ' },
        { id: 'B', text: 'ஆ' },
        { id: 'C', text: 'இ' },
      ],
      correctAnswer: 0, // அ is correct
    },
    //ஆ
    {
      id: 2,
      title: 'Select the correct sign for Tamil letter "ஆ"',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
      correctAnswer: 0, // அ is correct
    },
    //இ
    {
      id: 3,
      title: 'Select the correct sign for Tamil letter "இ"',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
      correctAnswer: 0, // அ is correct
    },
    //ஈ
    {
      id: 2,
      title: 'Select the correct sign for Tamil letter "ஈ"',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
      correctAnswer: 0, // அ is correct
    },
    //உ
    {
      id: 5,
      title: 'Select the correct sign for Tamil letter "உ"',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
      correctAnswer: 0, // அ is correct
    },
    //ஊ
    {
        id: 2,
        title: 'Select the correct sign for Tamil letter "ஊ"',
        options: [
          { image: require('./assets/sign1.png') },
          { image: require('./assets/sign1.png') },
          { image: require('./assets/sign1.png') },
          { image: require('./assets/sign1.png') },
        ],
        gridView: true,
        correctAnswer: 0, // அ is correct
    },
    //எ
    {
      id: 6,
      title: 'Select the correct Tamil letter for this sign',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'ஊ' },
        { id: 'B', text: 'எ' },
        { id: 'C', text: 'ஒ' },
      ],
      correctAnswer: 0, // அ is correct
    },

    //ஏ	
    {
      id: 6,
      title: 'Select the correct Tamil letter for this sign',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'ஊ' },
        { id: 'B', text: 'எ' },
        { id: 'C', text: 'ஒ' },
      ],
      correctAnswer: 0, // அ is correct
    },

    //ஐ	
    {
      id: 2,
      title: 'Select the correct sign for Tamil letter "ஐ	"',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
      correctAnswer: 0, // அ is correct
    },
  ];

  /**
   * Handle language selection
   */
  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    setShowLanguageSelection(false);
  };

  /**
   * Start the quiz
   */
  const startQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizHistory([]);
    setShowStartScreen(false);
    setAnswerSubmitted(false); // Reset answer submission state
  };

  /**
   * Check if answer is correct and proceed to next question
   */
  const checkAnswer = () => {
    setAnswerSubmitted(true);
    
    // Show feedback for 1 second before moving to next question
    setTimeout(() => {
      // Update quiz history
      const updatedHistory = [...quizHistory];
      updatedHistory[currentQuestion] = selectedAnswer;
      setQuizHistory(updatedHistory);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setAnswerSubmitted(false); // Reset for next question
      } else {
        // Save results to backend (commented out)
        saveQuizResults(updatedHistory);
        
        // Show completion alert with options
        Alert.alert(
          "Quiz Completed!",
          "Congratulations! You've completed the quiz.",
          [
            { 
              text: "Review Answers", 
              onPress: () => {
                // You could add a review screen here
                setShowStartScreen(false);
              } 
            },
            { 
              text: "Back to Start", 
              onPress: () => {
                setShowStartScreen(true);
              }
            }
          ],
          { cancelable: false }
        );
      }
    }, 1000); // Delay before moving to next question
  };

  /**
   * Handle back button navigation
   */
  const handleBack = () => {
    if (currentQuestion > 0) {
      Alert.alert(
        "Go Back",
        "Go back to previous question?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Go Back", 
            onPress: () => {
              const prevQuestion = currentQuestion - 1;
              setCurrentQuestion(prevQuestion);
              // Restore previous answer if available
              setSelectedAnswer(quizHistory[prevQuestion] !== undefined ? quizHistory[prevQuestion] : null);
              setAnswerSubmitted(false); // Reset answer submission state
            } 
          }
        ]
      );
    } else {
      // If on first question, ask if user wants to return to start screen
      handleQuit();
    }
  };

  /**
   * Handle quiz exit with options
   */
  const handleQuit = () => {
    Alert.alert(
      "Exit Quiz",
      "What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Back to Language Selection", 
          style: "default",
          onPress: () => {
            setShowStartScreen(true);
            setShowLanguageSelection(true);
          }
        },
        { 
          text: "Quit Without Saving", 
          style: "destructive",
          onPress: () => {
            setShowStartScreen(true);
          }
        },
        {
          text: "Return to Start",
          onPress: () => {
            // Save progress and go back to start screen
            setShowStartScreen(true);
          }
        }
      ],
      { cancelable: true }
    );
  };

  /**
   * Language Selection Screen
   */
  if (showLanguageSelection) {
    return (
      <SafeAreaView style={styles.languageScreenContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.welcomeLogoContainer}>
          <Text style={styles.appTitle}>Sign Language Quiz</Text>
          <Image source={require('./assets/sign1.png')} style={styles.welcomeImage} />
          <Text style={styles.languageSelectionText}>Choose your language</Text>
          <Text style={styles.languageSelectionSubtext}>Select the language you want to learn sign language for</Text>
        </View>
        
        <View style={styles.languageButtonsContainer}>
          <TouchableOpacity 
            style={styles.languageButton} 
            onPress={() => selectLanguage('english')}
          >
            <Text style={styles.languageButtonText}>English</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => selectLanguage('tamil')}
          >
            <Text style={styles.languageButtonText}>Tamil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Welcome/Start Screen (shown after language selection)
   */
  if (showStartScreen) {
    return (
      <SafeAreaView style={styles.welcomeScreenContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.enhancedHeader}>
          <TouchableOpacity
            style={styles.enhancedBackButton}
            onPress={() => setShowLanguageSelection(true)}
          >
            <Text style={styles.backButtonText}>
              &#10094;
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.enhancedHeaderTitle}>
            {selectedLanguage === 'english' ? 'English Sign Language' : 'Tamil Sign Language'}
          </Text>
          
          <View style={{width: 40}} />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading questions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => fetchQuestions(selectedLanguage)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.welcomeLogoContainer}>
              <Text style={styles.welcomeText}>
                Test your sign language knowledge!
              </Text>
              <Image source={require('./assets/sign1.png')} style={styles.welcomeImage} />
              <Text style={styles.welcomeSubtext}>
                Learn, practice, and master sign language through interactive quizzes
              </Text>
            </View>
            
            <View style={styles.welcomeButtonsContainer}>
              <TouchableOpacity 
                style={styles.startQuizButton} 
                onPress={startQuiz}
              >
                <Text style={styles.startQuizButtonText}>
                  Start Quiz
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.learnMoreButton}
              >
                <Text style={styles.learnMoreButtonText}>
                  Learn More
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    );
  }

  /**
   * Loading Screen
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreenContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingScreenText}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  /**
   * Error Screen
   */
  if (error && questions.length === 0) {
    return (
      <SafeAreaView style={styles.errorScreenContainer}>
        <Text style={styles.errorScreenText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorScreenButton}
          onPress={() => {
            fetchQuestions(selectedLanguage);
          }}
        >
          <Text style={styles.errorScreenButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.errorScreenBackButton}
          onPress={() => {
            setShowStartScreen(true);
            setShowLanguageSelection(true);
          }}
        >
          <Text style={styles.errorScreenBackButtonText}>Back to Language Selection</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /**
   * Progress Bar Component
   */
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>
      <Text style={styles.progressText}>
        Question {currentQuestion + 1} of {questions.length}
      </Text>
    </View>
  );

  /**
   * Helper function to determine answer styling based on correctness
   */
  const getAnswerStatusStyle = (index) => {
    if (!answerSubmitted || selectedAnswer !== index) return null;
    
    const currentQ = questions[currentQuestion];
    if (!currentQ || !currentQ.hasOwnProperty('correctAnswer')) return null;
    
    return index === currentQ.correctAnswer ? styles.correctAnswer : styles.incorrectAnswer;
  };

  /**
   * Render the current question
   */
  const renderQuestion = () => {
    if (!questions || questions.length === 0 || !questions[currentQuestion]) {
      return (
        <View style={styles.noQuestionsContainer}>
          <Text style={styles.noQuestionsText}>No questions available</Text>
        </View>
      );
    }

    const question = questions[currentQuestion];

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainer}>
          {question.title && (
            <Text style={styles.questionTitle}>{question.title}</Text>
          )}
          
          {question.image && (
            <View style={styles.imageContainer}>
              <Image source={question.image} style={styles.questionImage} />
            </View>
          )}
          
          {question.gridView ? (
            // Grid view for image-based options
            <View style={styles.gridContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.gridItem,
                    selectedAnswer === index && styles.selectedGridItem,
                    getAnswerStatusStyle(index) // Add green/red border based on answer correctness
                  ]}
                  onPress={() => !answerSubmitted && setSelectedAnswer(index)}
                  disabled={answerSubmitted} // Disable further selection after submission
                >
                  <Image source={option.image} style={styles.optionImage} />
                  {selectedAnswer === index && (
                    <View style={styles.selectionIndicator}>
                      <Text style={styles.selectionIndicatorText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // List view for text-based options
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && styles.selectedOption,
                    getAnswerStatusStyle(index) // Add green/red border based on answer correctness
                  ]}
                  onPress={() => !answerSubmitted && setSelectedAnswer(index)}
                  disabled={answerSubmitted} // Disable further selection after submission
                >
                  <View style={styles.optionContent}>
                    {option.id && (
                      <View style={styles.optionIdContainer}>
                        <Text style={styles.optionId}>{option.id}</Text>
                      </View>
                    )}
                    {option.text && (
                      <Text style={styles.optionText}>{option.text}</Text>
                    )}
                  </View>
                  
                  {selectedAnswer === index && (
                    <View style={styles.checkmarkContainer}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  /**
   * Main Quiz Screen
   */
  return (
    <SafeAreaView style={styles.quizScreenContainer}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with navigation controls */}
      <View style={styles.enhancedHeader}>
        <TouchableOpacity
          style={styles.enhancedBackButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>
            &#10094;
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.enhancedHeaderTitle}>
          {selectedLanguage === 'english' ? 'Sign Language Quiz' : 'Tamil Sign Language Quiz'}
        </Text>
        
        <TouchableOpacity style={styles.closeButtonContainer} onPress={handleQuit}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      {/* Progress bar */}
      {renderProgressBar()}
      
      {/* Question content */}
      {renderQuestion()}

      {/* Bottom action button */}
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity
          style={[
            styles.enhancedContinueButton,
            selectedAnswer !== null && styles.enhancedContinueButtonActive,
          ]}
          onPress={checkAnswer}
          disabled={selectedAnswer === null || answerSubmitted}
        >
          <Text style={styles.enhancedContinueButtonText}>
            {answerSubmitted ? "PROCESSING..." : 
              (currentQuestion < questions.length - 1 ? "CHECK ANSWER" : "FINISH QUIZ")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  // Loading and Error Screen Styles
  loadingScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
  },
  loadingScreenText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  errorScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
    padding: 20,
  },
  errorScreenText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorScreenButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 15,
  },
  errorScreenButtonText: {
    color: '#6A5ACD',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorScreenBackButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  errorScreenBackButtonText: {
    color: 'white',
    fontSize: 16,
  },
  
  // Language Selection Screen Styles
  languageScreenContainer: {
    flex: 1,
    backgroundColor: '#6A5ACD',
    padding: 20,
  },
  languageSelectionText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  languageSelectionSubtext: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  languageButtonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  languageButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: width * 0.7,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  languageButtonText: {
    color: '#6A5ACD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Welcome Screen Styles
  welcomeScreenContainer: {
    flex: 1,
    backgroundColor: '#6A5ACD',
    padding: 20,
  },
  welcomeLogoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeImage: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  appTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeSubtext: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  welcomeButtonsContainer: {
    marginBottom: 40,
  },
  startQuizButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  startQuizButtonText: {
    color: '#6A5ACD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  learnMoreButton: {
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  learnMoreButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#6A5ACD',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Quiz Screen Styles
  quizScreenContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  enhancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 5,
  },
  enhancedBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  enhancedHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Progress Bar Styles
  progressContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBarWrapper: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6A5ACD',
  },
  progressText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
    textAlign: 'right',
  },
  
  // Question Styles
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  questionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  questionImage: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  
  // Options Styles
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  selectedOption: {
    borderColor: '#6A5ACD',
    backgroundColor: '#f0f0ff',
  },
  correctAnswer: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  incorrectAnswer: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIdContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6A5ACD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Grid View Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  selectedGridItem: {
    borderColor: '#6A5ACD',
    backgroundColor: '#f0f0ff',
  },
  optionImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6A5ACD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Continue Button Styles
  continueButtonContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  enhancedContinueButton: {
    backgroundColor: '#d1d1d1',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  enhancedContinueButtonActive: {
    backgroundColor: '#6A5ACD',
  },
  enhancedContinueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Empty State
  noQuestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noQuestionsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  }
});

export default QuizApp;