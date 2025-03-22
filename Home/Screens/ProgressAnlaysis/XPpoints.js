
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const XPpoints = () => {
  const [totalXP, setTotalXP] = useState(0);
  const[league, setLeague] = useState(null);
  const userId = 2;

  useEffect(() => {
    const fetchXP = async () => {
      try {
        const response = await fetch(`https://future-champion-452808-r4.uw.r.appspot.com/user-xp/${userId}`);
        const data = await response.json();
        if (data.totalXP !== undefined) {
          setTotalXP(data.totalXP);
          if (data.totalXP < 1500) {
            setLeague('Beginner')
          } else if (data.totalXP  < 30000) {
            setLeague('Silver')}
          else if (data.totalXP  < 40000) {
            setLeague('Bronze')}
          else {
            setLeague('Gold')};
        }
       

      } catch (error) {
        console.error("Error fetching XP points:", error);
      }
    };

    fetchXP();
  }, []);

  return (
    <View style={styles.profileStats}>
    <View style={styles.statItem}>
      <View style={styles.statBackgroundBlue}>
        <Icon name="star-outline" size={20} color="#515CE6" />
        <Text style={styles.xpText}>{totalXP}</Text>
        <Text style={styles.statLabel}>Total Points</Text>
      </View>
    </View>
    <View style={styles.statItem}>
      <View style={styles.statBackgroundPink}>
        <Icon name="trophy-outline" size={20} color="#FF6B6B" />
        <Text style={styles.leagueText}>{league}</Text>
        <Text style={styles.statLabel}>Current league</Text>
      </View>
    </View>
  </View>
  );
};

export default XPpoints;

