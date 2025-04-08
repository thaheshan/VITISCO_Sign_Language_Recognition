import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import ProgressCard from './ProgressCard'; // Adjust this import based on where your ProgressCard is
import axios from 'axios';
import styles from './styles';
import { Ionicons, Feather } from "@expo/vector-icons";

const ProgressSection = ({ userId, languageName, navigation }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const rotateAnim = new Animated.Value(0);

  // Animation for the add button
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  // Toggle menu function
  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    Animated.spring(rotateAnim, {
      toValue,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Replace the URL with your API endpoint
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

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
      </ScrollView>


    </SafeAreaView>
  );
};

export default ProgressSection;

