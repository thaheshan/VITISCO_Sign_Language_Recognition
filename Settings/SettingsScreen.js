import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView, StatusBar
} from 'react-native';

const SettingsScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Color scheme based on mode
  const colors = {
    dark: {
      background: '#121212',
      cardBackground: '#1E1E1E',
      text: '#FFFFFF',
      switchTrack: '#4A4A4A',
      switchThumb: '#FFFFFF',
      border: '#4A4A4A'
    },
    light: {
      background: '#F0F0F0',
      cardBackground: '#FFFFFF',
      text: '#000000',
      switchTrack: '#C0C0C0',
      switchThumb: '#FFFFFF',
      border: '#E0E0E0'
    }
  };

  const currentColors = isDarkMode ? colors.dark : colors.light;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentColors.background
    },
    headerContainer: {
      backgroundColor: '#4A3F69',
      paddingTop: StatusBar.currentHeight || 20,
      paddingBottom: 15,
      paddingHorizontal: 15,
    },
    headerText: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      alignSelf: 'center',
      padding: 15
    },
    settingsSection: {
      backgroundColor: currentColors.cardBackground,
      borderRadius: 10,
      marginHorizontal: 15,
      marginTop: 15,
      borderWidth: 1,
      borderColor: currentColors.border,
      padding: 15
    },
    sectionTitle: {
      color: currentColors.text,
      fontSize: 14,
      marginBottom: 10,
      fontWeight: 'bold'
    },
    settingsItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: currentColors.border
    },
    lastItem: {
      borderBottomWidth: 0
    },
    settingsText: {
      color: currentColors.text,
      fontSize: 16
    },
    actionText: {
      color: '#888888'
    }
  });

  const renderSettingsItem = (label, onPress, icon) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <Text style={styles.settingsText}>{label}</Text>
      {icon && <Text style={styles.actionText}>{icon}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      
      {/* Profile Section */}
      <View style={styles.settingsSection}>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsText}>User Name</Text>
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        {renderSettingsItem('Edit profile', () => {/* handle edit profile */}, '>')}
        {renderSettingsItem('Change password', () => {/* handle change password */}, '>')}
        {renderSettingsItem('Add a payment method', () => {/* handle payment method */}, '+')}

        {/* Push Notifications */}
        <View style={styles.settingsItem}>
          <Text style={styles.settingsText}>Push notifications</Text>
          <Switch
            trackColor={{ false: colors.light.switchTrack, true: colors.dark.switchTrack }}
            thumbColor={currentColors.switchThumb}
            ios_backgroundColor={currentColors.switchTrack}
            onValueChange={() => setPushNotifications(!pushNotifications)}
            value={pushNotifications}
          />
        </View>

        {/* Dark Mode */}
        <View style={[styles.settingsItem, styles.lastItem]}>
          <Text style={styles.settingsText}>Dark mode</Text>
          <Switch
            trackColor={{ false: colors.light.switchTrack, true: colors.dark.switchTrack }}
            thumbColor={currentColors.switchThumb}
            ios_backgroundColor={currentColors.switchTrack}
            onValueChange={() => setIsDarkMode(!isDarkMode)}
            value={isDarkMode}
          />
        </View>
      </View>

      {/* Legal & About */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}> More </Text>
        {renderSettingsItem('About us', () => {/* handle about us */}, '>')}
        {renderSettingsItem('Privacy policy', () => {/* handle privacy policy */}, '>')}
        {renderSettingsItem('Terms and conditions', () => {/* handle terms */}, '>')}
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;




