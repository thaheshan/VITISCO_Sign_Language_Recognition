import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const TranslateScreen = ({ route, navigation }) => {
  const { gesture } = route.params || { gesture: 'ග්' };
  const [translatedText, setTranslatedText] = useState('');
  const [conversationHistory, setConversationHistory] = useState([
    {
      id: 1,
      text: 'Hello! How are you today?',
      isUser: false,
    }
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState('Sinhala');

  useEffect(() => {
    // Simulate translation (in real app, this would call your backend API)
    const translateGesture = () => {
      // Map gesture to text (simplified example)
      const translations = {
        'ග්': "I'm feeling hungry.",
        'චි': "I'm doing well.",
        'ටි': "Let's talk later.",
        'ඩි': "Nice to meet you.",
        'ත්': "Thank you.",
        'ද්': "How are you?",
        'න්': "Good morning.",
        'ෆ': "Goodbye.",
        'ෟ': "Can you help me?"
      };
      
      return translations[gesture] || "Let's grab some food!";
    };
    
    const translated = translateGesture();
    setTranslatedText(translated);
    
    // Add to conversation
    setConversationHistory(prev => [
      ...prev,
      {
        id: prev.length + 1,
        text: translated,
        isUser: true,
      }
    ]);
  }, [gesture]);

  const speakText = () => {
    Speech.speak(translatedText, {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hand Gesture Detection</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.conversationContainer}>
        {conversationHistory.map(message => (
          <View 
            key={message.id} 
            style={[
              styles.messageContainer, 
              message.isUser ? styles.userMessage : styles.otherMessage
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
            {message.isUser && (
              <TouchableOpacity style={styles.speakButton} onPress={speakText}>
                <Ionicons name="volume-high" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.translatingIndicator}>
        <Text style={styles.translatingText}>Translating...</Text>
        <Text style={styles.requiredText}>Required languages interpretation</Text>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={[
            styles.languageButton, 
            selectedLanguage === 'Sinhala' && styles.selectedLanguage
          ]}
          onPress={() => handleLanguageSelect('Sinhala')}
        >
          <Text style={styles.languageButtonText}>Sinhala</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.languageButton, 
            selectedLanguage === 'Tamil' && styles.selectedLanguage
          ]}
          onPress={() => handleLanguageSelect('Tamil')}
        >
          <Text style={styles.languageButtonText}>Tamil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.convertButton}
          onPress={speakText}
        >
          <Text style={styles.convertButtonText}>Convert</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B2B5E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  conversationContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#EAEAEA',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  speakButton: {
    backgroundColor: '#4E3D81',
    borderRadius: 12,
    padding: 6,
    marginLeft: 8,
  },
  translatingIndicator: {
    backgroundColor: '#EAEAEA',
    padding: 12,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  translatingText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  requiredText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomControls: {
    padding: 16,
  },
  languageButton: {
    backgroundColor: '#EAEAEA',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedLanguage: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  languageButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  convertButton: {
    backgroundColor: '#4E3D81',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 4,
  },
  convertButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default TranslateScreen;
