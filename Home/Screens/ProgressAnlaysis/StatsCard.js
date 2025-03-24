import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StatsCard = ({ icon, value, subtitle }) => (
    <View style={styles.statsCard}>
      <Icon name={icon} size={24} color="green" />
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{subtitle}</Text>
    </View>
  );
  export default StatsCard;