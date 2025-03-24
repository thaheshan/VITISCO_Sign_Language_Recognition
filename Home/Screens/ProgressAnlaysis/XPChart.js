import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import styles from './styles';

const XPChart = () => {
  // State to hold the chart data
  const [data, setData] = useState({ weeklyData: { labels: [], datasets: [{ data: [] }] } });
  // State to track loading state
  const [loading, setLoading] = useState(true);
  // Get the width of the window for responsive chart
  const width = Dimensions.get('window').width;
  // User ID for fetching data
  const userId = 7;

  // useEffect hook to fetch XP data when the component mounts
  useEffect(() => {
    const fetchXPData = async () => {
      try {
        // Replace the URL with your API endpoint
        const response = await axios.get(`https://backend-18-dot-future-champion-452808-r4.uw.r.appspot.com/userXPchart/${userId}`);
        // Store the response data
        setData({ weeklyData: response.data });
      } catch (error) {
        console.error("Error fetching XP chart data:", error);
      } finally {
        // Set loading to false after fetching
        setLoading(false);
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

  // Render the line chart with the fetched data
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