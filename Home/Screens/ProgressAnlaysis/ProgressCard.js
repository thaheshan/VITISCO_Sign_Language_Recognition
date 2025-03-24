import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// ProgressCard component to display progress information
const ProgressCard = ({ title, progress, total }) => (
  <View style={styles.progressCard}>
    <View style={styles.progressHeader}>
      {/* Display an icon based on the title */}
      <Icon 
        name={title === 'Basic' ? 'star' : title === 'Intermediate' ? 'medal' : 'trophy'} 
        size={24} 
        color="#4C4469"
      />
      {/* Display the title of the progress card */}
      <Text style={styles.progressTitle}>{title}</Text>
      {/* Display the progress in terms of completed lessons out of total lessons */}
      <Text style={styles.progressSubtitle}>{`${progress}/${total} lessons`}</Text>
    </View>
    <View style={styles.progressBar}>
      {/* Display the progress bar with the width based on the progress percentage */}
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