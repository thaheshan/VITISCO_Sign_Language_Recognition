import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  export default ProgressCard;