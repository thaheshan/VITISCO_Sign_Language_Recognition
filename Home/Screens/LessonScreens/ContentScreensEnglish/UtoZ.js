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
  ScrollView
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
import { Video } from 'expo-av';

// ProgressBar Component
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

// Confetti Component
const Confetti = ({ show }) => {
  if (!show) return null;
  
  const confettiCount = 50;
  const confettiElements = [];
  
  for (let i = 0; i < confettiCount; i++) {
    const initialX = Math.random() * width;
    const initialY = -20;
    const size = Math.random() * 8 + 4;
    const color = ['#FF5252', '#FFEB3B', '#2196F3', '#4CAF50', '#9C27B0'][Math.floor(Math.random() * 5)];
    const duration = Math.random() * 2000 + 2000;
    const delay = Math.random() * 1000;
    
    const animX = useRef(new Animated.Value(initialX)).current;
    const animY = useRef(new Animated.Value(initialY)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      if (show) {
        Animated.parallel([
          Animated.timing(animY, {
            toValue: height,
            duration: duration,
            easing: Easing.ease,
            delay: delay,
            useNativeDriver: true
          }),
          Animated.timing(animX, {
            toValue: initialX + (Math.random() * width / 2 - width / 4),
            duration: duration,
            easing: Easing.ease,
            delay: delay,
            useNativeDriver: true
          }),
          Animated.timing(rotate, {
            toValue: Math.random() * 10,
            duration: duration,
            easing: Easing.ease,
            delay: delay,
            useNativeDriver: true
          })
        ]).start();
      }
    }, [show]);
    
    const rotateInterpolate = rotate.interpolate({
      inputRange: [0, 10],
      outputRange: ['0deg', '360deg']
    });
    
    confettiElements.push(
      <Animated.View 
        key={i}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: color,
          transform: [
            { translateX: animX },
            { translateY: animY },
            { rotate: rotateInterpolate }
          ]
        }}
      />
    );
  }
  
  return confettiElements;
};

export default function AtoDScreen({ navigation, route = {} }) {
  const { lessonId = 1, lessonType = 'alphabet', onComplete } = route.params || {};
  const [currentCard, setCurrentCard] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [characterState, setCharacterState] = useState('intro');
  const [isIdle, setIsIdle] = useState(false);
  const [characterVisible, setCharacterVisible] = useState(true);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef(null);
  const characterVideoRef = useRef(null);
  const idleTimerRef = useRef(null);
  
  // Animation refs for character
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [characterLoaded, setCharacterLoaded] = useState(false);
  
  // Lesson content based on lesson type and ID
  const lessonContent = {
    alphabet: {
      1: {
        title: "Basic Alphabet (u-z)",
        cards: [
          { 
            letter: 'U', 
            pronunciation: 'a', 
            example: 'apple', 
            sign: require('../../../assets/videos/Thahee.mp4'), 
            signText: 'Hand forms letter A shape',
            characterVideo: require('../../../assets/videos/Scene - Jackie.mp4')
          },
          { 
            letter: 'V', 
            pronunciation: 'ae', 
            example: 'ant', 
            sign: require('../../../assets/videos/Thahee.mp4'), 
            signText: 'Open palm moving rightward',
            characterVideo: require('../../../assets/videos/Scene - Jackie.mp4')
          },
          { 
            letter: 'W', 
            pronunciation: 'aae', 
            example: 'ask', 
            sign: require('../../../assets/videos/Thahee.mp4'), 
            signText: 'Extended palm with circular motion',
            characterVideo: require('../../../assets/videos/Scene - Jackie.mp4')
          },
          { 
            letter: 'X', 
            pronunciation: 'i', 
            example: 'if', 
            sign: require('../../../assets/videos/Thahee.mp4'), 
            signText: 'Pinky finger pointing upward',
            characterVideo: require('../../../assets/videos/Scene - Jackie.mp4')
          },
        ],
        xpReward: 75
      },

      // Add more phrase lessons here
    }
  };
  
  // Default character video for waiting and congrats states
  const defaultCharacterVideos = {
    waiting: require('../../../assets/videos/Scene - Jackie.mp4'),
    congrats: require('../../../assets/videos/Scene - Jackie.mp4')
  };
  
  // Get appropriate video based on character state and current card
  const getCharacterVideo = () => {
    if (characterState === 'waiting') {
      return defaultCharacterVideos.waiting;
    } else if (characterState === 'congrats') {
      return defaultCharacterVideos.congrats;
    } else {
      // Return the video directly from the current card
      return cards[currentCard].characterVideo;
    }
  };
  
  // Generate speech text based on character state and current card
  const getSpeechText = () => {
    const currentCardData = cards[currentCard];
    
    if (characterState === 'intro') {
      if (lessonType === 'alphabet') {
        return "Hi! I'm here to help you learn the alphabet in sign language. Let's start!";
      } else if (lessonType === 'numbers') {
        return "Let's learn how to count using sign language together!";
      } else if (lessonType === 'phrases') {
        return "I'll show you useful phrases in sign language. These will help you communicate!";
      } else {
        return "Hi! I'm here to help you learn. Let's start with this lesson!";
      }
    } else if (characterState === 'congrats') {
      return "Fantastic job! You've mastered this lesson. Keep practicing to improve your skills!";
    } else if (characterState === 'waiting') {
      return "Take your time to practice. I'll wait for you!";
    } else {
      // For explaining state - customize based on card content
      if (currentCardData?.letter) {
        return `Now watch carefully how to sign the letter "${currentCardData.letter}" in sign language. Try to follow along!`;
      } else if (currentCardData?.phrase) {
        return `Let me show you how to sign "${currentCardData.phrase}". This is commonly used when ${currentCardData.usage?.toLowerCase() || 'communicating'}.`;
      } else if (currentCardData?.number) {
        return `Here's how to sign the number ${currentCardData.number}. Notice the finger positions and movements.`;
      } else {
        return "Watch the video carefully and try to mimic the signs.";
      }
    }
  };
  
  // Get the current lesson based on the lessonType and lessonId
  const currentLessonType = lessonContent[lessonType] || lessonContent.alphabet;
  const currentLesson = currentLessonType[lessonId] || currentLessonType[1];
  const cards = currentLesson.cards;
  
  // Start floating animation for character
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);
  
  // Reset idle timer on any interaction
  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // Set timer for character to go to waiting state after 15 seconds of inactivity
    idleTimerRef.current = setTimeout(() => {
      if (!showSuccess && characterState === 'explaining') {
        setCharacterState('waiting');
      }
    }, 15000);
  };
  
  // Set up idle timer to change character state when user is inactive
  useEffect(() => {
    resetIdleTimer();
    
    // Clean up timeout on unmount
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [currentCard, characterState, showSuccess]);
  
  // Card and video animation setup
  useEffect(() => {
    // Card flip animation
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Play lesson video
    if (videoRef.current) {
      videoRef.current.setStatusAsync({
        shouldPlay: true,
        isLooping: true,
      }).catch(error => {
        console.log("Lesson video playback error:", error);
      });
    }
    
    // Play character video
    if (characterVideoRef.current && characterLoaded) {
      characterVideoRef.current.setStatusAsync({
        shouldPlay: true,
        isLooping: true,
      }).catch(error => {
        console.log("Character video playback error:", error);
      });
    }
    
    // Change character state when mounted
    if (currentCard === 0) {
      // Show intro initially, then change to explaining after 2 seconds
      setCharacterState('intro');
      setTimeout(() => {
        setCharacterState('explaining');
      }, 2000);
    } else {
      setCharacterState('explaining');
    }
    
    return () => {
      // Stop videos when unmounting
      if (videoRef.current) {
        videoRef.current.stopAsync().catch(error => {
          console.log("Lesson video stop error:", error);
        });
      }
      
      if (characterVideoRef.current) {
        characterVideoRef.current.stopAsync().catch(error => {
          console.log("Character video stop error:", error);
        });
      }
    };
  }, [currentCard, characterLoaded]);
  
  // Update character video when state changes
  useEffect(() => {
    if (characterVideoRef.current && characterLoaded) {
      characterVideoRef.current.setStatusAsync({
        shouldPlay: true,
        isLooping: true,
      }).catch(error => {
        console.log("Character video update error:", error);
      });
    }
  }, [characterState]);
  
  const nextCard = () => {
    // Reset idle timer on interaction
    resetIdleTimer();
    
    // Reset to explaining state whenever user interacts
    if (characterState === 'waiting') {
      setCharacterState('explaining');
    }
    
    if (currentCard < cards.length - 1) {
      // Reset animation value
      cardAnim.setValue(0);
      
      // Stop current videos
      if (videoRef.current) {
        videoRef.current.stopAsync().catch(error => {
          console.log("Lesson video stop error:", error);
        });
      }
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Move to next card
      setCurrentCard(currentCard + 1);
    } else {
      // Completed all cards
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      setCharacterState('congrats');
      
      // Navigate after showing success animation
      setTimeout(() => {
        navigation.navigate('LessonComplete', {
          lessonId: lessonId,
          lessonType: lessonType,
          xpEarned: currentLesson.xpReward,
          lessonTitle: currentLesson.title,
          onComplete
        });
      }, 3000);
    }
  };
  
  const prevCard = () => {
    // Reset idle timer on interaction
    resetIdleTimer();
    
    // Reset to explaining state whenever user interacts
    if (characterState === 'waiting') {
      setCharacterState('explaining');
    }
    
    if (currentCard > 0) {
      // Reset animation value
      cardAnim.setValue(0);
      
      // Stop current videos
      if (videoRef.current) {
        videoRef.current.stopAsync().catch(error => {
          console.log("Lesson video stop error:", error);
        });
      }
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Move to previous card
      setCurrentCard(currentCard - 1);
    }
  };
  
  // Toggle character visibility
  const toggleCharacter = () => {
    setCharacterVisible(!characterVisible);
  };
  
  // Card animation values
  const cardScale = cardAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.9, 1]
  });
  
  const cardOpacity = cardAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1]
  });
  
  // Calculate floating movement for character
  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5] // Float 5 units up and down
  });
  
  // Handle errors for missing video files
  const handleVideoError = (error) => {
    console.log("Video loading error:", error);
  };
  
  // Render card content based on lesson type
  const renderCardContent = (card) => {
    // For alphabet lessons
    if (card.letter) {
      return (
        <>
          <Text style={styles.alphabetLetter}>{card.letter}</Text>
          <Text style={styles.alphabetPronunciation}>
            Pronounced as: "{card.pronunciation}"
          </Text>
          <Text style={styles.exampleText}>
            Example: {card.example}
          </Text>
          <Text style={styles.signText}>
            {card.signText}
          </Text>
        </>
      );
    }
    
    // For greeting/phrase lessons
    if (card.phrase) {
      return (
        <>
          <Text style={styles.phraseLetter}>{card.phrase}</Text>
          <Text style={styles.phraseMeaning}>
            Meaning: "{card.meaning}"
          </Text>
          <Text style={styles.usageText}>
            Usage: {card.usage}
          </Text>
          <Text style={styles.signText}>
            {card.signText}
          </Text>
        </>
      );
    }
    
    // For number lessons
    if (card.number) {
      return (
        <>
          <Text style={styles.numberDigit}>{card.number}</Text>
          <Text style={styles.numberSinhala}>{card.sinhala}</Text>
          <Text style={styles.numberPronunciation}>
            Pronounced as: "{card.pronunciation}"
          </Text>
          <Text style={styles.signText}>
            {card.signText}
          </Text>
        </>
      );
    }
    
    return null;
  };
  
  return (
    <SafeAreaView style={styles.container} onTouchStart={resetIdleTimer}>
      <View style={styles.header}>
        <Text style={styles.levelIndicator}>{currentLesson.title}</Text>
        <TouchableOpacity 
          style={styles.characterToggle}
          onPress={toggleCharacter}
        >
          <Text style={styles.toggleText}>
            {characterVisible ? "Hide" : "Show"} Assistant
          </Text>
        </TouchableOpacity>
      </View>
      
      <ProgressBar current={currentCard + 1} total={cards.length} />
      
      {!showSuccess ? (
        <View style={styles.contentContainer}>
          <Animated.View 
            style={[
              styles.lessonCard,
              {
                opacity: cardOpacity,
                transform: [{ scale: cardScale }],
              }
            ]}
          >
            {renderCardContent(cards[currentCard])}
            
            {/* Horizontal video container */}
            <View style={styles.horizontalVideoContainer}>
              {/* Lesson video */}
              <View style={styles.videoWrapper}>
                <Video
                  ref={videoRef}
                  source={cards[currentCard].sign}
                  style={styles.signVideo}
                  resizeMode="contain"
                  isLooping
                  shouldPlay
                  useNativeControls={false}
                  onError={handleVideoError}
                />
                <Text style={styles.videoLabel}>Sign Demonstration</Text>
              </View>
              
              {/* Character video - conditionally rendered */}
              {characterVisible && (
                <View style={styles.characterWrapper}>
                  <Animated.View style={{ transform: [{ translateY: floatTranslateY }] }}>
                    <Video
                      ref={characterVideoRef}
                      source={getCharacterVideo()}
                      style={styles.characterVideo}
                      resizeMode="contain"
                      isLooping
                      shouldPlay
                      useNativeControls={false}
                      onLoad={() => setCharacterLoaded(true)}
                      onError={(error) => console.log("Character video error:", error)}
                    />
                  </Animated.View>
                  
                  {/* Speech bubble */}
                  <View style={styles.speechBubble}>
                    <View style={styles.speechBubbleTail} />
                    <Text style={styles.speechText}>
                      {getSpeechText()}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.successContainer}>
          <Confetti show={true} />
          {characterVisible && (
            <View style={styles.successCharacterContainer}>
              <Video
                ref={characterVideoRef}
                source={defaultCharacterVideos.congrats}
                style={styles.successCharacterVideo}
                resizeMode="contain"
                isLooping
                shouldPlay
                useNativeControls={false}
              />
              <View style={styles.speechBubble}>
                <View style={styles.speechBubbleTail} />
                <Text style={styles.speechText}>
                  Fantastic job! You've mastered this lesson. Keep practicing to improve your skills!
                </Text>
              </View>
            </View>
          )}
          <Text style={styles.successTitle}>Great Job!</Text>
          <Text style={styles.successMessage}>
            You've completed the {currentLesson.title} lesson!
          </Text>
        </View>
      )}
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, currentCard === 0 && styles.disabledButton]}
          onPress={prevCard}
          disabled={currentCard === 0 || showSuccess}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={nextCard}
          disabled={showSuccess}
        >
          <Text style={styles.navButtonText}>
            {currentCard < cards.length - 1 ? 'Next' : 'Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}



// Improved styles for the character component
const characterStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -width * 0.3, // Start offscreen
    bottom: 10,
    width: width * 0.35, // Adjusted for better proportion
    height: height * 0.3,
    zIndex: 10,
    alignItems: 'center',
  },
  characterVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', // Ensures transparent background in video
  },
  speechBubble: {
    position: 'absolute',
    top: -60,
    left: -20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 15,
    width: width * 0.55,
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  speechText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});




