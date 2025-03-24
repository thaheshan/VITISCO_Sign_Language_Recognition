import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const XPpoints = () => {
  // State to hold the total XP points
  const [totalXP, setTotalXP] = useState(0);
  // State to hold the league based on XP points
  const [league, setLeague] = useState(null);
  // User ID for fetching data
  const userId = 2;

  // useEffect hook to fetch XP points when the component mounts
  useEffect(() => {
    const fetchXP = async () => {
      try {
        // Replace the URL with your API endpoint
        const response = await fetch(`https://backend-18-dot-future-champion-452808-r4.uw.r.appspot.com/user-xp/${userId}`);
        const data = await response.json();
        // Check if the response contains the expected data
        if (data.totalXP !== undefined) {
          setTotalXP(data.totalXP);
          // Determine the league based on total XP points
          if (data.totalXP < 1500) {
            setLeague('Beginner');
          } else if (data.totalXP < 30000) {
            setLeague('Silver');
          } else if (data.totalXP < 40000) {
            setLeague('Bronze');
          } else {
            setLeague('Gold');
          }
        }
      } catch (error) {
        console.error("Error fetching XP points:", error);
      }
    };

    fetchXP();
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    <View style={styles.profileStats}>
      <View style={styles.statItem}>
        <View style={styles.statBackgroundBlue}>
          {/* Display an icon for total points */}
          <Icon name="star-outline" size={20} color="#515CE6" />
          {/* Display the total XP points */}
          <Text style={styles.xpText}>{totalXP}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
      </View>
      <View style={styles.statItem}>
        <View style={styles.statBackgroundPink}>
          {/* Display an icon for the current league */}
          <Icon name="trophy-outline" size={20} color="#FF6B6B" />
          {/* Display the current league */}
          <Text style={styles.leagueText}>{league}</Text>
          <Text style={styles.statLabel}>Current league</Text>
        </View>
      </View>
    </View>
  );
};

export default XPpoints;