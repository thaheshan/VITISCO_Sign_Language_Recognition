import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView,StatusBar} from 'react-native';

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
      backgroundColor: isDarkMode ? '#4A3F69' : '#4A3F69',
      paddingTop: StatusBar.currentHeight || 20,
      paddingBottom: 15,
      paddingHorizontal: 15
    },
    headerText: {
      color: currentColors.text,
      fontSize: 20,
      fontWeight: 'bold'
    },
    settingsCard: {
      backgroundColor: currentColors.cardBackground,
      borderRadius: 10,
      marginHorizontal: 15,
      marginTop: 15,
      borderWidth: 1,
      borderColor: currentColors.border
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
    profileCard : {
      backgroundColor: currentColors.cardBackground,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
    },
    profileName : {
      color: currentColors.text,
      fontSize: 16,
    },
    sectionTitle: {
      color: currentColors.text,
      fontSize: 14,
      marginBottom: 10
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      
      <View style={styles.profileCard}>
        <View style={styles.settingsItem}>
          <Text style={styles.profileName}>User Name</Text>
        </View>
      </View>

      <View style={styles.settingsCard}>
        <TouchableOpacity style={styles.settingsItem}>
          <Text style={styles.settingsText}>Edit profile</Text>
          <Text style={styles.actionText}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsItem}>
          <Text style={styles.settingsText}>Change password</Text>
          <Text style={styles.actionText}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsItem}>
          <Text style={styles.settingsText}>Add a payment method</Text>
          <Text style={styles.actionText}>{'+'}</Text>
        </TouchableOpacity>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsText}>Push notifications</Text>
          <Switch
            trackColor={{ 
              false: colors.light.switchTrack, 
              true: colors.dark.switchTrack 
            }}
            thumbColor={currentColors.switchThumb}
            ios_backgroundColor={currentColors.switchTrack}
            onValueChange={() => setPushNotifications(!pushNotifications)}
            value={pushNotifications}
          />
        </View>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsText}>Dark mode</Text>
          <Switch
            trackColor={{ 
              false: colors.light.switchTrack, 
              true: colors.dark.switchTrack 
            }}
            thumbColor={currentColors.switchThumb}
            ios_backgroundColor={currentColors.switchTrack}
            onValueChange={() => setIsDarkMode(!isDarkMode)}
            value={isDarkMode}
          />
        </View>
      </View>

      <View style={styles.settingsCard}>
        <TouchableOpacity style={styles.settingsItem}>
          <Text style={styles.settingsText}>About us</Text>
          <Text style={styles.actionText}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsItem}>
          <Text style={styles.settingsText}>Privacy policy</Text>
          <Text style={styles.actionText}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingsItem, styles.lastItem]}>
          <Text style={styles.settingsText}>Terms and conditions</Text>
          <Text style={styles.actionText}>{'>'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;


