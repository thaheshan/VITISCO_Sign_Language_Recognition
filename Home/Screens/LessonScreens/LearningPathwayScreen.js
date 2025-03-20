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
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function LearningPathwayScreen({ navigate , route }) {
  const initialLevel = route?.params?.initialLevel ?? 5;
   
   const [unlockedLevel, setUnlockedLevel] = useState(initialLevel);
   const [currentPosition, setCurrentPosition] = useState(0);

  const [viewMode, setViewMode] = useState('top');
  const [showPathDetails, setShowPathDetails] = useState(true);

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
          navigate('LessonIntro', { level: nodeIndex + 1 });
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
            source={require('../../assets/icon.png')}
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
     
        >
          <View style={learningPathwayStyles.pathwayButtonGradient}

onPress={() => {
  // Navigate to current node's level
  handleNodePress(Math.min(currentPosition + 1, unlockedLevel));
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  navigate('LessonIntro');
}}
          >
            <Text style={learningPathwayStyles.pathwayContinueButtonText}>CONTINUE ADVENTURE</Text>
          </View>
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
  