
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Challenges = () => {
  // State to hold the list of challenges
  const [challenges, setChallenges] = useState([]);
   // State to hold the progress of the challenges
  const [progress, setProgress] = useState(1);
  // State to indicate if the challenges are completed
  const [completed, setCompleted] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        // Fetch challenges from the API
        const response = await fetch('https://future-champion-452808-r4.uw.r.appspot.com/weekly-challenges');
        const data = await response.json();
        // Set the fetched challenges to the state
        setChallenges(data); // assuming the API returns an array of challenges
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, []);

  return (
    <View>
      {challenges.map((challenge) => {
        const completed = false; // Define the completed variable as needed
        return (
          <View key={challenge.challengeId} style={styles.rewardCard}>
            <View style={styles.rewardLeft}>
              <View style={[styles.rewardIconContainer, { backgroundColor: completed ? '#4C4469' : '#4C88FF' }]}>
                <Icon
                  name={
                     // Determine the icon based on the challenge title
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
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              </View>
            </View>
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>{challenge.XPPoints} XP</Text>
              {completed && <Icon name="check-circle" size={22} color="green" /> }
            </View>
          </View>
        );
      })}
    </View>  );
};

export default Challenges;