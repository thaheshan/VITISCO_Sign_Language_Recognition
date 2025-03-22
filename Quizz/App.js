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
const API_URL = 'http://10.0.2.2:3000'; // Change this to your backend port if different

const QuizApp = () => {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showLanguageSelection, setShowLanguageSelection] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Function to fetch questions from the backend API
  const fetchQuestions = async (language) => {
    setLoading(true);
    setError(null);
  
    try {
      console.log(`Fetching questions from: ${API_URL}/api/questions/${language}`);
      
      const response = await axios.get(`${API_URL}/api/questions/${language}`, {
        timeout: 10000, // Set timeout to 10 seconds
      });
  
      console.log("API Response:", response.data);
      
      if (!response.data || response.data.length === 0) {
        throw new Error("No questions received from API");
      }
  
      setQuestions(response.data);
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        console.error("Request timed out.");
        setError("The server is taking too long to respond. Please try again.");
      } else {
        console.error("Error fetching questions:", err?.response?.data || err.message);
        setError("Failed to load questions. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Function to save quiz results to backend
  const saveQuizResults = async (results) => {
    try {
      await axios.post(`${API_URL}/api/results`, {
        language: selectedLanguage,
        answers: results,
        timestamp: new Date().toISOString()
      });
      console.log("Quiz results saved successfully");
    } catch (err) {
      console.error("Error saving quiz results:", err);
      // Continue without blocking the user experience
    }
  };

  // Quiz questions data for english letters (fallback if API fails)
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
    },
    // ... rest of the English questions remain the same
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
    },
    //IMAGE OF G
    {
      id: 7,
      title: 'Find the sign ',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'E' },
        { id: 'B', text: 'A' },
        { id: 'C', text: 'G' },
      ],
    },

    {
      id: 8,
      title: 'Select the correct sign for H',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    {
      id: 9,
      title: 'Select the correct sign for I',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },


    //IMAGE OF J
    {
      id: 10,
      title: 'Find the sign ',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'J' },
        { id: 'B', text: 'I' },
        { id: 'C', text: 'C' },
      ],
    },

    {
      id: 11,
      title: 'Select the correct sign for K',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    {
      id: 12,
      title: 'Select the correct sign for L',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    //IMAGE OF M
    {
      id: 13,
      title: 'Find the sign ',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'M' },
        { id: 'C', text: 'C' },
      ],
    },

    {
      id: 14,
      title: 'Select the correct sign for N',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    {
      id: 15,
      title: 'Select the correct sign for O',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    //IMAGE OF P
    {
      id: 16,
      title: 'Find the sign ',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'P' },
        { id: 'B', text: 'I' },
        { id: 'C', text: 'J' },
      ],
    },

    {
      id: 17,
      title: 'Select the correct sign for Q',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    {
      id: 18,
      title: 'Select the correct sign for R',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    //IMAGE OF S
    {
      id: 19,
      title: 'Find the sign ',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'S' },
        { id: 'B', text: 'B' },
        { id: 'C', text: 'F' },
      ],
    },

    {
      id: 20,
      title: 'Select the correct sign for T',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    {
      id: 21,
      title: 'Select the correct sign for U',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    {
      id: 22,
      title: 'Select the correct sign for V',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    //IMAGE OF W
    {
      id: 23,
      title: 'Find the sign ',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'O' },
        { id: 'B', text: 'S' },
        { id: 'C', text: 'W' },
      ],
    },

    {
      id: 24,
      title: 'Select the correct sign for X',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    {
      id: 25,
      title: 'Select the correct sign for Y',
      options: [
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
        { image: require('./assets/sign1.png') },
      ],
      gridView: true,
    },

    //IMAGE OF Z
    {
      id: 26,
      title: 'Find the sign ',
      image: require('./assets/sign1.png'),
      options: [
        { id: 'A', text: 'X' },
        { id: 'B', text: 'Z' },
        { id: 'C', text: 'G' },
      ],
    },

    // ... rest of the English questions remain the same
  ];

  // Tamil quiz questions data (fallback if API fails)
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
    },
    // ... rest of the Tamil questions remain the same
  ];

  // Handle language selection
  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    setShowLanguageSelection(false);
  };

  // Start the quiz
  const startQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizHistory([]);
    setShowStartScreen(false);
  };

  // Move to the next question and save current answer to history
  const handleContinue = () => {
    // Update quiz history
    const updatedHistory = [...quizHistory];
    updatedHistory[currentQuestion] = selectedAnswer;
    setQuizHistory(updatedHistory);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Save results to backend
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
  };

  // Enhanced back functionality
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
            } 
          }
        ]
      );
    } else {
      // If on first question, ask if user wants to return to start screen
      handleQuit();
    }
  };

  // Enhanced quit confirmation with save progress option
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

  // Language Selection Screen
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

  // Enhanced Welcome Screen UI (shown after language selection)
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

  // Show loading state if questions are being fetched
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreenContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingScreenText}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  // Show error screen if there was an error fetching questions
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

  // Enhanced Progress bar component
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

  // Render the current question with enhanced styling
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
            <View style={styles.gridContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.gridItem,
                    selectedAnswer === index && styles.selectedGridItem
                  ]}
                  onPress={() => setSelectedAnswer(index)}
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
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedAnswer(index)}
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

  return (
    <SafeAreaView style={styles.quizScreenContainer}>
      <StatusBar barStyle="dark-content" />
      
      {/* Enhanced Header with improved back button */}
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
      
      {renderProgressBar()}
      {renderQuestion()}

      {/* Enhanced Continue Button */}
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity
          style={[
            styles.enhancedContinueButton,
            selectedAnswer !== null && styles.enhancedContinueButtonActive,
          ]}
          onPress={handleContinue}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.enhancedContinueButtonText}>
            {currentQuestion < questions.length - 1 ? "CONTINUE" : "FINISH QUIZ"}
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
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 16,
  },
  errorScreenButtonText: {
    color: '#6A5ACD',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorScreenBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  errorScreenBackButtonText: {
    color: 'white',
    fontSize: 16,
  },
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
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  retryButtonText: {
    color: '#6A5ACD',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noQuestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noQuestionsText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6A5ACD',
  },

  // Language Selection Screen Styles
  languageScreenContainer: {
    flex: 1,
    backgroundColor: '#6A5ACD', // Rich purple background
    justifyContent: 'space-between',
    padding: 20,
  },
  languageSelectionText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  languageSelectionSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 22,
  },
  languageButtonsContainer: {
    marginBottom: 50,
    alignItems: 'center',
    gap: 20,
  },
  languageButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 7,
  },
  languageButtonText: {
    color: '#6A5ACD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Enhanced Welcome Screen Styles
  welcomeScreenContainer: {
    flex: 1,
    backgroundColor: '#6A5ACD', // Rich purple background
    justifyContent: 'space-between',
    padding: 20,
  },
  welcomeLogoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  welcomeImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 22,
  },
  welcomeButtonsContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  startQuizButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 7,
  },
  startQuizButtonText: {
    color: '#6A5ACD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  learnMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    width: '60%',
    alignItems: 'center',
  },
  learnMoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Enhanced Quiz Screen Styles
  quizScreenContainer: {
    flex: 1,
    backgroundColor: '#c5c6e8', // Light background with slight purple tint
  },
  
  // Enhanced Header
  enhancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#5d5b8d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  enhancedBackButton: {
    padding: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledBackButton: {
    color: '#CCCCCC',
  },
  closeButtonContainer: {
    padding: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Enhanced Progress Bar
  progressContainer: {
    padding: 16,
    backgroundColor: '#5d5b8d',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  progressBarWrapper: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6A5ACD',
    borderRadius: 10,
  },
  progressText: {

    textAlign: 'right',
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Enhanced Scrollable Content
  scrollContainer: {
    paddingBottom: 100,
  },
  
  // Enhanced Question Container
  questionContainer: {
    padding: 16,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 24,
    textAlign: 'center',
  },
  imageContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  questionImage: {
    width: width * 0.8,
    height: 200,
    resizeMode: 'contain',
  },
  
  // Enhanced Options
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedOption: {
    backgroundColor: '#F0F4FF',
    borderColor: '#6A5ACD',
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIdContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6A5ACD',
  },
  optionText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6A5ACD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Enhanced Grid Layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  selectedGridItem: {
    backgroundColor: '#F0F4FF',
    borderColor: '#6A5ACD',
    borderWidth: 2,
  },
  optionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
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
  
  // Enhanced Continue Button
  continueButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  enhancedContinueButton: {
    padding: 16,
    backgroundColor: '#CCCCCC',
    borderRadius: 30,
    alignItems: 'center',
    opacity: 0.5,
  },
  enhancedContinueButtonActive: {
    backgroundColor: '#6A5ACD',
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  enhancedContinueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default QuizApp;