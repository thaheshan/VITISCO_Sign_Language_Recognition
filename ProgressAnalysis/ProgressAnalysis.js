import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const ProgressCard = ({ title, progress, total }) => (
  <View style={styles.progressCard}>
    <View style={styles.progressHeader}>
      <Icon 
        name={title === 'Basic' ? 'star' : title === 'Intermediate' ? 'medal' : 'trophy'} 
        size={24} 
        color="#666"
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

const StatsCard = ({ icon, title, value, subtitle }) => (
  <View style={styles.statsCard}>
    <Icon name={icon} size={24} color="#666" />
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{subtitle}</Text>
  </View>
);

const RewardCard = ({ title, xp, description, completed, date }) => (
  <View style={styles.rewardCard}>
    <View style={styles.rewardInfo}>
      <Icon name="diamond" size={24} color="#666" />
      <View style={styles.rewardText}>
        <Text style={styles.rewardTitle}>{title}</Text>
        <Text style={styles.rewardDescription}>{description}</Text>
        {completed && <Text style={styles.rewardDate}>{date}</Text>}
      </View>
    </View>
    <View style={styles.xpContainer}>
      <Text style={styles.xpText}>{`${xp} XP`}</Text>
      {completed && <Icon name="check-circle" size={20} color="#4CAF50" />}
    </View>
  </View>
);

const App = () => {
  const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      data: [65, 80, 75, 85, 90, 88, 85]
    }]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress Analysis</Text>
          <View style={styles.profileStats}>
            <Text style={styles.xpText}>850 XP</Text>
            <Text style={styles.leagueText}>Gold League</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <ProgressCard title="Basic" progress={12} total={25} />
          <ProgressCard title="Intermediate" progress={8} total={11} />
          <ProgressCard title="Advanced" progress={3} total={15} />
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly progress</Text>
          <LineChart
            data={weeklyData}
            width={350}
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
              value="84%"
              subtitle="Correct Answers"
            />
            <StatsCard
              icon="clock"
              value="2.5"
              subtitle="minutes per quiz"
            />
          </View>
        </View>

        <View style={styles.languageSelection}>
          <Text style={styles.sectionTitle}>Track your learning journey!</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity style={[styles.languageButton, styles.activeLanguage]}>
              <Text style={styles.languageButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.languageButton}>
              <Text style={styles.languageButtonText}>Tamil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.languageButton}>
              <Text style={styles.languageButtonText}>Sinhala</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Earn Rewards</Text>
          <RewardCard
            title="First Lesson"
            xp={20}
            description="Complete your first lesson"
            completed={true}
            date="Completed Jan 15, 2024"
          />
          <RewardCard
            title="Week Streak"
            xp={20}
            description="Learn for 7 days in a row"
          />
          <RewardCard
            title="Vocabulary Master"
            xp={20}
            description="Learn 100 new words"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0FF',
  },
  scrollView: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  leagueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
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
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#515CE6',
    borderRadius: 3,
  },
  chartSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
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
  languageSelection: {
    marginBottom: 24,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  activeLanguage: {
    backgroundColor: '#515CE6',
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  rewardsSection: {
    gap: 12,
    marginBottom: 24,
  },
  rewardCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rewardText: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
  },
  rewardDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default App;
