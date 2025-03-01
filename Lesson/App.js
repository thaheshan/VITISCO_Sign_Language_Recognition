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
          navigation.navigate('GamePreparation');
        }}
      >
        <Text style={styles.nextButtonText}>SAVE & CONTINUE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// NEW SCREEN: Game Preparation Screen - Added for better gamification
const GamePreparationScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Simulating preparation process
    setTimeout(() => {
      setIsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }).start();
    }, 2500);
    
    // Spinning animation for the gear icon
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, []);
  
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.gamePreparationTitle}>
        {isLoading ? "Preparing Your Learning Adventure" : "Learning Adventure Ready!"}
      </Text>
      
      {isLoading ? (
        <View style={styles.preparationLoading}>
          <Animated.Text style={[styles.gearIcon, { transform: [{ rotate: spin }] }]}>
            ⚙️
          </Animated.Text>
          <Text style={styles.preparationText}>
            Building your customized path...
          </Text>
          <View style={styles.preparationSteps}>
            <Text style={styles.preparationStep}>✓ Analyzing preferences</Text>
            <Text style={styles.preparationStep}>✓ Selecting lessons</Text>
            <Text style={styles.preparationStep}>⋯ Preparing games</Text>
            <Text style={styles.preparationStep}>⋯ Finalizing pathway</Text>
          </View>
        </View>
      ) : (
        <Animated.View style={[styles.gameReadyContainer, { opacity: fadeAnim }]}>
          <Image
            source={require('./assets/favicon.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
          <Text style={styles.gameReadyText}>
            Your customized learning adventure is ready! 
            Exciting challenges await on your journey to language mastery.
          </Text>
          
          <TouchableOpacity 
            style={styles.adventureButton}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.navigate('DailyRewards');
            }}
          >
            <Text style={styles.nextButtonText}>START ADVENTURE</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

// NEW SCREEN: Daily Rewards Screen - Enhances gamification
const DailyRewardsScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [showReward, setShowReward] = useState(false);
  
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.elastic(1)
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.linear
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.linear
        })
      ])
    ).start();
  }, []);
  
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg']
  });
  
  const handleClaimReward = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowReward(true);
    
    // Navigate after a delay to show the reward animation
    setTimeout(() => {
      navigation.navigate('ReadyCountdown');
    }, 2500);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.dailyRewardTitle}>Daily Reward!</Text>
      
      {!showReward ? (
        <>
          <Animated.View 
            style={[
              styles.rewardChest, 
              { 
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotation }
                ] 
              }
            ]}
          >
            <Text style={styles.chestIcon}>🎁</Text>
          </Animated.View>
          
          <Text style={styles.dailyRewardText}>
            You've got a surprise reward waiting for you!
            Claim it to boost your learning journey.
          </Text>
          
          <TouchableOpacity 
            style={styles.claimButton}
            onPress={handleClaimReward}
          >
            <Text style={styles.nextButtonText}>CLAIM REWARD</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.rewardRevealContainer}>
          <Confetti show={true} />
          <Text style={styles.rewardRevealText}>You've earned:</Text>
          <Text style={styles.rewardItem}>🏆 50 XP Points</Text>
          <Text style={styles.rewardItem}>⭐ New Avatar Accessory</Text>
          <Text style={styles.rewardItem}>🔓 Bonus Lesson Unlocked</Text>
        </View>
      )}
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
          navigation.navigate('LessonIntro');
        }}
      >
        <Text style={styles.nextButtonText}>START</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// NEW SCREEN: Lesson Introduction
