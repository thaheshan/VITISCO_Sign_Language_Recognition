import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Ionicons, Feather } from '@expo/vector-icons';
import XPPoints from './XPpoints';
import styles from './styles';
import ProgressSection from './ProgressSection';
import QuizAPI from './QuizAPI';
import XPChart from './XPChart';
import Challenges from './Challenges';

// Modal component to display language progress
const LanguageProgressModal = ({ visible, onClose, language }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{`${language} Progress`}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <ProgressSection userId={1} languageName={language} />
          <XPChart />
          <QuizAPI userId={10} languageName={language} />
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// Main component for progress analysis
const ProgressApp = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const characterImage = require('./assets/logo.png');

  // Animation references
  const addButtonRotation = useRef(new Animated.Value(0)).current;
  const menuHeight = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    Animated.parallel([
      Animated.timing(addButtonRotation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(menuHeight, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
    setMenuOpen(!menuOpen);
  };

  const rotateInterpolation = addButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const menuHeightInterpolation = menuHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Progress Analysis</Text>
          </View>
          <View style={styles.characterImageWrapper}>
            <Image
              source={characterImage}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>
          <XPPoints />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track your learning journey!</Text>
          <View style={styles.languageButtons}>
            {['English', 'Tamil', 'Sinhala'].map(language => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageButton,
                  selectedLanguage === language && styles.selectedLanguage,
                ]}
                onPress={() => setSelectedLanguage(language)}
              >
                <Text
                  style={[
                    styles.languageText,
                    selectedLanguage === language && styles.selectedLanguageText,
                  ]}
                >
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earn Rewards</Text>
          <Challenges />
        </View>
      </ScrollView>

      {/* Language Progress Modal */}
      {selectedLanguage && (
        <LanguageProgressModal
          visible={!!selectedLanguage}
          onClose={() => setSelectedLanguage(null)}
          language={selectedLanguage}
        />
      )}

      {/* Popup Menu */}
      <Animated.View style={[styles.popupMenu, { height: menuHeightInterpolation }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Translator', {}, { animation: 'slide_from_right' })}
        >
          <Text style={styles.menuText}>Translator</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Scheduler', {}, { animation: 'slide_from_right' })}
        >
          <Text style={styles.menuText}>Add Schedule</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home', {}, { animation: 'slide_from_right' })}
        >
          <Ionicons name="grid-outline" size={24} color="#352561" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ProgressAnalysis', {}, { animation: 'slide_from_right' })}
        >
          <Feather name="pie-chart" size={26} color="#9E9AA7" />
          <View style={styles.activeNavIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={toggleMenu}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <Ionicons name="add" size={32} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Notifications', {}, { animation: 'slide_from_right' })}
        >
          <Ionicons name="notifications-outline" size={24} color="#9E9AA7" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile', {}, { animation: 'slide_from_right' })}
        >
          <Ionicons name="person-outline" size={24} color="#9E9AA7" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProgressApp;
