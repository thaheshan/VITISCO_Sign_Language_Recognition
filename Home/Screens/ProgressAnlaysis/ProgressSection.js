import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import ProgressCard from './ProgressCard'; // Adjust this import based on where your ProgressCard is
import axios from 'axios';
import styles from './styles';

const ProgressSection = ({ userId, languageName }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Replace the URL with your API endpoint
        const response = await axios.get('https://future-champion-452808-r4.uw.r.appspot.com/user-progress', {
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

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

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