const LessonIntroScreen = ({ navigation }) => {
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
      <Text style={styles.levelIndicator}>BASIC LEVEL (LEVEL 4)</Text>
      
      <Animated.View 
        style={[
          styles.lessonIntroContainer,
          {
            opacity: fadeInAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <Text style={styles.lessonIntroTitle}>Today's Lesson Plan</Text>
        
        <View style={styles.lessonInfoCard}>
          <View style={styles.lessonInfoHeader}>
            <Text style={styles.lessonInfoTitle}>Sinhala Basics</Text>
            <Text style={styles.lessonInfoDuration}>Duration: 15 min</Text>
          </View>
          
          <View style={styles.lessonInfoContent}>
            <Text style={styles.lessonInfoDescription}>
              In today's lesson, we'll learn the basics of Sinhala alphabet
              and common greetings through sign language.
            </Text>
            
            <View style={styles.lessonTopics}>
              <Text style={styles.lessonTopicItem}>• Basic alphabet letters</Text>
              <Text style={styles.lessonTopicItem}>• Simple greetings</Text>
              <Text style={styles.lessonTopicItem}>• Common expressions</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.rewardsPreview}>
          <Text style={styles.rewardsTitle}>Completion Rewards:</Text>
          <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🏆</Text>
              <Text style={styles.rewardValue}>+75 XP</Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>⭐</Text>
              <Text style={styles.rewardValue}>Unlock Level 5</Text>
            </View>
          </View>
        </View>
      </Animated.View>
      
      <TouchableOpacity 
        style={styles.startLessonButton}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.navigate('WelcomeLessons');
        }}
      >
        <Text style={styles.nextButtonText}>BEGIN LESSON</Text>
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
          // CORRECTED: Changed navigation target to 'LearningPathway'
          navigation.navigate('LearningPathway');
        }}
      >
        <Text style={styles.nextButtonText}>CONTINUE</Text>

      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Enhanced Learning Pathway Screen with gamified elements
