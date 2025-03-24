import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../ProgressAnalysis/ProgressAnalysis/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// RewardCard component to display reward information
const RewardCard = ({ title, xp, description, completed, progress = 0 }) => (
  <View style={styles.rewardCard}>
    <View style={styles.rewardLeft}>
      {/* Icon container with dynamic background color based on completion status */}
      <View style={[styles.rewardIconContainer, { backgroundColor: completed ? '#4C4469' : '#4C88FF' }]}>
        {/* Display an icon based on the title */}
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
        {/* Display the title of the reward */}
        <Text style={styles.rewardTitle}>{title}</Text>
        {/* Display the description of the reward */}
        <Text style={styles.rewardDescription}>{description}</Text>
        {/* Display the progress bar with the width based on the progress percentage */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
    <View style={styles.xpContainer}>
      {/* Display the XP points */}
      <Text style={styles.xpText}>{xp} XP</Text>
      {/* Display a check-circle icon if the reward is completed */}
      {completed && <Icon name="check-circle" size={22} color="green" />}
    </View>
  </View>
);

export default RewardCard;