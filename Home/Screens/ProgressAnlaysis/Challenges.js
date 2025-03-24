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

  // useEffect hook to fetch challenges when the component mounts
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        // Fetch challenges from the API
        const response = await fetch('https://backend-18-dot-future-champion-452808-r4.uw.r.appspot.com/weekly-challenges');
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
        // Define the completed variable as needed
        const completed = false;
        return (
          <View key={challenge.challengeId} style={styles.rewardCard}>
            <View style={styles.rewardLeft}>
              {/* Icon container with dynamic background color based on completion status */}
              <View style={[styles.rewardIconContainer, { backgroundColor: completed ? '#4C4469' : '#4C88FF' }]}>
                {/* Display an icon based on the challenge title */}
                <Icon
                  name={
                    challenge.title.includes('Learn') ? 'school' :
                    challenge.title.includes('Quiz') ? 'lightbulb-auto' :
                    challenge.title.includes('Compete') ? 'human-greeting-variant' : 'trophy-outline'
                  }
                  size={20}
                  color="white"
                />
              </View>
              <View style={styles.rewardContent}>
                {/* Display the title of the challenge */}
                <Text style={styles.rewardTitle}>{challenge.title}</Text>
                {/* Display the description of the challenge */}
                <Text style={styles.rewardDescription}>{challenge.description}</Text>
                {/* Display the progress bar with the width based on the progress percentage */}
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              </View>
            </View>
            <View style={styles.xpContainer}>
              {/* Display the XP points */}
              <Text style={styles.xpText}>{challenge.XPPoints} XP</Text>
              {/* Display a check-circle icon if the challenge is completed */}
              {completed && <Icon name="check-circle" size={22} color="green" />}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default Challenges;