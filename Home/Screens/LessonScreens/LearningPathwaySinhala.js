import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
  Easing,
  ScrollView,
  Dimensions
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LearningPathwayScreen3({ route, navigate }) {
  // Use passed navigate function or create a compatibility layer for direct navigation
  const handleNavigation = navigate || ((screenName, params = {}) => {
    // This is a fallback if the component is used outside your navigation structure
    console.log(`Navigation to ${screenName} with params:`, params);
  });

  const initialLevel = route?.params?.initialLevel ?? 5;
   
  const [unlockedLevel, setUnlockedLevel] = useState(initialLevel);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPathDetails, setShowPathDetails] = useState(true);

  const scrollX = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const nodeAnimations = useRef(Array(12).fill().map(() => new Animated.Value(0))).current;
  const nodeScaleAnimations = useRef(Array(12).fill().map(() => new Animated.Value(1))).current;
  const nodeRotateAnimations = useRef(Array(12).fill().map(() => new Animated.Value(0))).current;
  const nodeRotationValues = useRef(Array(12).fill().map(() => new Animated.Value(0))).current;
  const pathRevealAnim = useRef(new Animated.Value(1)).current;
  const flagWaveAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  // Map coordinate calculations
  const totalPathLength = width * 2.5; // Extended for more room
  const nodeSpacing = totalPathLength / 8;
  
  // Milestone nodes (every 5th node)
  const milestoneNodes = [4, 9]; // 5th and 10th nodes (zero-indexed)
  
  // Themed node types with different appearances
  const nodeThemes = [
    { icon: 'school', color: '#4e54c8', name: 'Knowledge' },
    { icon: 'extension', color: '#8a2be2', name: 'Challenge' },
    { icon: 'science', color: '#20b2aa', name: 'Discovery' },
    { icon: 'emoji-events', color: '#ff8c00', name: 'Achievement' }
  ];

  // Define navigation screens for each level - matching your App.js structure
  const levelScreens = [
    '1to6',
    'sQuiz1',
    '6to12',
    '12to18',
    'sQuiz2',
    '18to24',
    'sQuiz3',
    '24to30',
    'sQuiz4',
    '30to36',
    'sQuiz5',
    'sQuiz6',
  ];

  // Node appearance for animation
  const pulseNode = (index) => {
    Animated.sequence([
      Animated.timing(nodeScaleAnimations[index], {
        toValue: 1.3,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(nodeScaleAnimations[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };

  // Wobble node animation
  const wobbleNode = (index) => {
    // Reset the rotation value
    nodeRotationValues[index].setValue(0);
    
    // Create and start the sequence
    Animated.sequence([
      Animated.timing(nodeRotationValues[index], {
        toValue: 10,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(nodeRotationValues[index], {
        toValue: -10,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(nodeRotationValues[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };

  // Rotate node animation
  const rotateNode = (index) => {
    Animated.loop(
      Animated.timing(nodeRotateAnimations[index], {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
        easing: Easing.linear
      })
    ).start();
  };

  // For flag animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flagWaveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.sinInOut
        }),
        Animated.timing(flagWaveAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.sinInOut
        })
      ])
    ).start();
  }, []);

  // Get node position
  const getNodePosition = (index) => {
    // For map view, nodes follow a winding path with smooth curves
    const baseX = nodeSpacing * index;
    const yOffset = Math.sin(index * 0.8) * 100;
    return {
      x: baseX,
      y: height * 0.4 + yOffset  // Centered vertically a bit more
    };
  };

  // Calculate the path between nodes with gradient
  const getPathPoints = () => {
    const points = Array(12).fill().map((_, i) => {
      const { x, y } = getNodePosition(i);
      return { x, y };
    });
    
    // Create SVG path from points with smoother curves
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Add bezier curve control points for natural path flow
      const prevPoint = points[i-1];
      const currPoint = points[i];
      const cpX1 = prevPoint.x + (currPoint.x - prevPoint.x) * 0.5;
      
      // Add some vertical variation to control points for more organic feel
      const cpY1 = prevPoint.y + (Math.random() > 0.5 ? 20 : -20);
      const cpY2 = currPoint.y + (Math.random() > 0.5 ? 20 : -20);
      
      pathD += ` C ${cpX1},${cpY1} ${cpX1},${cpY2} ${currPoint.x},${currPoint.y}`;
    }
    return pathD;
  };

  // Initialize animations
  useEffect(() => {
    // Animate all nodes appearing with staggered delay
    Animated.stagger(150, 
      nodeAnimations.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true
        })
      )
    ).start();
    
    // Initialize rotation animations for special nodes
    milestoneNodes.forEach(index => {
      rotateNode(index);
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
      
      // Detect which node is closest to center for highlighting
      const closestNodeIndex = Math.min(
        Math.max(0, Math.round(value / nodeSpacing)),
        11
      );
      
      if (selectedNode !== closestNodeIndex) {
        setSelectedNode(closestNodeIndex);
        pulseNode(closestNodeIndex);
        wobbleNode(closestNodeIndex);
      }
    });
    
    return () => {
      scrollX.removeAllListeners();
    };
  }, [showPathDetails, selectedNode]);

  // Navigate to the content screen based on node index
  const navigateToContentScreen = (screenName) => {
    // Modified to use the navigate function from App.js
    handleNavigation(screenName);
  };

  // Handle node press - travel to node and navigate to corresponding screen
  const handleNodePress = (nodeIndex) => {
    if (nodeIndex <= unlockedLevel) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Scroll to node position
      scrollViewRef.current?.scrollTo({
        x: nodeIndex * nodeSpacing - width / 4,
        animated: true
      });
      
      // Animate avatar to node position with bounce
      Animated.spring(avatarAnim, {
        toValue: nodeIndex,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }).start(() => {
        // Show node completion animation
        setCurrentPosition(nodeIndex);
        pulseNode(nodeIndex);
        
        // Navigate to the appropriate screen based on level
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // Get the screen name for this level
          const screenName = levelScreens[nodeIndex];
          // Navigate to the corresponding level screen
          navigateToContentScreen(screenName);
        }, 700);
      });
    } else {
      // Haptic feedback for locked node
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      // Shake animation for locked node
      Animated.sequence([
        Animated.timing(nodeScaleAnimations[nodeIndex], {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(nodeScaleAnimations[nodeIndex], {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(nodeScaleAnimations[nodeIndex], {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.spring(nodeScaleAnimations[nodeIndex], {
          toValue: 1,
          friction: 5,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  // Render decorative elements
  const renderDecorations = () => {
    return (
      <>
        {/* Enhanced background */}
        <View style={learningPathwayStyles.pathwayBackground}>
          {/* Decorative patterns */}
          <View style={[learningPathwayStyles.decorativeCircle, { top: '10%', left: '15%', width: 60, height: 60 }]} />
          <View style={[learningPathwayStyles.decorativeCircle, { top: '60%', left: '70%', width: 80, height: 80 }]} />
          <View style={[learningPathwayStyles.decorativeCircle, { top: '30%', left: '80%', width: 40, height: 40 }]} />
          
          <View style={learningPathwayStyles.pathwayGradient} />
        </View>
      </>
    );
  };

  // Render milestone flag
  const renderFlag = (x, y) => {
    return (
      <Animated.View style={{
        position: 'absolute',
        left: x - 15,
        top: y - 80,
        transform: [
          { 
            rotateZ: flagWaveAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '5deg']
            })
          }
        ]
      }}>
        <View style={learningPathwayStyles.flagPole} />
        <Animated.View style={[
          learningPathwayStyles.flagBanner,
          {
            transform: [
              { 
                skewX: flagWaveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-15deg']
                })
              }
            ]
          }
        ]}>
          <Text style={learningPathwayStyles.flagText}>MILESTONE</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  // Render the path nodes and connecting line
  const renderPathway = () => {
    return (
      <Animated.View style={[
        learningPathwayStyles.pathwayMapContainer,
        { opacity: pathRevealAnim }
      ]}>
        {/* Enhanced Path SVG with gradient */}
        <Svg height="100%" width={totalPathLength} style={learningPathwayStyles.pathwaySvg}>
          <Defs>
            <LinearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#5d5b8d" stopOpacity="0.6" />
              <Stop offset="0.5" stopColor="#8e8cc0" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#5d5b8d" stopOpacity="0.6" />
            </LinearGradient>
            <RadialGradient
              id="nodeGlow"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          
          {/* Base path with gradient */}
          <Path
            d={getPathPoints()}
            stroke="url(#pathGradient)"
            strokeWidth="6"
            fill="none"
            strokeDasharray="8,4"
            strokeLinecap="round"
          />
          
          {/* Progress indicator on the path */}
          <Path
            d={getPathPoints()}
            stroke="#383773"
            strokeWidth="10"
            fill="none"
            strokeDasharray={[totalPathLength, totalPathLength]}
            strokeDashoffset={avatarAnim.interpolate({
              inputRange: [0, 11],
              outputRange: [totalPathLength, 0]
            })}
            strokeLinecap="round"
          />
        </Svg>
        
        {/* Render all nodes */}
        {Array(12).fill().map((_, index) => {
          const { x, y } = getNodePosition(index);
          const isLocked = index > unlockedLevel;
          const isCompleted = index < currentPosition;
          const isCurrent = index === currentPosition;
          const isMilestone = milestoneNodes.includes(index);
          
          // Different node designs based on state
          const nodeSize = isMilestone ? 80 : (isCurrent ? 70 : 60);
          
          // Theme based on node index
          const theme = nodeThemes[index % nodeThemes.length];
          
          // Determine node colors based on state
          const nodeColor = isLocked ? '#c5c6e8' : 
                         isMilestone ? '#ffd700' : 
                         isCompleted ? '#8e8cc0' : 
                         isCurrent ? '#383773' : theme.color;
          
          // Node reflection for 3D effect
          const nodeReflection = {
            backgroundColor: '#ffffff',
            width: nodeSize * 0.3,
            height: nodeSize * 0.3,
            borderRadius: nodeSize * 0.15,
            position: 'absolute',
            top: nodeSize * 0.2,
            left: nodeSize * 0.2,
            opacity: 0.4
          };
          
          return (
            <React.Fragment key={`node-${index}`}>
              {/* Render milestone flag */}
              {isMilestone && renderFlag(x, y)}
              
              {/* Node */}
              <Animated.View
                style={[
                  learningPathwayStyles.pathwayNodeContainer,
                  {
                    left: x - nodeSize/2,
                    top: y - nodeSize/2,
                    width: nodeSize,
                    height: nodeSize,
                    opacity: nodeAnimations[index],
                    transform: [
                      { scale: nodeScaleAnimations[index] },
                      {
                        rotateY: isMilestone ? 
                          nodeRotateAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                          }) : '0deg'
                      },
                      { 
                        rotateZ: nodeRotationValues[index].interpolate({
                          inputRange: [-10, 0, 10],
                          outputRange: ['-10deg', '0deg', '10deg']
                        })
                      }
                    ]
                  }
                ]}
              >
                {/* Node glow effect for milestones and current */}
                {(isMilestone || isCurrent) && (
                  <View style={[
                    learningPathwayStyles.nodeGlow,
                    { 
                      width: nodeSize * 1.5,
                      height: nodeSize * 1.5,
                      borderRadius: nodeSize * 0.75,
                      backgroundColor: nodeColor,
                      opacity: 0.3
                    }
                  ]} />
                )}
                
                <TouchableOpacity
                  style={[
                    learningPathwayStyles.pathwayNodeButton,
                    { 
                      width: nodeSize, 
                      height: nodeSize,
                      borderRadius: nodeSize / 2,
                      backgroundColor: nodeColor,
                    },
                    isCurrent && learningPathwayStyles.pathwayCurrentNode,
                    isMilestone && learningPathwayStyles.pathwayMilestoneNode,
                    isCompleted && learningPathwayStyles.pathwayCompletedNode,
                    isLocked && learningPathwayStyles.pathwayLockedNode,
                  ]}
                  onPress={() => handleNodePress(index)}
                  disabled={isLocked}
                >
                  {/* 3D effect with reflection */}
                  <View style={nodeReflection} />
                  
                  {/* Node content */}
                  {isCompleted ? (
                    <MaterialIcons name="check-circle" size={nodeSize * 0.5} color="#ffffff" />
                  ) : isLocked ? (
                    <MaterialIcons name="lock" size={nodeSize * 0.4} color="#8e8cc0" />
                  ) : isMilestone ? (
                    <MaterialIcons name="star" size={nodeSize * 0.5} color="#ffffff" />
                  ) : (
                    <MaterialIcons name={theme.icon} size={nodeSize * 0.4} color="#ffffff" />
                  )}
                  
                  <Text style={[
                    learningPathwayStyles.pathwayNodeNumber,
                    { fontSize: nodeSize * 0.25 }
                  ]}>{index + 1}</Text>
                </TouchableOpacity>
                
                {/* Add the lesson title under each node */}
                <View style={[
                  learningPathwayStyles.pathwayNodeLabel,
                  isMilestone && { backgroundColor: 'rgba(255, 215, 0, 0.2)' }
                ]}>
                  <BlurView intensity={90} style={learningPathwayStyles.nodeBlur}>
                    <Text style={[
                      learningPathwayStyles.pathwayNodeLabelText,
                      isMilestone && { color: '#aa8c00' }
                    ]}>
                      {levelScreens[index].startsWith('Quiz') ? 'QUIZ ' + levelScreens[index].substring(4) : levelScreens[index]}
                    </Text>
                    <Text style={learningPathwayStyles.pathwayNodeThemeText}>
                      {theme.name}
                    </Text>
                  </BlurView>
                </View>
              </Animated.View>
            </React.Fragment>
          );
        })}
        
        {/* Enhanced animated character avatar - now with emoji style */}
        <Animated.View
          style={[
            learningPathwayStyles.pathwayAvatarContainer,
            {
              transform: [
                { 
                  translateX: avatarAnim.interpolate({
                    inputRange: [0, 11],
                    outputRange: [getNodePosition(0).x - 25, getNodePosition(11).x - 25]
                  })
                },
                { 
                  translateY: avatarAnim.interpolate({
                    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                    outputRange: Array(12).fill().map((_, i) => getNodePosition(i).y - getNodePosition(0).y - 30)
                  })
                },
                // Bobbing animation
                {
                  translateY: Animated.modulo(
                    Animated.multiply(new Animated.Value(Date.now() / 1000), 2),
                    2
                  ).interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [0, -10, 0]
                  })
                }
              ]
            }
          ]}
        >
          {/* Avatar glow effect */}
          <View style={learningPathwayStyles.avatarGlow} />
          
          {/* Emoji-style avatar with circular background */}
          <View style={learningPathwayStyles.emojiAvatarContainer}>
            <Text style={learningPathwayStyles.emojiAvatar}>🧙‍♂️</Text>
          </View>
          
          {/* Character shadow with animation */}
          <Animated.View 
            style={[
              learningPathwayStyles.pathwayAvatarShadow,
              {
                transform: [
                  {
                    scaleX: Animated.modulo(
                      Animated.multiply(new Animated.Value(Date.now() / 1000), 2),
                      2
                    ).interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [1, 0.8, 1]
                    })
                  }
                ]
              }
            ]} 
          />
        </Animated.View>
        
        {/* Finish line at the end */}
        <View style={[
          learningPathwayStyles.finishLine,
          { left: getNodePosition(11).x + 100 }
        ]}>
          <View style={learningPathwayStyles.finishPole} />
          <View style={learningPathwayStyles.finishBanner}>
            <Text style={learningPathwayStyles.finishText}>FINISH</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Handle back button press - navigate to previous screen
  const handleBackPress = () => {
    handleNavigation('Languageselection');
  };

  return (
    <SafeAreaView style={learningPathwayStyles.pathwayContainer}>
      <View style={learningPathwayStyles.pathwayHeader}>
        <View style={learningPathwayStyles.headerRow}>
          <TouchableOpacity 
            style={learningPathwayStyles.backButton}
            onPress={handleBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color="#383773" />
          </TouchableOpacity>
          <Text style={learningPathwayStyles.pathwayHeaderTitle}>LEARNING ADVENTURE</Text>
          <View style={learningPathwayStyles.backButton} />
        </View>
        <Text style={learningPathwayStyles.pathwayHeaderSubtitle}>
          Navigate your journey through the knowledge landscape!
        </Text>
      </View>
      
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
        contentContainerStyle={{ width: totalPathLength, height: height * 0.6 }}
        decelerationRate="fast"
        snapToInterval={nodeSpacing}
      >
        {renderDecorations()}
        {renderPathway()}
        
        {/* Enhanced cloud cover at the end of the map */}
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
          <BlurView intensity={80} style={learningPathwayStyles.pathwayCloudCover}>
            <MaterialIcons name="explore" size={50} color="rgba(56, 55, 115, 0.5)" />
            <Text style={learningPathwayStyles.pathwayMysteryText}>The journey continues...</Text>
            <Text style={learningPathwayStyles.pathwayMysterySubtext}>
              More challenges await in future updates
            </Text>
          </BlurView>
        </Animated.View>
      </ScrollView>
      
      {/* Progress indicator */}
      <View style={learningPathwayStyles.progressContainer}>
        <View style={learningPathwayStyles.progressTrack}>
          <Animated.View 
            style={[
              learningPathwayStyles.progressFill,
              {
                width: avatarAnim.interpolate({
                  inputRange: [0, 11],
                  outputRange: ['8%', '100%']
                })
              }
            ]}
          />
        </View>
        <Text style={learningPathwayStyles.progressText}>
          {Math.min(Math.floor((currentPosition / 11) * 100), 100)}% Complete
        </Text>
      </View>
      
      {/* Node navigation buttons */}
      <View style={learningPathwayStyles.navigationButtonsContainer}>
        <TouchableOpacity 
          style={[
            learningPathwayStyles.navigationButton, 
            currentPosition <= 0 && learningPathwayStyles.disabledButton
          ]}
          onPress={() => {
            if (currentPosition > 0) {
              handleNodePress(currentPosition - 1);
            }
          }}
          disabled={currentPosition <= 0}
        >
          <MaterialIcons name="arrow-back" size={24} color={currentPosition <= 0 ? "#8e8cc0" : "#383773"} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={learningPathwayStyles.continueButton}
          onPress={() => {
            const nextLevel = Math.min(currentPosition + 1, unlockedLevel);
            handleNodePress(nextLevel);
          }}
        >
          <View style={learningPathwayStyles.continueButtonInner}>
            <FontAwesome5 name="hiking" size={18} color="white" style={{ marginRight: 10 }} />
            <Text style={learningPathwayStyles.continueButtonText}>CONTINUE JOURNEY</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            learningPathwayStyles.navigationButton,
            (currentPosition >= unlockedLevel) && learningPathwayStyles.disabledButton
          ]}
          onPress={() => {
            if (currentPosition < unlockedLevel) {
              handleNodePress(currentPosition + 1);
            }
          }}
          disabled={currentPosition >= unlockedLevel}
        >
          <MaterialIcons name="arrow-forward" size={24} color={currentPosition >= unlockedLevel ? "#8e8cc0" : "#383773"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


  
  
  
 
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
  pathwayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pathwayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'transparent',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  pathwayMilestoneNode: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
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
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  pathwayNodeLabel: {
    position: 'absolute',
    top: -35,
    width: 120,
    overflow: 'hidden',
    borderRadius: 10,
  },
  nodeBlur: {
    padding: 5,
    alignItems: 'center',
    borderRadius: 10,
  },
  pathwayNodeLabelText: {
    fontSize: 12,
    color: '#383773',
    fontWeight: '600',
    textAlign: 'center',
  },
  pathwayNodeThemeText: {
    fontSize: 10,
    color: '#5d5b8d',
    textAlign: 'center',
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
  avatarGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
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
  pathwayTerrainBaseSide: {
    height: '100%',
    backgroundColor: 'rgba(93, 91, 141, 0.05)',
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
  pathwayMountain: {
    position: 'absolute',
    bottom: 0,
    width: 200,
    borderBottomWidth: 0,
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(93, 91, 141, 0.3)',
    borderStyle: 'solid',
  },
  pathwayCloud: {
    position: 'absolute',
    width: 100,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
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
  pathwayMysterySubtext: {
    fontSize: 14,
    color: '#5d5b8d',
    textAlign: 'center',
    marginTop: 10,
  },
  nodeGlow: {
    position: 'absolute',
    zIndex: -1,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  progressTrack: {
    height: 8,
    width: '80%',
    backgroundColor: 'rgba(93, 91, 141, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#383773',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#383773',
    marginTop: 5,
  },
  flagPole: {
    width: 4,
    height: 60,
    backgroundColor: '#5d5b8d',
  },
  flagBanner: {
    position: 'absolute',
    top: 5,
    left: 4,
    width: 50,
    height: 30,
    backgroundColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  flagText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#5d5b8d',
  },
  finishLine: {
    position: 'absolute',
    zIndex: 5,
    alignItems: 'center',
  },
  finishPole: {
    width: 5,
    height: 80,
    backgroundColor: '#383773',
  },
  finishBanner: {
    position: 'absolute',
    top: 10,
    width: 60,
    height: 30,
    backgroundColor: '#ff8c00',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  finishText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  navigationButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowOpacity: 0.1,
    elevation: 1,
  },
  continueButton: {
    backgroundColor: '#383773',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  continueButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pathwayContinueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emojiAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8e8cc0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  emojiAvatar: {
    fontSize: 24,
  }
});