const LearningPathwayScreen = ({ navigation, route }) => {
  const [unlockedLevel, setUnlockedLevel] = useState(route.params?.initialLevel || 5);
  const [currentPosition, setCurrentPosition] = useState(0);
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const nodeAnimations = useRef(Array(12).fill().map(() => new Animated.Value(0))).current;
  const milestoneAnim = useRef(new Animated.Value(0)).current;
  const pathwayScale = useRef(new Animated.Value(1)).current;

  // 3D Perspective Animation
  const perspective = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    
    // Animate pathway entrance
    Animated.parallel([
      Animated.spring(pathwayScale, {
        toValue: 1,
        speed: 10,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.timing(perspective, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      
    ]).start();
  }, []);
  



  const getNodePosition = (index, totalNodes) => {
    const containerWidth = width - 80;
    const containerHeight = height - 200;
    const progress = index / (totalNodes - 1);
    
    // Enhanced S-curve with 3D effect
    const angle = progress * Math.PI * 2;
    const x = 40 + (containerWidth * 0.4) * Math.sin(angle);
    const y = 100 + containerHeight * (0.5 + 0.4 * Math.cos(angle));
    
    return { x, y };
  };

  const handleNodePress = (nodeIndex) => {
    if (nodeIndex <= unlockedLevel) {
      Animated.sequence([
        Animated.timing(milestoneAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(avatarAnim, {
          toValue: nodeIndex,
          speed: 12,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.navigate('AlphabetLearning', { level: nodeIndex + 1 });
      });
    }
  };

  const moveToNextNode = () => {
    if (currentPosition < unlockedLevel) {
      Animated.spring(avatarAnim, {
        toValue: currentPosition + 1,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPosition(prev => prev + 1);
      });
    }
  };

  const renderMilestoneFlags = (index) => {
    if ((index + 1) % 4 === 0) { // Every 4 nodes is a milestone
      return (
        <Animated.View 
          style={[
            styles.milestoneFlag,
            {
              opacity: milestoneAnim,
              transform: [
                { translateY: milestoneAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}
              ]
            }
          ]}
        >
          <Text style={styles.milestoneText}>Milestone {(index + 1)/4}</Text>
          <Image
            source={require('./assets/favicon.png')}
            style={styles.flagIcon}
          />
        </Animated.View>
      );
    }
    return null;
  };

  const renderPathConnectors = () => {
    const connectors = [];
    for (let i = 0; i < 11; i++) {
      const start = getNodePosition(i, 12);
      const end = getNodePosition(i + 1, 12);
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
              transform: [
                { 
                  rotate: perspective.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${i % 2 === 0 ? 5 : -5}deg`]
                  })
                },
                { 
                  translateX: perspective.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, i * 2]
                  })
                }
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
      <Animated.View 
        style={[
          styles.pathwayHeader,
          {
            transform: [
              { scale: pathwayScale },
              { perspective: 1000 },
            ]
          }
        ]}
      >
        <Text style={styles.levelIndicator}>LEARNING PATHWAY</Text>
        <Text style={styles.pathwaySubtitle}>Complete lessons to unlock new worlds!</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.pathwayContainer,
          {
            transform: [
              { perspective: 1000 },
              {
                rotateY: perspective.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '5deg']
                })
              },
              {
                rotateX: perspective.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '3deg']
                })
              }
            ]
          }
        ]}
      >
        {renderPathConnectors()}
        
        {Array(12).fill().map((_, index) => {
          const { x, y } = getNodePosition(index, 12);
          const isLocked = index > unlockedLevel;
          const isCurrent = index === currentPosition;
          
          return (
            <Animated.View 
              key={index}
              style={[
                styles.pathwayNode,
                {
                  left: x,
                  top: y,
                  zIndex: index,
                  transform: [
                    { 
                      translateY: nodeAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    },
                    {
                      rotateZ: nodeAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-15deg', '0deg']
                      })
                    }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.nodeButton,
                  isCurrent && styles.currentNode,
                  isLocked && styles.lockedNode
                ]}
                onPress={() => handleNodePress(index)}
              >
                {renderMilestoneFlags(index)}
                {isCurrent && (
                  <Animated.Image
                    source={require('./assets/image 01.png')}
                    style={[
                      styles.avatarIcon,
                      {
                        transform: [
                          { 
                            translateX: avatarAnim.interpolate({
                              inputRange: [0, 12],
                              outputRange: [40, width - 100]
                            })
                          }
                        ]
                      }
                    ]}
                  />
                )}
                <Text style={styles.nodeNumber}>{index + 1}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.View>

      <TouchableOpacity 
        style={styles.continueButton}
        onPress={moveToNextNode}
      >
        <Text style={styles.nextButtonText}>CONTINUE JOURNEY</Text>
        <LottieView
          source={require('./assets/image 01.png')}
          autoPlay
          loop
          style={styles.buttonParticles}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Alphabet Learning Screen with interactive elements
const AlphabetLearningScreen = ({ route , navigation }) => {
  const { level } = route.params || { level: 1 };
  const [currentCard, setCurrentCard] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const cardAnim = useRef(new Animated.Value(0)).current;
  
  const alphabetCards = [
    { letter: 'අ', pronunciation: 'a', example: 'apple', sign: require('./assets/adaptive-icon.png') },
    { letter: 'ආ', pronunciation: 'aa', example: 'art', sign: require('./assets/adaptive-icon.png') },
    { letter: 'ඇ', pronunciation: 'ae', example: 'ant', sign: require('./assets/adaptive-icon.png') },
    { letter: 'ඈ', pronunciation: 'aae', example: 'ask', sign: require('./assets/adaptive-icon.png') },
    { letter: 'ඉ', pronunciation: 'i', example: 'if', sign: require('./assets/adaptive-icon.png') },
  ];
  
  useEffect(() => {
    // Card flip animation
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentCard]);
  
  const nextCard = () => {
    if (currentCard < alphabetCards.length - 1) {
      // Reset animation value
      cardAnim.setValue(0);
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Move to next card
      setCurrentCard(currentCard + 1);
    } else {
      // Completed all cards
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      
      // Navigate after showing success animation
      setTimeout(() => {
        navigation.navigate('LessonComplete');
      }, 2000);
    }
  };
  
  const prevCard = () => {
    if (currentCard > 0) {
      // Reset animation value
      cardAnim.setValue(0);
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Move to previous card
      setCurrentCard(currentCard - 1);
    }
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
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.levelIndicator}>ALPHABET LEARNING</Text>
      
      <ProgressBar current={currentCard + 1} total={alphabetCards.length} />
      
      {!showSuccess ? (
        <>
          <Animated.View 
            style={[
              styles.alphabetCard,
              {
                opacity: cardOpacity,
                transform: [{ scale: cardScale }]
              }
            ]}
          >
            <Text style={styles.alphabetLetter}>{alphabetCards[currentCard].letter}</Text>
            <Text style={styles.alphabetPronunciation}>
              Pronounced as: "{alphabetCards[currentCard].pronunciation}"
            </Text>
            
            <Image
              source={alphabetCards[currentCard].sign}
              style={styles.signImage}
              resizeMode="contain"
            />
            
            <Text style={styles.exampleText}>
              Example: {alphabetCards[currentCard].example}
            </Text>
          </Animated.View>
          
          <View style={styles.navigationButtons}>
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
                {currentCard < alphabetCards.length - 1 ? 'Next' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.successContainer}>
          <Confetti show={true} />
          <Text style={styles.successTitle}>Great Job!</Text>
          <Text style={styles.successMessage}>
            You've learned the basic Sinhala alphabet letters!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};


// Lesson Complete Screen with rewards
const LessonCompleteScreen = ({ navigation }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.2)).current;
  
  useEffect(() => {
    // Show confetti with delay
    setTimeout(() => setShowConfetti(true), 500);
    
    // Trophy animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <Confetti show={showConfetti} />
      
      <Text style={styles.lessonCompleteTitle}>LESSON COMPLETE!</Text>
      
      <Animated.View 
        style={[
          styles.trophyContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={styles.trophyIcon}>🏆</Text>
      </Animated.View>
      
      <View style={styles.rewardsContainer}>
        <Text style={styles.rewardsTitle}>Rewards Earned:</Text>
        <View style={styles.rewardsList}>
          <Text style={styles.rewardItem}>🌟 +75 XP Points</Text>
          <Text style={styles.rewardItem}>🏅 Basic Alphabet Badge</Text>
          <Text style={styles.rewardItem}>🔓 Unlocked Level 8</Text>
        </View>
      </View>

      
      
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.navigate('LearningPathway');
        }}
      >
        <Text style={styles.nextButtonText}>CONTINUE</Text>

      </TouchableOpacity>
    </SafeAreaView>

    
  );
};



const { width, height } = Dimensions.get('window');
const Stack = createStackNavigator();

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Customization" component={CustomizationScreen} />
        <Stack.Screen name="LearningPathwayCustomization" component={LearningPathwayCustomizationScreen} />
        <Stack.Screen name="GamePreparation" component={GamePreparationScreen} />
        <Stack.Screen name="DailyRewards" component={DailyRewardsScreen} />
        <Stack.Screen name="ReadyCountdown" component={ReadyCountdownScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="LessonIntro" component={LessonIntroScreen} />
        <Stack.Screen name="WelcomeLessons" component={WelcomeLessonsScreen} />
        <Stack.Screen name="LearningPathway" component={LearningPathwayScreen} />
        <Stack.Screen name="AlphabetLearning" component={AlphabetLearningScreen} />
        <Stack.Screen name="LessonComplete" component={LessonCompleteScreen} />
         {/* <Stack.Screen name="QuizScreen"Screen={QuizScreen} />
        < Stack.Screen name="QuizResults" Screen={QuizResultsScreen} /> */}

    </Stack.Navigator>

    </NavigationContainer>
  );
}

// Styles
// Styles
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
  dotLine: {
    width: width * 0.7,
    height: 2,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#383773',
    marginTop: 12,
  },
});
