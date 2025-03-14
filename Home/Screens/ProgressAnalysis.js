
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Get device dimensions
const { width, height } = Dimensions.get('window');

const ProgressCard = ({ title, progress, total }) => (
  <View style={styles.progressCard}>
    <View style={styles.progressHeader}>
      <Icon 
        name={title === 'Basic' ? 'star' : title === 'Intermediate' ? 'medal' : 'trophy'} 
        size={24} 
        color="#4C4469"
      />
      <Text style={styles.progressTitle}>{title}</Text>
      <Text style={styles.progressSubtitle}>{`${progress}/${total} lessons`}</Text>
    </View>
    <View style={styles.progressBar}>
      <View 
        style={[
          styles.progressFill, 
          { width: `${(progress/total) * 100}%` }
        ]} 
      />
    </View>
  </View>
);

const StatsCard = ({ icon, value, subtitle }) => (
  <View style={styles.statsCard}>
    <Icon name={icon} size={24} color="green" />
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{subtitle}</Text>
  </View>
);

const RewardCard = ({ title, xp, description, completed, progress = 0 }) => (
  <View style={styles.rewardCard}>
    <View style={styles.rewardLeft}>
      <View style={[styles.rewardIconContainer, { backgroundColor: completed ? '#4C4469' : '#4C88FF' }]}>
        <Icon 
          name={
            title === 'First Lesson' ? 'school' :
            title === 'Week Streak' ? 'calendar-week' : 'book'
          } 
          size={20} 
          color="white"
        />
      </View>
      <View style={styles.rewardContent}>
        <Text style={styles.rewardTitle}>{title}</Text>
        <Text style={styles.rewardDescription}>{description}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
    <View style={styles.xpContainer}>
      <Text style={styles.xpText}>{xp} XP</Text>
      {completed && <Icon name="check-circle" size={22} color="green" />}
    </View>
  </View>
);

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
          <View style={styles.progressSection}>
            <ProgressCard title="Basic" progress={data.basic.progress} total={data.basic.total} />
            <ProgressCard title="Intermediate" progress={data.intermediate.progress} total={data.intermediate.total} />
            <ProgressCard title="Advanced" progress={data.advanced.progress} total={data.advanced.total} />
          </View>

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

          <View style={styles.quizSection}>
            <Text style={styles.sectionTitle}>Quiz Performance</Text>
            <View style={styles.quizStats}>
              <StatsCard
                icon="check-circle"
                value={`${data.quizStats.correctAnswers}%`}
                subtitle="Correct Answers"
              />
              <StatsCard
                icon="clock"
                value={data.quizStats.averageTime}
                subtitle="minutes per quiz"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const App = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const characterImage = require('../assets/vitisco logo PNG.png');
  const languageData = {
    English: {
      basic: { progress: 12, total: 25 },
      intermediate: { progress: 8, total: 11 },
      advanced: { progress: 3, total: 15 },
      weeklyData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [65, 80, 75, 85, 90, 88, 85] }]
      },
      quizStats: {
        correctAnswers: 84,
        averageTime: "2.5"
      }
    },
    Tamil: {
      basic: { progress: 8, total: 20 },
      intermediate: { progress: 4, total: 15 },
      advanced: { progress: 1, total: 10 },
      weeklyData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [55, 60, 65, 70, 75, 72, 70] }]
      },
      quizStats: {
        correctAnswers: 78,
        averageTime: "3.0"
      }
    },
    Sinhala: {
      basic: { progress: 6, total: 18 },
      intermediate: { progress: 3, total: 12 },
      advanced: { progress: 0, total: 8 },
      weeklyData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [45, 50, 55, 58, 60, 62, 60] }]
      },
      quizStats: {
        correctAnswers: 72,
        averageTime: "3.5"
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
                <Text style={styles.xpText}>850 XP</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B2B5E7',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginVertical: 10,
    marginTop: 35,
    position: 'relative',
  },
  headerTextContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  frameText: {
    fontSize: 14,
    color: '#666',
  },
  characterImageWrapper: {
    position: 'absolute',
    right: 5,
    top: -15,
    zIndex: 1,
  },
  characterImage: {
    width: 90,
    height: 100,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  statBackgroundBlue: {
    backgroundColor: 'rgba(81, 92, 230, 0.2)', // Bluish transparent background
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statBackgroundPink: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)', // Pinkish transparent background
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  leagueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    paddingVertical: 26,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    flex: 1,
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#4C4469',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedLanguageText: {
    color: 'white',
  },
  rewardCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rewardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor:"#4C4469",
    borderRadius: 3,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  progressSection: {
    gap: 12,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  chartSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  chart: {
    borderRadius: 12,
  },
  quizSection: {
    marginBottom: 24,
  },
  quizStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;






















