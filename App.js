import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProgressAnalysis({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vitisco: Learn Languages</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Progress')}>
        <Text style={styles.buttonText}>View Progress</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Feedback')}>
        <Text style={styles.buttonText}>Give Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, marginVertical: 10 },
  buttonText: { color: 'white', fontSize: 18 }
});
