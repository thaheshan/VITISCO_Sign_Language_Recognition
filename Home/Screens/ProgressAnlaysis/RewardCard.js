import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../ProgressAnalysis/ProgressAnalysis/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  export default RewardCard;