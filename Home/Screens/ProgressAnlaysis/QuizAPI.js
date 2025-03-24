import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import StatsCard from './StatsCard';
import axios from 'axios';

// QuizAPI component to fetch and display quiz performance statistics
const QuizAPI = ({ userId, languageName }) => {
  // State to hold the average marks
  const [averageMarks, setAverageMarks] = useState(0);
  // State to hold the average time taken per quiz
  const [averageTime, setAverageTime] = useState(0);

  // useEffect hook to fetch quiz performance data when the component mounts or when userId or languageName changes
  useEffect(() => {
    const fetchQuizPerformance = async () => {
      try {
        // Replace the URL with your API endpoint
        const response = await axios.get('https://backend-18-dot-future-champion-452808-r4.uw.r.appspot.com/user-average', {
          params: {
            userId: userId,
            languageName: languageName,
          },
        });
        const data = response.data;
        // Check if the response contains the expected data
        if (data.averageMarks !== undefined && data.averageTimeMinutes !== undefined) {
          setAverageMarks(data.averageMarks);
          setAverageTime(data.averageTimeMinutes);
        }
      } catch (error) {
        console.error("Error fetching quiz performance:", error);
      }
    };

    fetchQuizPerformance();
  }, [userId, languageName]); // Re-fetch if userId or languageName changes

  // Function to format average marks to 2 decimal places
  const formatAverageMarks = (marks) => {
    if (marks !== undefined) {
      const formattedMarks = parseFloat(marks).toFixed(2); // Format to 2 decimal places
      return parseFloat(formattedMarks); // Return as a number to strip trailing zeroes
    }
    return 0;
  };

  // Function to format average time to 1 decimal place
  const formatAverageTime = (time) => {
    if (time !== undefined) {
      const formattedTime = parseFloat(time).toFixed(1); // Format to 1 decimal place
      return parseFloat(formattedTime); // Return as a number to strip trailing zeroes
    }
    return 0;
  };

  return (
    <View style={styles.quizSection}>
      <Text style={styles.sectionTitle}>Quiz Performance</Text>
      <View style={styles.quizStats}>
        <StatsCard
          icon="check-circle"
          value={`${formatAverageMarks(averageMarks)}%`} // Show correctly formatted marks
          subtitle="Correct Answers"
        />
        <StatsCard
          icon="clock"
          value={`${formatAverageTime(averageTime)}`} // Show correctly formatted time
          subtitle="Minutes per quiz"
        />
      </View>
    </View>
  );
};

export default QuizAPI;