const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#c5c6e8',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
    },
  
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 80,
      marginBottom: 20,
      color: '#383773',
    },
    beginButton: {
      backgroundColor: '#5d5b8d',
      paddingVertical: 12,
      paddingHorizontal: 50,
      borderRadius: 8,
      marginTop: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
      alignSelf: 'center',
    },
    nextButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    loadingContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    characterImage: {
      width: width * 0.7,
      height: width * 0.7,
      marginVertical: 20,
    },
    progressCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 3,
      borderColor: '#5d5b8d',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 20,
    },
    progressPercent: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#383773',
    },
    loadingText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 30,
      color: '#383773',
    },
    loadingBarContainer: {
      width: '80%',
      height: 10,
      backgroundColor: '#ffffff',
      borderRadius: 5,
      overflow: 'hidden',
    },
    loadingBar: {
      height: '100%',
      backgroundColor: '#5d5b8d',
      borderRadius: 5,
    },
    customizeTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 60,
      marginBottom: 30,
      color: '#383773',
      paddingHorizontal: 20,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      width: '100%',
      marginBottom: 30,
    },
    optionButton: {
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    yesButton: {
      backgroundColor: '#5d5b8d',
    },
    noButton: {
      backgroundColor: '#9291b9',
    },
    optionButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    customizationHeader: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#383773',
      marginTop: 40,
      marginBottom: 20,
    },
    levelSelector: {
      width: '100%',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#383773',
      marginBottom: 10,
    },
    levelOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    levelOption: {
      padding: 15,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#c5c6e8',
      marginBottom: 10,
      minWidth: width / 4.5,
      alignItems: 'center',
    },
    selectedLevel: {
      borderColor: '#5d5b8d',
      backgroundColor: 'rgba(93, 91, 141, 0.1)',
    },
    levelOptionText: {
      fontSize: 16,
      color: '#555',
    },
    selectedLevelText: {
      color: '#5d5b8d',
      fontWeight: 'bold',
    },
    topicsSection: {
      width: '100%',
      marginBottom: 20,
    },
    topicsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    topicItem: {
      width: width / 2.4,
      padding: 15,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#c5c6e8',
      marginBottom: 15,
      alignItems: 'center',
    },
    selectedTopic: {
      borderColor: '#5d5b8d',
      backgroundColor: 'rgba(93, 91, 141, 0.1)',
    },
    topicIcon: {
      fontSize: 28,
      marginBottom: 5,
    },
    topicName: {
      fontSize: 16,
      color: '#555',
    },
    selectedTopicText: {
      color: '#5d5b8d',
      fontWeight: 'bold',
    },
    continueButton: {
      backgroundColor: '#5d5b8d',
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 8,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
      alignSelf: 'center',
    },
    customizationButton: {
      width: '100%',
      marginTop: 30,
    },
    disabledButton: {
      backgroundColor: '#c5c6e8',
      shadowOpacity: 0.1,
    },
    gamePreparationTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 60,
      color: '#383773',
    },
    preparationLoading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    preparationText: {
      fontSize: 16,
      color: '#383773',
      marginVertical: 20,
    },
    preparationSteps: {
      alignSelf: 'stretch',
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    preparationStep: {
      fontSize: 16,
      color: '#555',
      marginVertical: 5,
    },
    gearIcon: {
      fontSize: 50,
    },
    gameReadyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gameReadyText: {
      fontSize: 16,
      textAlign: 'center',
      color: '#383773',
      marginBottom: 30,
      lineHeight: 26,
    },
    adventureButton: {
      backgroundColor: '#5d5b8d',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    dailyRewardTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#383773',
      marginTop: 60,
    },
    rewardChest: {
      marginVertical: 30,
    },
    chestIcon: {
      fontSize: 80,
    },
    dailyRewardText: {
      fontSize: 16,
      textAlign: 'center',
      color: '#383773',
      marginBottom: 30,
      lineHeight: 26,
    },
    claimButton: {
      backgroundColor: '#8e8cc0',
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    rewardRevealContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rewardRevealText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#383773',
      marginBottom: 20,
    },
    rewardItem: {
      fontSize: 16,
      color: '#383773',
      marginVertical: 10,
    },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
    },
    confetti: {
      width: width,
      height: height,
    },
    levelIndicator: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#383773',
      marginTop: 20,
      alignSelf: 'center',
    },
    countdownContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: 40,
    },
    countdownText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#383773',
      marginBottom: 20,
    },
    countdownCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: '#5d5b8d',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    countdownNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#383773',
    },
    countdownUnit: {
      fontSize: 10,
      color: '#383773',
      opacity: 0.8,
    },
    getStartedTitle: {
      fontSize: 40,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#383773',
      marginTop: 40,
      lineHeight: 50,
    },
    startButton: {
      backgroundColor: '#5d5b8d',
      paddingVertical: 12,
      paddingHorizontal: 50,
      borderRadius: 8,
      marginBottom: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
      alignSelf: 'center',
    },
    lessonIntroContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      paddingHorizontal: 15,
    },
    lessonIntroTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#383773',
      marginBottom: 20,
      textAlign: 'center',
    },
    lessonInfoCard: {
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
    lessonInfoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#EEE',
      paddingBottom: 10,
    },
    lessonInfoTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#383773',
    },
    lessonInfoDuration: {
      fontSize: 14,
      color: '#5d5b8d',
      fontWeight: '600',
    },
    lessonInfoContent: {
      marginBottom: 10,
    },
    lessonInfoDescription: {
      fontSize: 16,
      color: '#555',
      lineHeight: 22,
      marginBottom: 15,
    },
    lessonTopics: {
      marginTop: 10,
    },
    lessonTopicItem: {
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
    startLessonButton: {
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
    welcomeLessonsTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#383773',
      textAlign: 'center',
      marginTop: 60,
      marginBottom: 40,
    },
    pathwayHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    pathwaySubtitle: {
      fontSize: 16,
      color: '#555',
      marginTop: 5,
    },
    pathwayContainer: {
      flex: 1,
      width: '100%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    pathwayCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#5d5b8d',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    giftNode: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#8e8cc0',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    largeNode: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#383773',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 6,
    },
    lockedNode: {
      backgroundColor: '#c5c6e8',
    },
    nodeButton: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    nodeNumber: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    largeNodeText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    lockIcon: {
      fontSize: 18,
      color: 'white',
    },
    nodeIcon: {
      width: 24,
      height: 24,
    },
    pathwayNode: {
      position: 'absolute',
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarIcon: {
      width: 30,
      height: 30,
    },
    pathConnector: {
      position: 'absolute',
      backgroundColor: '#c5c6e8',
      zIndex: -1,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginVertical: 20,
    },
    progressBackground: {
      flex: 1,
      height: 12,
      backgroundColor: '#ffffff',
      borderRadius: 10,
      marginRight: 10,
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
      fontWeight: 'bold',
      color: '#383773',
    },
    alphabetCard: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 30,
      width: '90%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      marginVertical: 20,
    },
    alphabetLetter: {
      fontSize: 80,
      fontWeight: 'bold',
      color: '#5d5b8d',
      marginBottom: 20,
    },
    alphabetPronunciation: {
      fontSize: 18,
      color: '#555',
      marginBottom: 20,
    },
    signImage: {
      width: 150,
      height: 150,
      marginVertical: 20,
    },
    exampleText: {
      fontSize: 16,
      color: '#555',
      marginTop: 10,
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '90%',
      marginBottom: 30,
    },
    navButton: {
      backgroundColor: '#5d5b8d',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    navButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    successTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#5d5b8d',
      marginBottom: 20,
    },
    successMessage: {
      fontSize: 16,
      textAlign: 'center',
      color: '#555',
      lineHeight: 26,
    },
    lessonCompleteTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#5d5b8d',
      marginTop: 60,
    },
    trophyContainer: {
      marginVertical: 30,
    },
    trophyIcon: {
      fontSize: 80,
    },
    rewardsContainer: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      width: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 4,
    },
    header: {
      marginTop: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButton: {
      position: 'absolute',
      left: 0,
      padding: 10,
    },
    backButtonText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#383773',
    },
    basicText: {
      fontSize: 16,
      fontWeight: 'bold',
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
      width: 500,
      height: 400,
      marginTop: -60,
    },
    nextButton: {
      backgroundColor: '#5d5b8d',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    pathwayNode: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    currentNode: {
      transform: [{ scale: 1.2 }],
      backgroundColor: '#5d5b8d',
    },
    milestoneFlag: {
      position: 'absolute',
      top: -40,
      left: -20,
      backgroundColor: '#ffd700',
      padding: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    flagIcon: {
      width: 24,
      height: 24,
      marginLeft: 5,
    },
    milestoneText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#383773',
    },
    buttonParticles: {
      position: 'absolute',
      width: 200,
      height: 200,
      zIndex: -1,
    },
    pathwayContainer: {
      transform: [{ perspective: 1000 }],
      flex: 1,
      width: '100%',
      marginTop: 20,
    },
    pathConnector: {
      backgroundColor: '#fff',
      position: 'absolute',
      zIndex: -1,
      shadowColor: '#fff',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    avatarIcon: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    pathwayHeader: {
      alignItems: 'center',
      padding: 20,
    },
    pathwaySubtitle: {
      fontSize: 16,
      color: '#555',
      marginTop: 5,
    },
    pathwayContainer: {
      flex: 1,
      width: '100%',
      marginTop: 40,
    },
  
    pathSvg: {
      position: 'absolute',
    },
    nodeContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
    },
    nodeButton: {
      borderRadius: 25,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    nodeGradient: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    currentNode: {
      shadowColor: '#383773',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    completedNode: {
      shadowOpacity: 0.15,
    },
    lockedNode: {
      shadowOpacity: 0.1,
    },
    nodeNumber: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    nodeIcon: {
      fontSize: 18,
      color: 'white',
    },
    nodeLabel: {
      position: 'absolute',
      top: 45,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    nodeLabelText: {
      fontSize: 12,
      color: '#383773',
      fontWeight: '600',
    },
    avatarContainer: {
      position: 'absolute',
      width: 60,
      height: 60,
      zIndex: 10,
    },
    avatarImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    avatarShadow: {
      position: 'absolute',
      bottom: -5,
      left: 15,
      width: 30,
      height: 10,
      borderRadius: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      transform: [{ scaleX: 1.5 }],
    },
    cloud: {
      position: 'absolute',
      borderRadius: 20,
      overflow: 'hidden',
    },
    cloudBlur: {
      flex: 1,
      borderRadius: 20,
    },
    cloudInner: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    terrainBase: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: height * 0.3,
    },
    terrainGradient: {
      flex: 1,
    },
    mapEndClouds: {
      position: 'absolute',
      right: 0,
      width: width,
      height: '100%',
    },
    cloudCover: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mysteryText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#383773',
      textShadowColor: 'rgba(255, 255, 255, 0.7)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    buttonContainer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    continueButton: {
      width: width * 0.8,
      height: 50,
      borderRadius: 25,
      overflow: 'hidden',
      shadowColor: '#383773',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 6,
    },
    buttonGradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    elevationIndicator: {
      position: 'absolute',
      bottom: -5,
      width: 2,
      backgroundColor: 'rgba(93, 91, 141, 0.5)',
    },
    elevationGradient: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: '#c5c6e8',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
    },
    welcomeLessonsTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#383773',
      textAlign: 'center',
      marginTop: 60,
      marginBottom: 40,
    },
    characterImage: {
      width: width * 0.7,
      height: width * 0.7,
      marginVertical: 20,
    },
    continueButton: {
      backgroundColor: '#5d5b8d',
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 8,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
      alignSelf: 'center',
    },
    nextButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
    },
  
    container: {
      flex: 1,
      backgroundColor: '#c5c6e8',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 60,
      marginBottom: 20,
      color: '#383773',
    },
    basicText: {
      fontSize: 16,
      textAlign: 'center',
      color: '#383773',
      marginBottom: 30,
    },
    languagesContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    languageOption: {
      width: '85%',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    languageCard: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
    },
    languageTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#383773',
      marginBottom: 8,
    },
    languageNative: {
      fontSize: 24,
      color: '#5d5b8d',
      marginBottom: 15,
    },
    flagContainer: {
      flexDirection: 'row',
      height: 30,
      width: '80%',
      borderRadius: 5,
      overflow: 'hidden',
      marginTop: 10,
    },
    flagSection: {
      flex: 1,
      height: '100%',
    },
    ukFlag: {
      width: '80%',
      height: 30,
      backgroundColor: '#00247D',
      position: 'relative',
    },
    ukFlagBackground: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: '#00247D',
    },
    ukFlagCross1: {
      position: 'absolute',
      width: '100%',
      height: 6,
      backgroundColor: 'white',
      top: '50%',
      marginTop: -3,
    },
    ukFlagCross2: {
      position: 'absolute',
      width: 6,
      height: '100%',
      backgroundColor: 'white',
      left: '50%',
      marginLeft: -3,
    },
    buttonContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 30,
    },
    continueButton: {
      backgroundColor: '#5d5b8d',
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 8,
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
    videoContainer: {
      width: '100%',
      height: 200,
      marginVertical: 15,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    signVideo: {
      width: '100%',
      height: '100%',
    },
    
    signText: {
      fontSize: 16,
      color: '#555',
      textAlign: 'center',
      marginBottom: 10,
      fontStyle: 'italic',
    },
    
    // Update your existing styles if needed
    alphabetCard: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 20,
    },
  
  






















    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 20,
    },
    contentContainer: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    levelIndicator: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
    },
    alphabetCard: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      width: width * 0.8,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
 
 
    videoContainer: {
      width: '90%',
      height: 180,
      marginVertical: 15,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: '#eee',
    },
    signVideo: {
      width: '100%',
      height: '100%',
    },
    signText: {
      fontSize: 16,
      marginVertical: 10,
      textAlign: 'center',
      color: '#666',
      fontStyle: 'italic',
    },
    exampleText: {
      fontSize: 16,
      marginTop: 10,
      color: '#555',
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '80%',
      marginTop: 20,
    },

 
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    successTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: 20,
    },
    successMessage: {
      fontSize: 18,
      textAlign: 'center',
      paddingHorizontal: 20,
      color: '#555',
    },
    phraseLetter: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#4CAF50',
    },
    phraseMeaning: {
      fontSize: 18,
      marginBottom: 15,
      color: '#555',
    },
    usageText: {
      fontSize: 16,
      marginTop: 10,
      color: '#555',
      fontStyle: 'italic',
    },
    numberDigit: {
      fontSize: 72,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#FF9800',
    },
    numberSinhala: {
      fontSize: 36,
      marginBottom: 10,
      color: '#FF9800',
    },
    numberPronunciation: {
      fontSize: 18,
      marginBottom: 15,
      color: '#555',
    },
  
  
  
  
    
  
  
  
  
  


























    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    levelIndicator: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 15,
      marginBottom: 10,
      color: '#333',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative', // For absolute positioning of character
      paddingHorizontal: width * 0.05, // Give space for character
    },
    alphabetCard: {
      width: width * 0.8,
      maxWidth: 400,
      minHeight: height * 0.5,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
      marginLeft: width * 0.05, // Shift left to make space for character
    },
    alphabetLetter: {
      fontSize: 48,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
    },
    alphabetPronunciation: {
      fontSize: 18,
      marginBottom: 20,
      color: '#666',
    },
    videoContainer: {
      width: width * 0.7,
      height: height * 0.25,
      borderRadius: 10,
      overflow: 'hidden',
      marginVertical: 15,
      backgroundColor: '#E0E0E0',
    },
    signVideo: {
      width: '100%',
      height: '100%',
    },
    signText: {
      fontSize: 16,
      textAlign: 'center',
      marginVertical: 10,
      color: '#555',
      fontStyle: 'italic',
    },
    exampleText: {
      fontSize: 16,
      marginTop: 10,
      color: '#666',
    },
    // Phrase specific styles
    phraseLetter: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
      textAlign: 'center',
    },
    phraseMeaning: {
      fontSize: 18,
      marginBottom: 20,
      color: '#666',
    },
    usageText: {
      fontSize: 16,
      marginTop: 10,
      color: '#666',
    },
    // Number specific styles
    numberDigit: {
      fontSize: 48,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333',
    },
    numberSinhala: {
      fontSize: 32,
      marginBottom: 5,
      color: '#444',
    },
    numberPronunciation: {
      fontSize: 18,
      marginBottom: 20,
      color: '#666',
    },
    // Success screen styles
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    successTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: 15,
    },
    successMessage: {
      fontSize: 18,
      textAlign: 'center',
      color: '#555',
      marginHorizontal: 20,
    },
    // Navigation buttons
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 10,
    },
    navButton: {
      backgroundColor: '#2196F3',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
      minWidth: 120,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: '#BDBDBD',
    },
    navButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },


































    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    levelIndicator: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#4a4a4a',
    },
    characterToggle: {
      backgroundColor: '#e0e0e0',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    toggleText: {
      fontSize: 14,
      color: '#4a4a4a',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    lessonCard: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      alignItems: 'center',
    },
    horizontalVideoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 20,
    },
    videoWrapper: {
      width: '48%',
      alignItems: 'center',
    },
    characterWrapper: {
      width: '48%',
      alignItems: 'center',
    },
    signVideo: {
      width: '100%',
      height: 180,
      borderRadius: 10,
      backgroundColor: '#f0f0f0',
    },
    characterVideo: {
      width: '100%',
      height: 150,
      borderRadius: 10,
      backgroundColor: '#f0f0f0',
    },
    videoLabel: {
      marginTop: 5,
      fontSize: 12,
      color: '#666',
      textAlign: 'center',
    },
    speechBubble: {
      backgroundColor: '#e8f5ff',
      borderRadius: 15,
      padding: 10,
      marginTop: 10,
      maxWidth: '100%',
      position: 'relative',
    },
    speechBubbleTail: {
      position: 'absolute',
      top: -8,
      left: '45%',
      width: 0,
      height: 0,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#e8f5ff',
    },
    speechText: {
      fontSize: 12,
      color: '#333',
      textAlign: 'center',
    },
    alphabetLetter: {
      fontSize: 50,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 10,
    },
    alphabetPronunciation: {
      fontSize: 16,
      color: '#7f8c8d',
      marginBottom: 5,
    },
    exampleText: {
      fontSize: 16,
      color: '#7f8c8d',
      marginBottom: 10,
    },
    signText: {
      fontSize: 14,
      color: '#7f8c8d',
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 5,
    },
    phraseLetter: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 10,
    },
    phraseMeaning: {
      fontSize: 16,
      color: '#7f8c8d',
      marginBottom: 5,
    },
    usageText: {
      fontSize: 16,
      color: '#7f8c8d',
      marginBottom: 10,
    },
    numberDigit: {
      fontSize: 50,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 10,
    },
    numberSinhala: {
      fontSize: 22,
      color: '#2c3e50',
      marginBottom: 5,
    },
    numberPronunciation: {
      fontSize: 16,
      color: '#7f8c8d',
      marginBottom: 10,
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 10,
    },
    navButton: {
      backgroundColor: '#4a6fa5',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    disabledButton: {
      backgroundColor: '#b0bec5',
    },
    navButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    successCharacterContainer: {
      alignItems: 'center',
      marginBottom: 20,
      width: '60%',
    },
    successCharacterVideo: {
      width: '100%',
      height: 150,
      borderRadius: 10,
    },
    successTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 15,
    },
    successMessage: {
      fontSize: 18,
      color: '#7f8c8d',
      textAlign: 'center',
    },




    
    
  });
  // Styles for ProgressBar component
const progressStyles = StyleSheet.create({
  container: {
    width: width * 0.9,
    alignItems: 'center',
    marginBottom: 10
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a8fe7',
    borderRadius: 5
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  },
  container: {
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },




















  
});



// Styles for the AI Character
const aiStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    width: 150,
  },
  character: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    margin: 5,
  },
  mouth: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginTop: 5,
  },
  body: {
    width: 40,
    height: 30,
    backgroundColor: '#4FC3F7',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  armsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 60,
  },
  arm: {
    width: 40,
    height: 8,
    backgroundColor: '#4FC3F7',
    borderRadius: 4,
    marginHorizontal: 15,
  },
  speechBubble: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    maxWidth: 200,
  },
  speechText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
});