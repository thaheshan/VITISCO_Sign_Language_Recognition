import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingsScreen = () => {
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const renderSettingsItem = (label, onPress, hasChevron = true) => (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
    >
      <Text style={styles.settingsItemText}>{label}</Text>
      {hasChevron && <Icon name="chevron-forward" size={20} color="#888" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileName}>AYMAN DAS</Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        {renderSettingsItem('Edit profile', () => {/* handle edit profile */})}
        {renderSettingsItem('Change password', () => {/* handle change password */})}
        {renderSettingsItem('Add a payment method', () => {/* handle payment method */}, true)}
        
        <View style={styles.toggleItem}>
          <Text style={styles.settingsItemText}>Push notifications</Text>
          <Switch 
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={pushNotifications ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.toggleItem}>
          <Text style={styles.settingsItemText}>Dark mode</Text>
          <Switch 
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.moreSection}>
        <Text style={styles.sectionTitle}>More</Text>
        {renderSettingsItem('About us', () => {/* handle about us */})}
        {renderSettingsItem('Privacy policy', () => {/* handle privacy policy */})}
        {renderSettingsItem('Terms and conditions', () => {/* handle terms */})}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  profileName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingsSection: {
    backgroundColor: '#1E1E1E',
    marginTop: 10,
    paddingVertical: 10,
  },
  moreSection: {
    backgroundColor: '#1E1E1E',
    marginTop: 10,
    paddingVertical: 10,
  },
  sectionTitle: {
    color: '#888',
    paddingHorizontal: 15,
    paddingBottom: 10,
    fontSize: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  settingsItemText: {
    color: 'white',
    fontSize: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
});

export default SettingsScreen;