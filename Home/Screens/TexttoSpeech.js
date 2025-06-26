import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TranslationScreen = () => {
  const [selectedFromLanguage, setSelectedFromLanguage] = useState('Sinhala');
  const [selectedToLanguage, setSelectedToLanguage] = useState('Tamil');
  const [isTranslating, setIsTranslating] = useState(true);

  const handleConvert = () => {
    setIsTranslating(true);
    // Simulate translation process
    setTimeout(() => {
      setIsTranslating(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D4C5F9" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hand Gesture Detection</Text>
        <TouchableOpacity style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Message Bubble */}
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>
          Hello! How are you today?{'\n'}
          I'm feeling hungry.{'\n'}
          Let's grab some food!
        </Text>
        <View style={styles.audioIcon}>
          <Ionicons name="volume-medium" size={16} color="#666" />
        </View>
      </View>

      {/* Translation Status */}
      <View style={styles.translationContainer}>
        <Text style={styles.translatingText}>Translating...</Text>
        <View style={styles.translationBox}>
          <Text style={styles.translationLabel}>
            Required languages{'\n'}interpretation
          </Text>
        </View>
      </View>

      {/* Language Selection */}
      <View style={styles.languageContainer}>
        <TouchableOpacity 
          style={[styles.languageButton, selectedFromLanguage === 'Sinhala' && styles.selectedLanguage]}
          onPress={() => setSelectedFromLanguage('Sinhala')}
        >
          <Text style={[styles.languageText, selectedFromLanguage === 'Sinhala' && styles.selectedLanguageText]}>
            Sinhala
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.languageButton, selectedToLanguage === 'Tamil' && styles.selectedLanguage]}
          onPress={() => setSelectedToLanguage('Tamil')}
        >
          <Text style={[styles.languageText, selectedToLanguage === 'Tamil' && styles.selectedLanguageText]}>
            Tamil
          </Text>
        </TouchableOpacity>
      </View>

      {/* Convert Button */}
      <TouchableOpacity style={styles.convertButton} onPress={handleConvert}>
        <Text style={styles.convertButtonText}>Convert</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4C5F9',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  messageBubble: {
    backgroundColor: '#E6DAFE',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    position: 'relative',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  audioIcon: {
    position: 'absolute',
    bottom: 10,
    right: 15,
  },
  translationContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  translatingText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  translationBox: {
    backgroundColor: '#E6DAFE',
    borderRadius: 15,
    padding: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  translationLabel: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  languageContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  languageButton: {
    backgroundColor: '#E6DAFE',
    borderRadius: 15,
    padding: 18,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#B19CD9',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#fff',
    fontWeight: '600',
  },
  convertButton: {
    backgroundColor: '#9B7EBD',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  convertButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default TranslationScreen;