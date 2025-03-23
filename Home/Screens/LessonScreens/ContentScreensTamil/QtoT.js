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

export default function AlphabetLessonScreen({ navigate , ...props}) {


  const { lessonId = 1, lessonType = 'alphabet', onComplete } = props || {};
  const [currentCard, setCurrentCard] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [characterState, setCharacterState] = useState('intro');
  const [isIdle, setIsIdle] = useState(false);
  const [characterVisible, setCharacterVisible] = useState(true); // Initialize as true
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
        title: "Basic Alphabet (A-D)",
        cards: [
          { 
            letter: 'A', 
            pronunciation: 'a', 
            example: 'apple', 
            sign: require('../../../assets/videos/Thahee.mp4'), 
            signText: 'Hand forms letter A shape',
            characterVideo: require('../../../assets/videos/Scene - Jackie.mp4')
          },
          { 
            letter: 'B', 
            pronunciation: 'ae', 
            example: 'ant', 
            sign: require('../../../assets/videos/Thahee.mp4'), 
            signText: 'Open palm moving rightward',
            characterVideo: require('../../../assets/videos/Scene - Jackie.mp4')
          },
          { 
            letter: 'C', 
            pronunciation: 'aae', 
            example: 'ask', 
            sign: require('../../../assets/videos/Thahee.mp4'), 
            signText: 'Extended palm with circular motion',
            characterVideo: require('../../../assets/videos/Scene - Jackie.mp4')
          },
          { 
            letter: 'D', 
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
      // Make sure we have cards and current card is valid
      if (cards && cards[currentCard]) {
        return cards[currentCard].characterVideo;
      }
      // Fallback to a default video if something is wrong
      return defaultCharacterVideos.waiting;
    }
  };
  
  // Generate speech text based on character state and current card
  const getSpeechText = () => {
    // Make sure cards and currentCard are valid
    const currentCardData = cards && currentCard < cards.length ? cards[currentCard] : null;
    
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
    } else if (currentCardData) {
      // For explaining state - customize based on card content
      if (currentCardData.letter) {
        return `Now watch carefully how to sign the letter "${currentCardData.letter}" in sign language. Try to follow along!`;
      } else if (currentCardData.phrase) {
        return `Let me show you how to sign "${currentCardData.phrase}". This is commonly used when ${currentCardData.usage?.toLowerCase() || 'communicating'}.`;
      } else if (currentCardData.number) {
        return `Here's how to sign the number ${currentCardData.number}. Notice the finger positions and movements.`;
      } else {
        return "Watch the video carefully and try to mimic the signs.";
      }
    } else {
      return "Let's learn sign language together!";
    }
  };
  
  // Get the current lesson based on the lessonType and lessonId
  const currentLessonType = lessonContent[lessonType] || lessonContent.alphabet;
  const currentLesson = currentLessonType[lessonId] || currentLessonType[1];
  const cards = currentLesson?.cards || [];
  
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
      
      // We removed the auto-navigation timer here to use the buttons instead
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
  
  // Restart the lesson from the beginning
  const restartLesson = () => {
    // Reset state
    setCurrentCard(0);
    setShowSuccess(false);
    setCharacterState('intro');
    cardAnim.setValue(0);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Reset character state
    setTimeout(() => {
      setCharacterState('explaining');
    }, 2000);
  };
  
  const navigateNext = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Navigate using the passed navigate prop
    if (onComplete) {
      onComplete();
    } else {
      // Default navigation
      navigate('LearningPathway');  // or whichever screen is appropriate
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
    if (!card) return null;
    
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
            {cards[currentCard] && renderCardContent(cards[currentCard])}
            
            {/* Horizontal video container */}
            <View style={styles.horizontalVideoContainer}>
              {/* Lesson video */}
              <View style={[
                styles.videoWrapper, 
                { width: characterVisible ? '50%' : '100%' }
              ]}>
                {cards[currentCard] && cards[currentCard].sign && (
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
                )}
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
        {!showSuccess ? (
          // Normal lesson navigation buttons
          <>
            <TouchableOpacity
              style={[styles.navButton, currentCard === 0 && styles.disabledButton]}
              onPress={prevCard}
              disabled={currentCard === 0}
            >
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={nextCard}
            >
              <Text style={styles.navButtonText}>
                {currentCard < cards.length - 1 ? 'Next' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // Success screen navigation buttons
          <>
            <TouchableOpacity
              style={styles.navButton}
              onPress={restartLesson}
            >
              <Text style={styles.navButtonText}>Start Over</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={navigateNext}
            >
              <Text style={styles.navButtonText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// Improved styles for the character component
// Define your styles here
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
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
    color: '#333',
  },
  characterToggle: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleText: {
    fontSize: 14,
    color: '#555',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lessonCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  alphabetLetter: {
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  alphabetPronunciation: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  exampleText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  signText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  horizontalVideoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  videoWrapper: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
  },
  signVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  videoLabel: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  characterWrapper: {
    width: '45%',
    aspectRatio: 0.75,
    position: 'relative',
  },
  characterVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  speechBubble: {
    position: 'absolute',
    top: -60,
    left: -30,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 10,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 1,
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: -10,
    left: 30,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  speechText: {
    fontSize: 12,
    color: '#333',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#4285F4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 20,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
  },
  successCharacterContainer: {
    width: 150,
    height: 150,
    marginBottom: 20,
    position: 'relative',
  },
  successCharacterVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  // Add any missing styles for other components here
  phraseLetter: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  phraseMeaning: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  usageText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  numberDigit: {
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  numberSinhala: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  numberPronunciation: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  }
});

const progressStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});