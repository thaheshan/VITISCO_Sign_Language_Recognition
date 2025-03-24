import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import ProgressCard from './ProgressCard'; 
import axios from 'axios';
import styles from './styles';

const ProgressSection = ({ userId, languageName }) => {
   // State to hold the progress data
  const [progressData, setProgressData] = useState([]);
    // State to indicate if the data is loading
  const [loading, setLoading] = useState(true);
  // State to hold any error message
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {

        const response = await axios.get('https://backend-18-dot-future-champion-452808-r4.uw.r.appspot.com//user-progress', {
          params: {
            userId: userId,
            languageName: languageName,
          },
        });
        setProgressData(response.data); // Store the response data
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId, languageName]); // Depend on userId and languageName

    // Display loading message while data is being fetched
  if (loading) {
    return <Text>Loading...</Text>;
  }
   // Display error message if there is an error

  if (error) {
    return <Text>Error: {error}</Text>;
  }
  // Render the progress cards
  return (
    <View style={styles.progressSection}>
      {progressData.map((category) => (
        <ProgressCard
          key={category.categoryName}
          title={category.categoryName}
          progress={category.progress}
          total={category.total}
        />
      ))}
    </View>
  );
};

export default ProgressSection;
