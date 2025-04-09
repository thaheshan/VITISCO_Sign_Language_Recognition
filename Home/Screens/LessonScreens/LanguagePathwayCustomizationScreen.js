
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function LanguagePathwayCustomizationScreen2({ navigate }) {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [level, setLevel] = useState('Beginner');
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  
  // Animation values
  const popupScale = new Animated.Value(0.5);
  const popupOpacity = new Animated.Value(0);
  const glowAnimation = new Animated.Value(0);
  
  // Define topics
  const topics = [
    { id: 1, name: 'Sinhala Alphabet', icon: '📝', isPremium: false },
    { id: 2, name: 'Numbers', icon: '🔢', isPremium: true },
    { id: 3, name: 'Greetings', icon: '👋', isPremium: true },
    { id: 4, name: 'Family', icon: '👪', isPremium: true },
    { id: 5, name: 'Food', icon: '🍎', isPremium: true },
    { id: 6, name: 'Animals', icon: '🐶', isPremium: true },
  ];
  
  // Animation for premium popup
  useEffect(() => {
    if (showPremiumPopup) {
      Animated.parallel([
        Animated.timing(popupScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.elastic(1.2),
          useNativeDriver: true
        }),
        Animated.timing(popupOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
      
      // Start the glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      // Reset animations when popup is hidden
      popupScale.setValue(0.5);
      popupOpacity.setValue(0);
      glowAnimation.setValue(0);
    }
  }, [showPremiumPopup]);
  
  // Handle level selection
  const handleLevelSelect = (lvl) => {
    if (lvl !== 'Beginner') {
      setPopupMessage(`${lvl} level is available in the premium version!`);
      setShowPremiumPopup(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      setLevel(lvl);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Toggle topic selection
  const toggleTopic = (id) => {
    const topic = topics.find(topic => topic.id === id);
    

    if (topic.isPremium && topic.name !== 'Sinhala Alphabet') {

      setPopupMessage(`"${topic.name}" is available in the premium version!`);
      setShowPremiumPopup(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      if (selectedTopics.includes(id)) {
        setSelectedTopics(selectedTopics.filter(topicId => topicId !== id));
      } else {
        setSelectedTopics([...selectedTopics, id]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };
  
  // Calculate shadow styles based on animation
  const glowShadow = {
    shadowOpacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0.9]
    }),
    shadowRadius: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 15]
    })
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.customizationHeader}>Customize Your Learning</Text>
      
      <View style={styles.levelSelector}>
        <Text style={styles.sectionTitle}>Select Your Level:</Text>
        <View style={styles.levelOptions}>
          {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <TouchableOpacity 
              key={lvl}
              style={[
                styles.levelOption,
                level === lvl && styles.selectedLevel,
                lvl !== 'Beginner' && styles.premiumOption
              ]}
              onPress={() => handleLevelSelect(lvl)}
            >
              <Text style={[
                styles.levelOptionText,
                level === lvl && styles.selectedLevelText
              ]}>
                {lvl}
              </Text>
              {lvl !== 'Beginner' && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>PRO</Text>
                </View>
              )}
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
                selectedTopics.includes(topic.id) && styles.selectedTopic,
                topic.isPremium && topic.name !== 'English Alphabet' && styles.premiumTopic
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
              {topic.isPremium && topic.name !== 'English Alphabet' && (
                <View style={styles.topicPremiumBadge}>
                  <Text style={styles.premiumBadgeText}>PRO</Text>
                </View>
              )}
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
          navigate('Welcome3');
        }}
      >
        <Text style={styles.nextButtonText}>SAVE & CONTINUE</Text>
      </TouchableOpacity>
      
      {/* Premium Popup Modal */}
      <Modal
        transparent={true}
        visible={showPremiumPopup}
        animationType="none"
        onRequestClose={() => setShowPremiumPopup(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPremiumPopup(false)}
        >
          <Animated.View 
            style={[
              styles.premiumPopup,
              {
                opacity: popupOpacity,
                transform: [{ scale: popupScale }],
                shadowOpacity: glowShadow.shadowOpacity,
                shadowRadius: glowShadow.shadowRadius
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.popupContent}>
                <Text style={styles.premiumIcon}>✨</Text>
                <Text style={styles.premiumTitle}>Premium Feature</Text>
                <Text style={styles.premiumMessage}>{popupMessage}</Text>
                
                <View style={styles.premiumFeatures}>
                  <Text style={styles.featureItem}>✓ All topics & levels</Text>
                  <Text style={styles.featureItem}>✓ Advanced exercises</Text>
                  <Text style={styles.featureItem}>✓ Offline learning</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowPremiumPopup(false);
                  }}
                >
                  <Text style={styles.upgradeButtonText}>UPGRADE NOW</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.laterButton}
                  onPress={() => setShowPremiumPopup(false)}
                >
                  <Text style={styles.laterButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5c6e8',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
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
    position: 'relative',
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
  premiumOption: {
    borderColor: '#ffd700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  premiumBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ffd700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#383773',
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
    position: 'relative',
  },
  selectedTopic: {
    borderColor: '#5d5b8d',
    backgroundColor: 'rgba(93, 91, 141, 0.1)',
  },
  premiumTopic: {
    borderColor: '#ffd700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  topicPremiumBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ffd700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  customizationButton: {
    width: '100%',
    marginTop: 30,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#c5c6e8',
    shadowOpacity: 0.1,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Premium popup styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumPopup: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  popupContent: {
    padding: 25,
    alignItems: 'center',
  },
  premiumIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
    marginBottom: 10,
  },
  premiumMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumFeatures: {
    width: '100%',
    backgroundColor: 'rgba(93, 91, 141, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 14,
    color: '#383773',
    marginBottom: 8,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
  },
  upgradeButtonText: {
    color: '#383773',
    fontSize: 16,
    fontWeight: 'bold',
  },
  laterButton: {
    paddingVertical: 10,
  },
  laterButtonText: {
    color: '#777',
    fontSize: 14,
  }
});