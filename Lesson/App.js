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
  Easing,
  ScrollView
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import { BlurView } from 'expo-blur';

import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';




// Progress Bar Component with animation
function ProgressBar({ current, total }) {
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
}

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
          Hi Thaheshan,{'\n'}
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
  const [viewMode, setViewMode] = useState('top'); // 'top' or 'side'
  const [showPathDetails, setShowPathDetails] = useState(true);
  
  // Animated values
  const scrollX = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const viewTransition = useRef(new Animated.Value(0)).current;
  const nodeAnimations = useRef(Array(12).fill().map(() => new Animated.Value(0))).current;
  const pathRevealAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);

  // Map terrain elements
  const cloudAnimations = useRef(Array(5).fill().map(() => ({
    position: new Animated.Value(Math.random() * width),
    opacity: new Animated.Value(Math.random() * 0.5 + 0.2),
  }))).current;
  
  // Map coordinate calculations
  const totalPathLength = width * 2;
  const nodeSpacing = totalPathLength / 12;
  
  // Get node position based on view mode
  const getNodePosition = (index, mode) => {
    // Base positions (same in both views)
    const baseX = nodeSpacing * index;
    
    if (mode === 'top') {
      // For top view, nodes follow a winding path
      const yOffset = Math.sin(index * 0.8) * 60;
      return {
        x: baseX,
        y: height * 0.3 + yOffset,
        elevation: 0,
        rotateX: '0deg'
      };
    } else {
      // For side view, create elevation profile like a mountain journey
      const elevationProfile = [0, 20, 40, 30, 60, 80, 70, 90, 100, 80, 60, 40];
      return {
        x: baseX,
        y: height * 0.4,
        elevation: elevationProfile[index],
        rotateX: '-60deg'
      };
    }
  };

  // Calculate the path between nodes
  const getPathPoints = () => {
    const points = Array(12).fill().map((_, i) => {
      const { x, y } = getNodePosition(i, viewMode);
      return { x, y };
    });
    
    // Create SVG path from points
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Add bezier curve control points for natural path flow
      const prevPoint = points[i-1];
      const currPoint = points[i];
      const cpX1 = prevPoint.x + (currPoint.x - prevPoint.x) * 0.5;
      pathD += ` C ${cpX1},${prevPoint.y} ${cpX1},${currPoint.y} ${currPoint.x},${currPoint.y}`;
    }
    return pathD;
  };

  // Initialize animations
  useEffect(() => {
    // Animate all nodes appearing with staggered delay
    Animated.stagger(120, 
      nodeAnimations.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true
        })
      )
    ).start();
    
    // Animate clouds floating
    cloudAnimations.forEach((cloud, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cloud.position, {
            toValue: -100 + Math.random() * width * 1.5,
            duration: 15000 + Math.random() * 10000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(cloud.position, {
            toValue: Math.random() * width,
            duration: 15000 + Math.random() * 10000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
      
      // Also animate cloud opacity
      Animated.loop(
        Animated.sequence([
          Animated.timing(cloud.opacity, {
            toValue: Math.random() * 0.3 + 0.5,
            duration: 4000 + Math.random() * 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(cloud.opacity, {
            toValue: Math.random() * 0.3 + 0.1,
            duration: 4000 + Math.random() * 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
    });
  }, []);

  // Handle scroll events to update UI elements
  useEffect(() => {
    scrollX.addListener(({ value }) => {
      // Check if user has scrolled to end to hide path details
      if (value > totalPathLength - width) {
        Animated.timing(pathRevealAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        }).start(() => setShowPathDetails(false));
      } else if (!showPathDetails) {
        setShowPathDetails(true);
        Animated.timing(pathRevealAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start();
      }
    });
    
    return () => {
      scrollX.removeAllListeners();
    };
  }, [showPathDetails]);

  // Handle node press - travel to node and navigate to lesson
  const handleNodePress = (nodeIndex) => {
    if (nodeIndex <= unlockedLevel) {
      // Scroll to node position
      scrollViewRef.current?.scrollTo({
        x: nodeIndex * nodeSpacing - width / 4,
        animated: true
      });
      
      // Animate avatar to node position
      Animated.spring(avatarAnim, {
        toValue: nodeIndex,
        tension: 30,
        friction: 7,
        useNativeDriver: true
      }).start(() => {
        // Show node completion animation
        setCurrentPosition(nodeIndex);
        
        // Navigate to lesson after short delay
        setTimeout(() => {
          navigation.navigate('AlphabetLearning', { level: nodeIndex + 1 });
        }, 500);
      });
    } else {
      // Shake animation for locked node
      Animated.sequence([
        Animated.timing(nodeAnimations[nodeIndex], {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(nodeAnimations[nodeIndex], {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(nodeAnimations[nodeIndex], {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.spring(nodeAnimations[nodeIndex], {
          toValue: 1,
          friction: 5,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  // Toggle between top and side view
  const toggleViewMode = () => {
    const newMode = viewMode === 'top' ? 'side' : 'top';
    
    // Animate view transition
    Animated.timing(viewTransition, {
      toValue: newMode === 'top' ? 0 : 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.cubic)
    }).start(() => {
      setViewMode(newMode);
    });
  };

  // Create a custom cloud component (no BlurView dependency)
  const CustomCloud = ({ style, intensity = 0.7 }) => (
    <View style={[learningPathwayStyles.pathwayCustomCloud, style]}>
      <View style={[learningPathwayStyles.pathwayCloudPuff, { left: 10, top: 5 }]} />
      <View style={[learningPathwayStyles.pathwayCloudPuff, { left: 5, top: 10 }]} />
      <View style={[learningPathwayStyles.pathwayCloudPuff, { left: 15, top: 8 }]} />
      <View style={[learningPathwayStyles.pathwayCloudPuff, { left: 25, top: 4 }]} />
      <View style={[learningPathwayStyles.pathwayCloudPuff, { left: 35, top: 9 }]} />
      <View style={[learningPathwayStyles.pathwayCloudPuff, { left: 45, top: 6 }]} />
      <View style={[learningPathwayStyles.pathwayCloudBase, { opacity: intensity }]} />
    </View>
  );

  // Render decorative terrain elements
  const renderTerrainElements = () => {
    return (
      <>
        {/* Render clouds */}
        {cloudAnimations.map((cloud, index) => (
          <Animated.View 
            key={`cloud-${index}`}
            style={[
              {
                position: 'absolute',
                transform: [{ translateX: cloud.position }],
                opacity: cloud.opacity,
                top: 50 + (index * 30),
                width: 80 + (index % 3) * 40,
                height: 50 + (index % 2) * 20,
              }
            ]}
          >
            <CustomCloud 
              style={{ 
                width: 80 + (index % 3) * 40, 
                height: 50 + (index % 2) * 20 
              }} 
              intensity={0.7 + (index % 3) * 0.1}
            />
          </Animated.View>
        ))}

        {/* Terrain details based on view mode */}
        {viewMode === 'side' && (
          <View style={learningPathwayStyles.pathwayTerrainBase}>
            <View style={learningPathwayStyles.pathwayTerrainGradient} />
          </View>
        )}
      </>
    );
  };

  // Render the path nodes and connecting line
  const renderPathway = () => {
    return (
      <Animated.View style={[
        learningPathwayStyles.pathwayMapContainer,
        {
          opacity: pathRevealAnim,
          transform: [
            { 
              rotateX: viewTransition.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-60deg']
              })
            },
            { 
              scale: viewTransition.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.7]
              })
            },
            { 
              translateY: viewTransition.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -50]
              })
            }
          ]
        }
      ]}>
        {/* Path SVG */}
        <Svg height="100%" width={totalPathLength} style={learningPathwayStyles.pathwaySvg}>
          <Path
            d={getPathPoints()}
            stroke="#5d5b8d"
            strokeWidth="4"
            fill="none"
            strokeDasharray="6,3"
          />
          
          {/* Progress indicator on the path */}
          <Path
            d={getPathPoints()}
            stroke="#383773"
            strokeWidth="6"
            fill="none"
            strokeDasharray={[totalPathLength, totalPathLength]}
            strokeDashoffset={avatarAnim.interpolate({
              inputRange: [0, 11],
              outputRange: [totalPathLength, 0]
            })}
          />
        </Svg>
        
        {/* Render all nodes */}
        {Array(12).fill().map((_, index) => {
          const { x, y, elevation } = getNodePosition(index, viewMode);
          const isLocked = index > unlockedLevel;
          const isCompleted = index < currentPosition;
          const isCurrent = index === currentPosition;
          
          // Different node designs based on state
          const nodeSize = isCurrent ? 50 : 40;
          
          // Determine node colors based on state
          const nodeColor = isLocked ? '#c5c6e8' : 
                           isCompleted ? '#8e8cc0' : 
                           isCurrent ? '#383773' : '#5d5b8d';
          
          return (
            <Animated.View
              key={`node-${index}`}
              style={[
                learningPathwayStyles.pathwayNodeContainer,
                {
                  left: x - nodeSize/2,
                  top: y - nodeSize/2 - (viewMode === 'side' ? elevation : 0),
                  width: nodeSize,
                  height: nodeSize,
                  opacity: nodeAnimations[index],
                  transform: [
                    { scale: nodeAnimations[index] },
                    { 
                      translateY: viewMode === 'side' ? 
                        viewTransition.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -elevation]
                        }) : 0
                    }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  learningPathwayStyles.pathwayNodeButton,
                  { 
                    width: nodeSize, 
                    height: nodeSize,
                    backgroundColor: nodeColor,
                  },
                  isCurrent && learningPathwayStyles.pathwayCurrentNode,
                  isCompleted && learningPathwayStyles.pathwayCompletedNode,
                  isLocked && learningPathwayStyles.pathwayLockedNode,
                ]}
                onPress={() => handleNodePress(index)}
                disabled={isLocked}
              >
                {isCompleted ? (
                  <Text style={learningPathwayStyles.pathwayNodeIcon}>✓</Text>
                ) : isLocked ? (
                  <Text style={learningPathwayStyles.pathwayNodeIcon}>🔒</Text>
                ) : (
                  <Text style={learningPathwayStyles.pathwayNodeNumber}>{index + 1}</Text>
                )}
                
                {/* Small terrain indicator for side view */}
                {viewMode === 'side' && (
                  <View style={[
                    learningPathwayStyles.pathwayElevationIndicator,
                    { 
                      height: elevation / 2,
                      backgroundColor: nodeColor
                    }
                  ]} />
                )}
              </TouchableOpacity>
              
              {/* Node labels (only visible in certain conditions) */}
              {(isCurrent || index % 3 === 0) && (
                <View style={learningPathwayStyles.pathwayNodeLabel}>
                  <Text style={learningPathwayStyles.pathwayNodeLabelText}>Level {index + 1}</Text>
                </View>
              )}
            </Animated.View>
          );
        })}
        
        {/* Animated character avatar */}
        <Animated.View
          style={[
            learningPathwayStyles.pathwayAvatarContainer,
            {
              transform: [
                { 
                  translateX: avatarAnim.interpolate({
                    inputRange: [0, 11],
                    outputRange: [getNodePosition(0, viewMode).x - 30, getNodePosition(11, viewMode).x - 30]
                  })
                },
                { 
                  translateY: viewMode === 'side' ? 
                    Animated.add(
                      -30,
                      avatarAnim.interpolate({
                        inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                        outputRange: Array(12).fill().map((_, i) => -getNodePosition(i, 'side').elevation)
                      })
                    ) : -30
                }
              ]
            }
          ]}
        >
          <Image
            source={require('./assets/image 01.png')}
            style={learningPathwayStyles.pathwayAvatarImage}
          />
          
          {/* Character shadow */}
          <View style={learningPathwayStyles.pathwayAvatarShadow} />
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={learningPathwayStyles.pathwayContainer}>
      <View style={learningPathwayStyles.pathwayHeader}>
        <Text style={learningPathwayStyles.pathwayHeaderTitle}>LEARNING ADVENTURE</Text>
        <Text style={learningPathwayStyles.pathwayHeaderSubtitle}>
          Navigate your journey through the knowledge landscape!
        </Text>
      </View>
      
      {/* View mode toggle */}
      <TouchableOpacity 
        style={learningPathwayStyles.pathwayViewToggleButton}
        onPress={toggleViewMode}
      >
        <Text style={learningPathwayStyles.pathwayViewToggleText}>
          {viewMode === 'top' ? '🗺️ MAP VIEW' : '⛰️ TERRAIN VIEW'}
        </Text>
      </TouchableOpacity>
      
      {/* Main scrollable map area */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: totalPathLength, height: height * 0.7 }}
      >
        {renderTerrainElements()}
        {renderPathway()}
        
        {/* Cloud cover at the end of the map */}
        <Animated.View 
          style={[
            learningPathwayStyles.pathwayMapEndClouds,
            {
              opacity: scrollX.interpolate({
                inputRange: [totalPathLength - width * 1.5, totalPathLength - width],
                outputRange: [0, 1],
                extrapolate: 'clamp'
              })
            }
          ]}
        >
          <View style={learningPathwayStyles.pathwayCloudCover}>
            <Text style={learningPathwayStyles.pathwayMysteryText}>The journey continues...</Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Navigation button */}
      <View style={learningPathwayStyles.pathwayButtonContainer}>
        <TouchableOpacity 
          style={learningPathwayStyles.pathwayContinueButton}
          onPress={() => {
            // Navigate to current node's level
            handleNodePress(Math.min(currentPosition + 1, unlockedLevel));
          }}
        >
          <View style={learningPathwayStyles.pathwayButtonGradient}>
            <Text style={learningPathwayStyles.pathwayContinueButtonText}>CONTINUE ADVENTURE</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Enhanced Alphabet Learning Screen with lesson data
const AlphabetLearningScreen = ({ route, navigation }) => {
  const { lessonId, onComplete } = route.params || { lessonId: 1 };
  const [currentCard, setCurrentCard] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const cardAnim = useRef(new Animated.Value(0)).current;
  
  // Lesson content based on lesson ID
  const lessonContent = {
    1: {
      title: "Basic Alphabet (අ-ඉ)",
      cards: [
        { letter: 'අ', pronunciation: 'a', example: 'apple', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ආ', pronunciation: 'aa', example: 'art', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ඇ', pronunciation: 'ae', example: 'ant', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ඈ', pronunciation: 'aae', example: 'ask', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ඉ', pronunciation: 'i', example: 'if', sign: require('./assets/adaptive-icon.png') },
      ],
      xpReward: 75
    },
    2: {
      title: "More Vowels (ඊ-ඖ)",
      cards: [
        { letter: 'ඊ', pronunciation: 'ii', example: 'eel', sign: require('./assets/adaptive-icon.png') },
        { letter: 'උ', pronunciation: 'u', example: 'put', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ඌ', pronunciation: 'uu', example: 'food', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ඍ', pronunciation: 'ru', example: 'rhythm', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ඎ', pronunciation: 'ruu', example: 'root', sign: require('./assets/adaptive-icon.png') },
      ],
      xpReward: 75
    },
    3: {
      title: "Basic Consonants",
      cards: [
        { letter: 'ක', pronunciation: 'ka', example: 'cat', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ග', pronunciation: 'ga', example: 'gun', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ච', pronunciation: 'cha', example: 'chair', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ජ', pronunciation: 'ja', example: 'jar', sign: require('./assets/adaptive-icon.png') },
        { letter: 'ට', pronunciation: 'ta', example: 'top', sign: require('./assets/adaptive-icon.png') },
      ],
      xpReward: 100
    },
    4: {
      title: "Simple Greetings",
      cards: [
        { phrase: 'ආයුබෝවන්', meaning: 'Hello/Greetings', usage: 'Formal greeting', sign: require('./assets/adaptive-icon.png') },
        { phrase: 'සුභ උදෑසනක්', meaning: 'Good morning', usage: 'Morning greeting', sign: require('./assets/adaptive-icon.png') },
        { phrase: 'කොහොමද', meaning: 'How are you?', usage: 'Asking about wellbeing', sign: require('./assets/adaptive-icon.png') },
        { phrase: 'හොඳින්', meaning: 'Well/Good', usage: 'Response to "How are you?"', sign: require('./assets/adaptive-icon.png') },
        { phrase: 'ස්තුතියි', meaning: 'Thank you', usage: 'Expressing gratitude', sign: require('./assets/adaptive-icon.png') },
      ],
      xpReward: 100
    },
    5: {
      title: "Numbers 1-10",
      cards: [
        { number: '1', sinhala: 'එක', pronunciation: 'eka', sign: require('./assets/adaptive-icon.png') },
        { number: '2', sinhala: 'දෙක', pronunciation: 'deka', sign: require('./assets/adaptive-icon.png') },
        { number: '3', sinhala: 'තුන', pronunciation: 'thuna', sign: require('./assets/adaptive-icon.png') },
        { number: '4', sinhala: 'හතර', pronunciation: 'hathara', sign: require('./assets/adaptive-icon.png') },
        { number: '5', sinhala: 'පහ', pronunciation: 'paha', sign: require('./assets/adaptive-icon.png') },
      ],
      xpReward: 125
    }
  };
  
  // If lesson content doesn't exist, use default lesson 1
  const currentLesson = lessonContent[lessonId] || lessonContent[1];
  const alphabetCards = currentLesson.cards;
  
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
        navigation.navigate('LessonComplete', {
          lessonId,
          xpEarned: currentLesson.xpReward,
          lessonTitle: currentLesson.title,
          onComplete
        });
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
          <Image
            source={card.sign}
            style={styles.signImage}
            resizeMode="contain"
          />
          <Text style={styles.exampleText}>
            Example: {card.example}
          </Text>
        </>
      );
    }
    
    // For greeting lessons
    if (card.phrase) {
      return (
        <>
          <Text style={styles.phraseLetter}>{card.phrase}</Text>
          <Text style={styles.phraseMeaning}>
            Meaning: "{card.meaning}"
          </Text>
          <Image
            source={card.sign}
            style={styles.signImage}
            resizeMode="contain"
          />
          <Text style={styles.usageText}>
            Usage: {card.usage}
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
          <Image
            source={card.sign}
            style={styles.signImage}
            resizeMode="contain"
          />
        </>
      );
    }
    
    return null;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.levelIndicator}>{currentLesson.title}</Text>
      
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
            {renderCardContent(alphabetCards[currentCard])}
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
            You've completed the {currentLesson.title} lesson!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// Enhanced Lesson Complete Screen with rewards and lesson tracking
const LessonCompleteScreen = ({ route, navigation }) => {
  const { lessonId, xpEarned, lessonTitle, onComplete } = route.params || {};
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
    
    // Call the onComplete callback
    if (onComplete) {
      onComplete(xpEarned);
    }
  }, []);
  
  // Determine rewards based on lesson
  const getRewards = (id) => {
    switch (id) {
      case 1:
        return [
          `🌟 +${xpEarned} XP Points`,
          '🏅 Basic Alphabet Badge',
          '🔓 Unlocked More Vowels lesson'
        ];
      case 2:
        return [
          `🌟 +${xpEarned} XP Points`,
          '🏅 Vowels Master Badge',
          '🔓 Unlocked Basic Consonants lesson'
        ];
      case 3:
        return [
          `🌟 +${xpEarned} XP Points`,
          '🏅 Consonants Badge',
          '🔓 Unlocked Simple Greetings lesson'
        ];
      case 4:
        return [
          `🌟 +${xpEarned} XP Points`,
          '🏅 Greetings Expert Badge',
          '🔓 Unlocked Numbers 1-10 lesson'
        ];
      case 5:
        return [
          `🌟 +${xpEarned} XP Points`,
          '🏅 Numbers Novice Badge',
          '🔓 Unlocked Family Members lesson'
        ];
      default:
        return [
          `🌟 +${xpEarned} XP Points`,
          '🏅 Learning Badge',
          '🔓 Unlocked next lesson'
        ];
    }
  };
  
  const rewards = getRewards(lessonId);
  
  return (
    <SafeAreaView style={styles.container}>
      <Confetti show={showConfetti} />
      
      <Text style={styles.lessonCompleteTitle}>LESSON COMPLETE!</Text>
      <Text style={styles.lessonCompleteName}>{lessonTitle}</Text>
      
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
          {rewards.map((reward, index) => (
            <Text key={index} style={styles.rewardItem}>{reward}</Text>
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.practiceButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('PracticeQuiz', { lessonId });
          }}
        >
          <Text style={styles.practiceButtonText}>PRACTICE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.navigate('LearningPathway');
          }}
        >
          <Text style={styles.nextButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Practice Quiz Screen (new addition)
const PracticeQuizScreen = ({ route, navigation }) => {
  const { lessonId } = route.params || { lessonId: 1 };
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Quiz questions based on lesson content
  const quizContent = {
    1: [
      {
        question: "What is the pronunciation of 'අ'?",
        options: ["a", "aa", "ae", "i"],
        correctAnswer: 0
      },
      {
        question: "Which letter is pronounced as 'aa'?",
        options: ["අ", "ආ", "ඇ", "ඉ"],
        correctAnswer: 1
      },
      {
        question: "Match the letter 'ඇ' with its pronunciation:",
        options: ["a", "aa", "ae", "i"],
        correctAnswer: 2
      }
    ],
    2: [
      {
        question: "What is the pronunciation of 'ඊ'?",
        options: ["i", "ii", "u", "uu"],
        correctAnswer: 1
      },
      {
        question: "Which letter is pronounced as 'u'?",
        options: ["ඊ", "උ", "ඌ", "ඍ"],
        correctAnswer: 1
      },
      {
        question: "Match the letter 'ඌ' with its pronunciation:",
        options: ["u", "uu", "ru", "ruu"],
        correctAnswer: 1
      }
    ],
    3: [
      {
        question: "What is the pronunciation of 'ක'?",
        options: ["ka", "ga", "cha", "ja"],
        correctAnswer: 0
      },
      {
        question: "Which letter is pronounced as 'ga'?",
        options: ["ක", "ග", "ච", "ජ"],
        correctAnswer: 1
      },
      {
        question: "Match the letter 'ජ' with its pronunciation:",
        options: ["ka", "ga", "cha", "ja"],
        correctAnswer: 3
      }
    ]
  };
  
  // Default to lesson 1 if no content exists
  const questions = quizContent[lessonId] || quizContent[1];
  
  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    const correct = index === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    
    // Update score if correct
    if (correct) {
      setScore(score + 1);
    }
    
    // Wait before moving to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {!showResult ? (
        <>
          <Text style={styles.quizTitle}>Practice Quiz</Text>
          <ProgressBar current={currentQuestion + 1} total={questions.length} />
          
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{questions[currentQuestion].question}</Text>
            
            <View style={styles.optionsContainer}>
              {questions[currentQuestion].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && (
                      index === questions[currentQuestion].correctAnswer 
                        ? styles.correctOption 
                        : styles.incorrectOption
                    )
                  ]}
                  onPress={() => selectedAnswer === null && handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Quiz Complete!</Text>
          <Text style={styles.resultScore}>Score: {score}/{questions.length}</Text>
          
          <View style={styles.resultFeedback}>
            {score === questions.length && (
              <Text style={styles.perfectScore}>Perfect! You've mastered this lesson!</Text>
            )}
            {score >= questions.length / 2 && score < questions.length && (
              <Text style={styles.goodScore}>Good job! Keep practicing to improve.</Text>
            )}
            {score < questions.length / 2 && (
              <Text style={styles.needsPractice}>You need more practice with this lesson.</Text>
            )}
          </View>
          
          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setCurrentQuestion(0);
                setScore(0);
                setShowResult(false);
                setSelectedAnswer(null);
              }}
            >
              <Text style={styles.retryButtonText}>RETRY QUIZ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.pathwayButton}
              onPress={() => navigation.navigate('LearningPathway')}
            >
              <Text style={styles.pathwayButtonText}>BACK TO PATHWAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// App Navigation Configuration
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LearningPathway">
        <Stack.Screen 
          name="LearningPathway" 
          component={LearningPathwayScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AlphabetLearning" 
          component={AlphabetLearningScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="LessonComplete" 
          component={LessonCompleteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PracticeQuiz" 
          component={PracticeQuizScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
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







  





  
  
});


const learningPathwayStyles = StyleSheet.create({
  pathwayContainer: {
    flex: 1,
    backgroundColor: '#c5c6e8',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  pathwayHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  pathwayHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#383773',
  },
  pathwayHeaderSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5d5b8d',
    marginTop: 5,
  },
  pathwayViewToggleButton: {
    backgroundColor: 'rgba(93, 91, 141, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pathwayViewToggleText: {
    color: '#383773',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pathwayScrollContainer: {
    width: '100%',
    height: '70%',
  },
  pathwayContentContainer: {
    paddingBottom: 20,
  },
  pathwayMapContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  pathwaySvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pathwayNodeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  pathwayNodeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pathwayCurrentNode: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  pathwayCompletedNode: {
    borderWidth: 1,
    borderColor: '#fff',
  },
  pathwayLockedNode: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  pathwayNodeIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pathwayNodeNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pathwayNodeLabel: {
    position: 'absolute',
    top: -25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  pathwayNodeLabelText: {
    fontSize: 12,
    color: '#383773',
    fontWeight: '600',
  },
  pathwayElevationIndicator: {
    position: 'absolute',
    bottom: -3,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  pathwayAvatarContainer: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
  },
  pathwayAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#8e8cc0',
  },
  pathwayAvatarShadow: {
    position: 'absolute',
    bottom: -5,
    width: 40,
    height: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: -1,
  },
  pathwayTerrainBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(93, 91, 141, 0.1)',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  pathwayTerrainGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderTopColor: 'rgba(93, 91, 141, 0.3)',
  },
  pathwayCustomCloud: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  pathwayCloudBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  pathwayCloudPuff: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pathwayMapEndClouds: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    zIndex: 15,
  },
  pathwayCloudCover: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pathwayMysteryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    opacity: 0.7,
  },
  pathwayButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  pathwayContinueButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    alignSelf: 'center',
  },
  pathwayButtonGradient: {
    width: '100%',
    alignItems: 'center',
  },
  pathwayContinueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});


