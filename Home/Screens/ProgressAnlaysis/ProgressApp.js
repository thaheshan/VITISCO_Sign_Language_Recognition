
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import XPPoints from './XPpoints';
import styles from './styles';
import ProgressSection from './ProgressSection';
import QuizAPI from './QuizAPI';
import XPChart from './XPChart';
import Challenges from './Challenges';



// Modal component to display language progress, quiz statistics and weekly XP points
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
        {/* Display progress section(basic, intermediary and advanced) for the selected language */}
         <ProgressSection userId={1} languageName={language} />
          {/* Display XP chart */}
          <XPChart/>
            {/* Display quiz avarage time taken and the average marks percentage*/}
          <QuizAPI userId={10} languageName={language} />

         
        </ScrollView>
      </View>
    </View>
  </Modal>
);
// Main component for progress analysis
const ProgressApp = () => {
   // State to hold the selected language
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  // Character image for the header
  const characterImage = require('./assets/logo.png');
  

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
            {/* Display XP points and the current league */}

          <XPPoints/>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track your learning journey!</Text>
          <View style={styles.languageButtons}>
            {['English', 'Tamil', 'Sinhala'].map(language => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageButton,
                  selectedLanguage === language && styles.selectedLanguage
                ]}
                onPress={() => setSelectedLanguage(language)}
              >
                <Text style={[
                  styles.languageText,
                  selectedLanguage === language && styles.selectedLanguageText
                ]}>
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earn Rewards</Text>
         {/* Display challenges */}
          <Challenges/>
        </View>
      </ScrollView>
       {/* Display language progress modal if a language is selected */}
      {selectedLanguage && (
        <LanguageProgressModal
          visible={!!selectedLanguage}
          onClose={() => setSelectedLanguage(null)}
          language={selectedLanguage}
       

        />
      )}
    </SafeAreaView>
  );
};

export default ProgressApp;






















