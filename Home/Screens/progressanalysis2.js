import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

// Local data storage
const localData = {
  userXP: {
    totalXP: 12500,
    league: 'Silver'
  },
  weeklyProgress: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [20, 45, 28, 80, 99, 43, 50] }]
  },
  languageProgress: {
    English: [
      { categoryName: 'Basic', progress: 5, total: 10 },
      { categoryName: 'Intermediate', progress: 3, total: 8 },
      { categoryName: 'Advanced', progress: 1, total: 5 }
    ],
    Tamil: [
      { categoryName: 'Basic', progress: 8, total: 10 },
      { categoryName: 'Intermediate', progress: 4, total: 8 }
    ],
    Sinhala: [
      { categoryName: 'Basic', progress: 2, total: 10 }
    ]
  },
  quizPerformance: {
    English: { averageMarks: 75.5, averageTimeMinutes: 3.2 },
    Tamil: { averageMarks: 82.3, averageTimeMinutes: 2.8 },
    Sinhala: { averageMarks: 65.1, averageTimeMinutes: 4.1 }
  },
  challenges: [
    {
      challengeId: 1,
      title: 'Learn 5 Lessons',
      description: 'Complete any 5 lessons this week',
      XPPoints: 100,
      progress: 0.6
    },
    {
      challengeId: 2,
      title: 'Quiz Master',
      description: 'Score 80% or higher on 3 quizzes',
      XPPoints: 150,
      progress: 0.3
    },
    {
      challengeId: 3,
      title: 'Compete in Virtual Room',
      description: 'Join and complete a virtual competition',
      XPPoints: 200,
      progress: 0.1
    }
  ]
};

// XP Points Component
const XPpoints = () => (
  <View style={styles.profileStats}>
    <View style={styles.statItem}>
      <View style={styles.statBackgroundBlue}>
        <Icon name="star-outline" size={20} color="#515CE6" />
        <Text style={styles.xpText}>{localData.userXP.totalXP}</Text>
        <Text style={styles.statLabel}>Total Points</Text>
      </View>
    </View>
    <View style={styles.statItem}>
      <View style={styles.statBackgroundPink}>
        <Icon name="trophy-outline" size={20} color="#FF6B6B" />
        <Text style={styles.leagueText}>{localData.userXP.league}</Text>
        <Text style={styles.statLabel}>Current league</Text>
      </View>
    </View>
  </View>
);

// Progress Card Component
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
      <View style={[styles.progressFill, { width: `${(progress/total) * 100}%` }]} />
    </View>
  </View>
);

// Stats Card Component
const StatsCard = ({ icon, value, subtitle }) => (
  <View style={styles.statsCard}>
    <Icon name={icon} size={24} color="green" />
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{subtitle}</Text>
  </View>
);

// Challenges Component
const Challenges = () => (
  <View>
    {localData.challenges.map((challenge) => {
      const completed = challenge.progress >= 1;
      return (
        <View key={challenge.challengeId} style={styles.rewardCard}>
          <View style={styles.rewardLeft}>
            <View style={[styles.rewardIconContainer, { backgroundColor: completed ? '#4C4469' : '#4C88FF' }]}>
              <Icon
                name={
                  challenge.title.includes('Learn') ? 'school' :
                  challenge.title.includes('Quiz') ? 'lightbulb-auto' :
                  challenge.title.includes('Compete') ? 'human-greeting-variant' : 'trophy-outline'
                }
                size={20}
                color="white"
              />
            </View>
            <View style={styles.rewardContent}>
              <Text style={styles.rewardTitle}>{challenge.title}</Text>
              <Text style={styles.rewardDescription}>{challenge.description}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${challenge.progress * 100}%` }]} />
              </View>
            </View>
          </View>
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>{challenge.XPPoints} XP</Text>
            {completed && <Icon name="check-circle" size={22} color="green" />}
          </View>
        </View>
      );
    })}
  </View>
);

// XP Chart Component
const XPChart = () => {
  const width = Dimensions.get('window').width;

  return (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>Weekly progress</Text>
      <LineChart
        data={localData.weeklyProgress}
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
  );
};

// Progress Section Component
const ProgressSection = ({ languageName }) => {
  const progressData = localData.languageProgress[languageName] || [];

  return (
    <View style={styles.progressSection}>
      {progressData.map((category) => (
        <ProgressCard
          key={category.categoryName}
          title={category.categoryName}
          progress={category.progress}
          total={category.total}
        />
      ))}
    </View>
  );
};

// Quiz API Component
const QuizAPI = ({ languageName }) => {
  const performance = localData.quizPerformance[languageName] || { averageMarks: 0, averageTimeMinutes: 0 };

  return (
    <View style={styles.quizSection}>
      <Text style={styles.sectionTitle}>Quiz Performance</Text>
      <View style={styles.quizStats}>
        <StatsCard
          icon="check-circle"
          value={`${performance.averageMarks.toFixed(2)}%`}
          subtitle="Correct Answers"
        />
        <StatsCard
          icon="clock"
          value={`${performance.averageTimeMinutes.toFixed(1)}`}
          subtitle="Minutes per quiz"
        />
      </View>
    </View>
  );
};

// Language Progress Modal Component
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
          <ProgressSection languageName={language} />
          <XPChart />
          <QuizAPI languageName={language} />
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// Main ProgressApp Component
const ProgressApp = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const characterImage = require('./assets/logo.png'); // Make sure to have this image

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
          <XPpoints />
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

      {selectedLanguage && (
        <LanguageProgressModal
          visible={!!selectedLanguage}
          onClose={() => setSelectedLanguage(null)}
          language={selectedLanguage}
        />
      )}

      <Animated.View style={[styles.popupMenu, { height: menuHeightInterpolation }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Translator')}
        >
          <Text style={styles.menuText}>Translator</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Scheduler')}
        >
          <Text style={styles.menuText}>Add Schedule</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="grid-outline" size={24} color="#352561" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ProgressAnalysis')}
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
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#9E9AA7" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color="#9E9AA7" />
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
    backgroundColor: 'rgba(81, 92, 230, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statBackgroundPink: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  activeNavIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#352561',
    position: 'absolute',
    bottom: -6,
  },
  addButton: {
    backgroundColor: '#6B5ECD',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    bottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  popupMenu: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(107, 94, 205, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProgressApp;