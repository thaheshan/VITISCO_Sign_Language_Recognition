import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ImageBackground,
  Dimensions,
  Image
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const LearningPathwayScreen = ({ navigation, route }) => {
  // Existing state
  const [unlockedLevel, setUnlockedLevel] = useState(route.params?.initialLevel || 5);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [viewMode, setViewMode] = useState('top');
  const [showPathDetails, setShowPathDetails] = useState(true);
  
  // Gamification state
  const [collectedStars, setCollectedStars] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(3);
  const [powerUps, setPowerUps] = useState({ boost: 2, shield: 1 });
  
  // Animation refs
  const scrollX = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const viewTransition = useRef(new Animated.Value(0)).current;
  const nodeAnimations = useRef(Array(12).fill().map(() => new Animated.Value(0))).current;
  const pathRevealAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);
  const spinValue = useRef(new Animated.Value(0)).current;
  const particleAnimator = useRef(new Animated.Value(0)).current;

  // Particle system configuration
  const particles = useRef(Array(20).fill().map(() => ({
    angle: Math.random() * Math.PI * 2,
    radius: Math.random() * 50 + 30,
    speed: Math.random() * 3000 + 2000,
    size: Math.random() * 6 + 3
  }))).current;

  // 3D rotation animation
  const animate3DRotation = () => {
    Animated.spring(spinValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start(() => spinValue.setValue(0));
  };

  // Particle explosion effect
  const triggerParticles = () => {
    particleAnimator.setValue(0);
    Animated.timing(particleAnimator, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    }).start();
  };

  // Enhanced node press handler
  const handleNodePress = (nodeIndex) => {
    if (nodeIndex <= unlockedLevel) {
      triggerParticles();
      animate3DRotation();

      if (Math.random() > 0.7 && !collectedStars.includes(nodeIndex)) {
        setCollectedStars([...collectedStars, nodeIndex]);
      }

      setCurrentStreak(prev => (nodeIndex === currentPosition + 1 ? prev + 1 : 1));

      scrollViewRef.current?.scrollTo({
        x: nodeIndex * (width * 2) / 12 - width / 4,
        animated: true
      });

      Animated.spring(avatarAnim, {
        toValue: nodeIndex,
        tension: 30,
        friction: 7,
        useNativeDriver: true
      }).start(() => {
        setCurrentPosition(nodeIndex);
        setTimeout(() => {
          navigation.navigate('AlphabetLearning', { level: nodeIndex + 1 });
        }, 500);
      });
    } else {
      Animated.sequence([
        Animated.timing(nodeAnimations[nodeIndex], { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(nodeAnimations[nodeIndex], { toValue: 0.8, duration: 100, useNativeDriver: true }),
        Animated.spring(nodeAnimations[nodeIndex], { toValue: 1, friction: 5, useNativeDriver: true })
      ]).start();
    }
  };

  // RPG-style Header Component
  const renderHeader = () => (
    <View style={styles.rpgHeader}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Knowledge Kingdom</Text>
        <View style={styles.xpBar}>
          <Animated.View style={[styles.xpFill, { 
            width: avatarAnim.interpolate({
              inputRange: [0, 11],
              outputRange: ['0%', '100%']
            })
          }]} />
        </View>
      </View>
      <View style={styles.starCounter}>
        <Text style={styles.starCount}>🌟 {collectedStars.length}</Text>
      </View>
    </View>
  );

  // Enhanced Pathway Rendering
  const renderPathway = () => (
    <Animated.View style={[styles.pathwayMapContainer, {
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
        }
      ]
    }]}>
      {/* Particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={`particle-${index}`}
          style={[styles.particle, {
            transform: [
              { 
                translateX: particleAnimator.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.cos(particle.angle) * particle.radius]
                }) 
              },
              { 
                translateY: particleAnimator.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.sin(particle.angle) * particle.radius]
                }) 
              }
            ],
            opacity: particleAnimator.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 0.8, 0]
            }),
            width: particle.size,
            height: particle.size
          }]}
        />
      ))}

      {/* Collectible Stars */}
      {Array(12).fill().map((_, index) => (
        !collectedStars.includes(index) && (
          <Animated.View
            key={`star-${index}`}
            style={[styles.starContainer, {
              left: (width * 2 / 12) * index - 15,
              top: height * 0.3 - 60,
              opacity: nodeAnimations[index]
            }]}
          >
            <TouchableOpacity onPress={() => setCollectedStars([...collectedStars, index])}>
              <Animated.Text style={styles.starIcon}>🌟</Animated.Text>
            </TouchableOpacity>
          </Animated.View>
        )
      ))}

      {/* Progress Dragon */}
      <Animated.View style={[styles.progressDragon, {
        transform: [
          { 
            translateX: avatarAnim.interpolate({
              inputRange: [0, 11],
              outputRange: [-50, (width * 2) + 50]
            }) 
          }
        ]
      }]}>
        <Text style={styles.dragonIcon}>🐉</Text>
      </Animated.View>

      {/* Power-Up Badges */}
      <View style={styles.powerUpContainer}>
        <View style={styles.powerUpBadge}>
          <Text style={styles.powerUpText}>🚀 {powerUps.boost}</Text>
        </View>
        <View style={styles.powerUpBadge}>
          <Text style={styles.powerUpText}>🛡 {powerUps.shield}</Text>
        </View>
      </View>

      {/* Existing Pathway Elements... */}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: width * 2, height: height * 0.7 }}
      >
        {renderPathway()}
      </ScrollView>

      {/* Quest Section */}
      <View style={styles.questContainer}>
        <Text style={styles.questTitle}>Active Quests</Text>
        <View style={styles.questCard}>
          <Text style={styles.questText}>🔥 Complete 3 lessons in a row</Text>
          <View style={styles.questProgress}>
            <View style={[styles.questProgressBar, { 
              width: `${Math.min((currentStreak / 3) * 100, 100)}%` 
            }]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  rpgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#16213e',
    borderBottomWidth: 2,
    borderColor: '#0f3460'
  },
  headerTitle: {
    color: '#e94560',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(233,69,96,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  },
  xpBar: {
    width: 200,
    height: 12,
    backgroundColor: '#0f3460',
    borderRadius: 6,
    marginTop: 8,
    overflow: 'hidden'
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 6
  },
  starCounter: {
    backgroundColor: 'rgba(233,69,96,0.2)',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e94560'
  },
  starCount: {
    color: '#fff',
    fontWeight: 'bold'
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#e94560