import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  Animated
} from 'react-native';

import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function CountDownScreen2({ navigate }) {
  const [countdown, setCountdown] = useState(10);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
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
    );
    pulseAnimation.start();

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('GetStarted'); // Ensure navigation after timeout
          }, 500); // Small delay for smoother transition
          return 0;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      pulseAnimation.stop(); // Stop animation when unmounting
    };
  }, [navigate]);

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
        source={require('../../assets/starts.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigate('GetStarted');
        }}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}


  
  
  
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
      width: 0.3,
      height: 0.23,
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
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  });
