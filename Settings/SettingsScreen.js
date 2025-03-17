import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView, StatusBar
} from 'react-native';

const SettingsScreen = () => {
  // State for dark mode and push notifications
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Color scheme based on mode 
  const colors = {
    dark: {
      background: '#121212',
      cardBackground: '#1E1E1E',
      text: '#FFFFFF',
      secondaryText: '#AAAAAA',
      switchTrack: '#4A3F69',
      switchThumb: '#FFFFFF',
      border: '#333333',
      headerBackground: '#4A3F69'
    },
    light: {
      background: '#F0F0F0',
      cardBackground: '#FFFFFF',
      text: '#000000',
      secondaryText: '#888888',
      switchTrack: '#C0C0C0',
      switchThumb: '#FFFFFF',
      border: '#E0E0E0',
      headerBackground: '#4A3F69'
    }
  };

  // Detrmine current color based on mode
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // Helper fuction to render a setting item
  const renderSettingsItem = (label, onPress, icon) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <Text style={styles.settingsText}>{label}</Text>
      <Text style={styles.actionIcon}>{icon}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={currentColors.headerBackground} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      
      {/* Main Container */}
      <View style={styles.sectionContainer}>
        {/* Profile Section */}
        <View>
          <Text style={styles.userNameText}>USER NAME</Text>
          <View style={styles.divider} />
        </View>

        {/* Account Settings Section */}
        <View>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          {/* Render setting items for account settings */}
          {renderSettingsItem('Edit profile', () => {}, '>')}
          {renderSettingsItem('Change password', () => {}, '>')}
          {renderSettingsItem('Add a payment method', () => {}, '+')}
          
          {/* Push Notifications */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsText}>Push notifications</Text>
            <Switch
              trackColor={{ false: '#767577', true: currentColors.switchTrack }}
              thumbColor={pushNotifications ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => setPushNotifications(!pushNotifications)}
              value={pushNotifications}
            />
          </View>
          
          {/* Dark Mode */}
          <View style={[styles.settingsItem, styles.lastItem]}>
            <Text style={styles.settingsText}>Dark mode</Text>
            <Switch
              trackColor={{ false: '#767577', true: currentColors.switchTrack }}
              thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => setIsDarkMode(!isDarkMode)}
              value={isDarkMode}
            />
          </View>

          <View style={styles.divider} />
        </View>

        {/* More Section */}
        <View>
          <Text style={styles.sectionTitle}>More</Text>
          {renderSettingsItem('About us', () => {}, '>')}
          {renderSettingsItem('Privacy policy', () => {}, '>')}
          {renderSettingsItem('Terms and conditions', () => {}, '>')}
        </View>
      </View>
    </SafeAreaView>
  );
};

// Stylesheet for components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentColors.background
  },
  headerContainer: {
    backgroundColor: currentColors.headerBackground,
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 23,
    fontWeight: 'bold',
    alignSelf: 'left',
    padding: 19
  },
  settingsSection: {
    backgroundColor: currentColors.cardBackground,
    marginTop: 1,
    paddingVertical: 8
  },
  profileSection: {
    backgroundColor: currentColors.cardBackground,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden'
  },
  sectionTitle: {
    color: currentColors.secondaryText,
    fontSize: 16,
    marginBottom: 5,
    marginTop: 5,
    marginLeft: 20,
    fontWeight: '500'
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  lastItem: {
    borderBottomWidth: 0
  },
  settingsText: {
    color: currentColors.text,
    fontSize: 16
  },
  userNameText: {
    color: currentColors.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20
  },
  actionIcon: {
    color: currentColors.secondaryText,
    fontSize: 18
  },
  divider: {
    height: 2,
    backgroundColor: currentColors.border,
    marginHorizontal: 0
  },
  sectionContainer: {
    backgroundColor: currentColors.cardBackground,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden'
  }
});

export default SettingsScreen;




