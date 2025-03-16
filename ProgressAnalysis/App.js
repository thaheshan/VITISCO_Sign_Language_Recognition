
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Bo from './Bo';
import styles from './styles';
import RewardCard from './RewardCard';
import ProgressSection from './ProgressSection';
import QuizAPI from './QuizAPI';

// Get device dimensions
const { width, height } = Dimensions.get('window');







const LanguageProgressModal = ({ visible, onClose, language, data }) => (
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

          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Weekly progress</Text>
            <LineChart
              data={data.weeklyData}
              width={width - 40}
              height={200}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(81, 92, 230, ${opacity})`,
                style: {
                  borderRadius: 16
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
          <QuizAPI userId={3} languageName={language} />

         
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const App = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const characterImage = require('./assets/logo.png');
  const languageData = {
    English: {
     
      weeklyData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [65, 80, 75, 85, 90, 88, 85] }]
      }
     
    },
    Tamil: {
      
      weeklyData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [55, 60, 65, 70, 75, 72, 70] }]
      }
    },
    Sinhala: {
     
      weeklyData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [45, 50, 55, 58, 60, 62, 60] }]
      }
    }
  };

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
          
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <View style={styles.statBackgroundBlue}>
                <Icon name="star-outline" size={20} color="#515CE6" />
                <Text style={styles.xpText}><Bo/></Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statBackgroundPink}>
                <Icon name="trophy-outline" size={20} color="#FF6B6B" />
                <Text style={styles.leagueText}>Gold</Text>
                <Text style={styles.statLabel}>Current league</Text>
              </View>
            </View>
          </View>
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
          <RewardCard
            title="First Lesson"
            xp="20"
            description="Complete your first lesson"
            completed={true}
            progress={1}
          />
          <RewardCard
            title="Week Streak"
            xp="20"
            description="Learn for 7 days in a row"
            progress={0.5}
          />
          <RewardCard
            title="Vocabulary Master"
            xp="20"
            description="Learn 100 new words"
            progress={0.3}
          />
          <RewardCard
            title="Vocabulary Master"
            xp="20"
            description="Learn 100 new words"
            progress={0.3}
          />
        </View>
      </ScrollView>

      {selectedLanguage && (
        <LanguageProgressModal
          visible={!!selectedLanguage}
          onClose={() => setSelectedLanguage(null)}
          language={selectedLanguage}
          data={languageData[selectedLanguage]}

        />
      )}
    </SafeAreaView>
  );
};



export default App;






















