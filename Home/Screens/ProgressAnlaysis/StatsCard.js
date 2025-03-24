import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// StatsCard component to display statistical information
const StatsCard = ({ icon, value, subtitle }) => (
  <View style={styles.statsCard}>
    {/* Display an icon based on the icon prop */}
    <Icon name={icon} size={24} color="green" />
    {/* Display the value of the statistic */}
    <Text style={styles.statsValue}>{value}</Text>
    {/* Display the subtitle of the statistic */}
    <Text style={styles.statsLabel}>{subtitle}</Text>
  </View>
);

export default StatsCard;