import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Image, 
  SafeAreaView, 
  Animated, 
  Easing 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';

// Progress Bar Component with animation
const ProgressBar = ({ current, total }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progress = (current / total) * 100;
  
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.elastic(1),
      useNativeDriver: false
    }).start();
  }, [current]);

  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <Animated.View style={[styles.progressFill, { width }]} />
      </View>
      <Text style={styles.progressText}>{current}/{total}</Text>
    </View>
  );
};

// Confetti Animation Component
const Confetti = ({ show }) => {
  const confettiRef = useRef(null);
  
  useEffect(() => {
    if (show && confettiRef.current) {
      confettiRef.current.play();
    }
  }, [show]);
  
  if (!show) return null;
  
  return (
    <View style={styles.confettiContainer}>
      <LottieView
        ref={confettiRef}
        source={require('./assets/image 01.png')}
        style={styles.confetti}
        autoPlay
        loop={false}
      />
    </View>
  );
};

// Welcome Screen with animated text
const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text style={[styles.welcomeTitle, { opacity: fadeAnim }]}>
        WELCOME TO THE BASIC LEVEL OF LESSONS FOR SINHALA FROM ENGLISH THROUGH SIGN LANGUAGE SYSTEM.
      </Animated.Text>
      
      <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity 
          style={styles.beginButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Loading');
          }}
        >
          <Text style={styles.nextButtonText}>BEGIN</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

// Loading Screen with animated loader
const LoadingScreen = ({ navigation }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    // Progress animation
    Animated.timing(loadingProgress, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start();
    
    // Update progress text
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => navigation.navigate('Customization'), 500);
          return 100;
        }
        return newProgress;
      });
    }, 150);
    
    return () => clearInterval(interval);
  }, []);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContent}>
        <Animated.Image
          source={require('./assets/favicon.png')}
          style={[styles.characterImage, { transform: [{ rotate: spin }] }]}
          resizeMode="contain"
        />
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>
        <Text style={styles.loadingText}>
          Hi User Name,{'\n'}
          Our Assistants Are Preparing{'\n'}
          a lesson plan for your learning
        </Text>
        
        <View style={styles.loadingBarContainer}>
          <Animated.View 
            style={[
              styles.loadingBar, 
              { width: loadingProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              })}
            ]} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Customization Screen with choice animation
const CustomizationScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text 
        style={[
          styles.customizeTitle, 
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        Do You Want To Customize Your Learning Pathway?
      </Animated.Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.optionButton, styles.yesButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('LearningPathwayCustomization');
          }}
        >
          <Text style={styles.optionButtonText}>YES</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.optionButton, styles.noButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('ReadyCountdown');
          }}
        >
          <Text style={styles.optionButtonText}>NO</Text>
        </TouchableOpacity>
      </View>
      
      <Image
        source={require('./assets/splash-icon.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// New Component: Learning Pathway Customization
const LearningPathwayCustomizationScreen = ({ navigation }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [level, setLevel] = useState('Basic');
  
  const topics = [
    { id: 1, name: 'Alphabet', icon: '📝' },
    { id: 2, name: 'Numbers', icon: '🔢' },
    { id: 3, name: 'Greetings', icon: '👋' },
    { id: 4, name: 'Family', icon: '👪' },
    { id: 5, name: 'Food', icon: '🍎' },
    { id: 6, name: 'Animals', icon: '🐶' },
  ];
  
  const toggleTopic = (id) => {
    if (selectedTopics.includes(id)) {
      setSelectedTopics(selectedTopics.filter(topicId => topicId !== id));
    } else {
      setSelectedTopics([...selectedTopics, id]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.customizationHeader}>Customize Your Learning</Text>
      
      <View style={styles.levelSelector}>
        <Text style={styles.sectionTitle}>Select Your Level:</Text>
        <View style={styles.levelOptions}>
          {['Beginner', 'Basic', 'Intermediate', 'Advanced'].map((lvl) => (
            <TouchableOpacity 
              key={lvl}
              style={[
                styles.levelOption,
                level === lvl && styles.selectedLevel
              ]}
              onPress={() => {
                setLevel(lvl);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.levelOptionText,
                level === lvl && styles.selectedLevelText
              ]}>
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.topicsSection}>
        <Text style={styles.sectionTitle}>Select Topics:</Text>
        <View style={styles.topicsGrid}>
          {topics.map((topic) => (
            <TouchableOpacity 
              key={topic.id}
              style={[
                styles.topicItem,
                selectedTopics.includes(topic.id) && styles.selectedTopic
              ]}
              onPress={() => toggleTopic(topic.id)}
            >
              <Text style={styles.topicIcon}>{topic.icon}</Text>
              <Text style={[
                styles.topicName,
                selectedTopics.includes(topic.id) && styles.selectedTopicText
              ]}>
                {topic.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.continueButton,
          styles.customizationButton,
          selectedTopics.length === 0 && styles.disabledButton
        ]}
        disabled={selectedTopics.length === 0}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.navigate('ReadyCountdown');
        }}
      >
        <Text style={styles.nextButtonText}>SAVE & CONTINUE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Ready Countdown Screen with animated timer
const ReadyCountdownScreen = ({ navigation }) => {
  const [countdown, setCountdown] = useState(10);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => navigation.navigate('GetStarted'), 200);
          return 0;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.levelIndicator}>BASIC LEVEL (LEVEL 4)</Text>
      
      <View style={styles.countdownContainer}>
        <Text style={styles.countdownText}>BE READY IN</Text>
        <Animated.View 
          style={[
            styles.countdownCircle, 
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownUnit}>SECONDS</Text>
        </Animated.View>
      </View>
      
      <Image
        source={require('./assets/favicon.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// Get Started Screen with animated text
const GetStartedScreen = ({ navigation }) => {
  const textAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(textAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.levelIndicator}>BASIC LEVEL (LEVEL 4)</Text>
      
      <Animated.Text 
        style={[
          styles.getStartedTitle, 
          { 
            opacity: textAnim,
            transform: [
              { 
                translateY: textAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                }) 
              }
            ] 
          }
        ]}
      >
        LET'S{'\n'}GET STARTED
      </Animated.Text>
      
      <Image
        source={require('./assets/favicon.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.navigate('WelcomeLessons');
        }}
      >
        <Text style={styles.nextButtonText}>START</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Welcome to Lessons Screen with confetti
const WelcomeLessonsScreen = ({ navigation }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Show confetti after a brief delay
    setTimeout(() => setShowConfetti(true), 500);
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <Confetti show={showConfetti} />
      
      <Text style={styles.welcomeLessonsTitle}>WELCOME TO THE LESSONS!!!</Text>
      
      <Image
        source={require('./assets/image 01.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
      
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('LearningPathway');
        }}
      >
        <Text style={styles.nextButtonText}>CONTINUE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Enhanced Learning Pathway Screen with gamified elements
const LearningPathwayScreen = ({ navigation }) => {
  // Animation refs for path nodes
  const nodeAnimations = useRef(Array(12).fill().map(() => new Animated.Value(0))).current;
  const [unlockedLevel, setUnlockedLevel] = useState(5); // Levels 1-5 are unlocked
  
  useEffect(() => {
    // Animate nodes sequentially
    nodeAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
        easing: Easing.bounce,
      }).start();
    });
  }, []);
  
  const handleNodePress = (nodeIndex) => {
    if (nodeIndex <= unlockedLevel) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate('AlphabetLearning');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // Show locked level feedback (could add a visual indicator here)
    }
  };
  
  // Create a curved pathway for nodes
  const getNodePosition = (index, totalNodes) => {
    const containerWidth = width - 80;
    const containerHeight = height - 200;
    
    // Create an S-shaped path
    const progress = index / (totalNodes - 1);
    
    // Math to create S-curve
    let x, y;
    if (progress < 0.5) {
      // First half of S-curve
      const localProgress = progress * 2; // Normalize to 0-1 for first half
      x = 40 + (containerWidth * 0.4) * Math.sin(localProgress * Math.PI);
      y = 100 + containerHeight * localProgress;
    } else {
      // Second half of S-curve
      const localProgress = (progress - 0.5) * 2; // Normalize to 0-1 for second half
      x = 40 + containerWidth * 0.6 + (containerWidth * 0.4) * Math.sin(localProgress * Math.PI);
      y = 100 + containerHeight * (0.5 + localProgress * 0.5);
    }
    
    return { x, y };
  };
  
  // Generate connector lines between nodes
  const renderPathConnectors = () => {
    const connectors = [];
    
    for (let i = 0; i < 11; i++) {
      const start = getNodePosition(i, 12);
      const end = getNodePosition(i + 1, 12);
      
      // Calculate control points for curved lines
      const controlX = (start.x + end.x) / 2;
      const controlY1 = start.y + (end.y - start.y) * 0.25;
      const controlY2 = start.y + (end.y - start.y) * 0.75;
      
      connectors.push(
        <Animated.View 
          key={`connector-${i}`}
          style={[
            styles.pathConnector,
            {
              left: start.x + 25,
              top: start.y + 25,
              width: 2,
              height: end.y - start.y,
              opacity: nodeAnimations[i],
              transform: [
                { translateY: (end.y - start.y) / 2 },
                { scaleY: nodeAnimations[i] }
              ]
            }
          ]}
        />
      );
    }
    
    return connectors;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pathwayHeader}>
        <Text style={styles.levelIndicator}>LESSON (BASIC LEVEL)</Text>
        <Text style={styles.pathwaySubtitle}>Complete lessons to unlock new content!</Text>
      </View>
      
      <View style={styles.pathwayContainer}>
        {/* Path connectors */}
        {renderPathConnectors()}
        
        {/* Avatar starting position */}
        <View style={[styles.pathwayNode, { left: 40, top: 80 }]}>
          <Image
            source={require('./assets/image 01.png')}
            style={styles.avatarIcon}
            resizeMode="contain"
          />
        </View>
        
        {/* Learning pathway nodes */}
        {Array(12).fill().map((_, index) => {
          const { x, y } = getNodePosition(index, 12);
          const isLocked = index > unlockedLevel;
          const isGiftNode = index === 4;
          const isLargeNode = index === 5;
          
          return (
            <Animated.View 
              key={index}
              style={[
                index === 4 ? styles.giftNode : 
                index === 5 ? styles.largeNode : 
                styles.pathwayCircle,
                {
                  left: x,
                  top: y,
                  opacity: nodeAnimations[index],
                  transform: [{ scale: nodeAnimations[index] }]
                },
                isLocked && styles.lockedNode
              ]}
            >
              <TouchableOpacity
                style={styles.nodeButton}
                onPress={() => handleNodePress(index)}
              >
                {isGiftNode && (
                  <Image
                    source={require('./assets/splash-icon.png')}
                    style={styles.nodeIcon}
                    resizeMode="contain"
                  />

                )}
                
                {isLocked && (
                  <Text style={styles.lockIcon}>🔒</Text>
                )}
                
                {!isGiftNode && !isLocked && (
                  <Text style={styles.levelNumber}>{index + 1}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      
      <View style={styles.pathwayFooter}>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Show help modal or tooltip
          }}
        >
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Navigate to settings
          }}
        >
          <Text style={styles.settingsButtonIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Alphabet Learning Screen with animations
const AlphabetLearningScreen = ({ navigation }) => {
  const [currentLesson, setCurrentLesson] = useState(1);
  const totalLessons = 6;
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const letterAnim = useRef(new Animated.Value(0)).current;
  
  // Alphabet data
  const alphabetData = [
    { letter: 'A', image: require('./assets/splash-icon.png') },
    { letter: 'B', image: require('./assets/splash-icon.png') },
    { letter: 'C', image: require('./assets/splash-icon.png') },
    { letter: 'D', image: require('./assets/splash-icon.png') },
    { letter: 'E', image: require('./assets/splash-icon.png') },
    { letter: 'F', image: require('./assets/splash-icon.png') },
  ];
  
  useEffect(() => {
    // Animate letter appearance
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(letterAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentLesson]);
  
  const goToNextLesson = () => {
    // Reset animations
    fadeAnim.setValue(0);
    letterAnim.setValue(0);
    
    if (currentLesson < totalLessons) {
      setCurrentLesson(currentLesson + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      // Show success animation before navigating back
      setShowSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        navigation.navigate('LearningPathway');
      }, 2000);
    }
  };
  
  return (
    <View style={styles.container}>
      <Confetti show={showSuccess} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.basicText}>BASIC LEVEL</Text>
      </View>
      
      <Text style={styles.levelText}>LEVEL {currentLesson < 10 ? '0' + currentLesson : currentLesson}</Text>
      
      <ProgressBar current={currentLesson} total={totalLessons} />
      
      <Animated.View 
        style={[
          styles.letterContainer,
          { 
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.Text 
          style={[
            styles.letterText,
            {
              transform: [
                { scale: letterAnim },
                { 
                  translateY: letterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }
              ]
            }
          ]}
        >
          {alphabetData[currentLesson-1].letter}
        </Animated.Text>
        
        <Animated.Image
          source={alphabetData[currentLesson-1].image}
          style={[
            styles.letterImage,
            { 
              opacity: fadeAnim,
              transform: [
                { 
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0]
                  })
                }
              ]
            }
          ]}
          resizeMode="contain" 
        />
      </Animated.View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.practiceButton}
          onPress={() => {
            // Navigate to practice screen
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Text style={styles.practiceButtonText}>PRACTICE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={goToNextLesson}
        >
          <Text style={styles.nextButtonText}>
            {currentLesson < totalLessons ? 'NEXT' : 'COMPLETE'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Create the stack navigator
const Stack = createStackNavigator();

// Main App component with navigation
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          // Add transition animation
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Customization" component={CustomizationScreen} />
        <Stack.Screen name="LearningPathwayCustomization" component={LearningPathwayCustomizationScreen} />
        <Stack.Screen name="ReadyCountdown" component={ReadyCountdownScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="WelcomeLessons" component={WelcomeLessonsScreen} />
        <Stack.Screen name="LearningPathway" component={LearningPathwayScreen} />
        <Stack.Screen name="AlphabetLearning" component={AlphabetLearningScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Enhanced styles with more gamified elements
const { width, height } = Dimensions.get('window');



const styles = StyleSheet.create({
  
    container: {
      flex: 1,
      backgroundColor: '#c5c6e8',
      padding: 20,
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
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 50,
  },
  beginButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
    alignSelf: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 20,
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#5d5b8d',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#383773',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#383773',
    marginVertical: 10,
  },
  dotLine: {
    width: width * 0.7,
    height: 2,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#383773',
    marginTop: 10,
  },
  customizeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  levelIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 40,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 40,
  },
  countdownText: {
    fontSize: 28,
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
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
  },
  countdownUnit: {
    fontSize: 10,
    color: '#383773',
  },
  getStartedTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginTop: 40,
  },
  startButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
    alignSelf: 'center',
  },
  welcomeLessonsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginTop: 60,
  },
  continueButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
    alignSelf: 'center',
  },
  pathwayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
  },
  pathwayNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 40,
  },
  pathwayCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a86e8',
    margin: 10,
    position: 'absolute',
  },
  giftNode: {
    backgroundColor: '#4a86e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeNode: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarIcon: {
    width: 30,
    height: 30,
  },
  nodeIcon: {
    width: 24,
    height: 24,
  },
});

export default App;