
import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import styles from './styles';

const XPChart = () => {
  const [data, setData] = useState({ weeklyData: { labels: [], datasets: [{ data: [] }] } });
  const [loading, setLoading] = useState(true); // Track loading state
  const width = Dimensions.get('window').width;
  const userId = 7;

  useEffect(() => {
    const fetchXPData = async () => {
      try {
        const response = await axios.get(`https://backend-18-dot-future-champion-452808-r4.uw.r.appspot.com//userXPchart/${userId}`);
        setData({ weeklyData: response.data });
      } catch (error) {
        console.error("Error fetching XP chart data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchXPData();
  }, [userId]);

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Weekly progress</Text>
        <ActivityIndicator size="large" color="#517CE6" />
      </View>
    );
  }

  return (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>Weekly progress</Text>
      <LineChart
        data={data.weeklyData}
        width={width - 40}
        height={200}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(81, 92, 230, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

export default XPChart;
