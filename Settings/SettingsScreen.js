import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView, StatusBar,
  Modal, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';

const SettingsScreen = () => {
  // State for dark mode and push notifications
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // State for profile editing
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'USER NAME',
    email: '',
    password: '',
    phone: ''
  });
  const [editableProfile, setEditableProfile] = useState({...profileData});

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
      headerBackground: '#4A3F69',
      inputBackground: '#2A2A2A',
      buttonBackground: '#4A3F69',
      buttonText: '#FFFFFF',
      placeholderText: '#666666'
    },
    light: {
      background: '#F0F0F0',
      cardBackground: '#FFFFFF',
      text: '#000000',
      secondaryText: '#888888',
      switchTrack: '#C0C0C0',
      switchThumb: '#FFFFFF',
      border: '#E0E0E0',
      headerBackground: '#4A3F69',
      inputBackground: '#F5F5F5',
      buttonBackground: '#4A3F69',
      buttonText: '#FFFFFF',
      placeholderText: '#BBBBBB'
    }
  };

  // Determine current color based on mode
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // Helper function to render a setting item
  const renderSettingsItem = (label, onPress, icon) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <Text style={[styles.settingsText, {color: currentColors.text}]}>{label}</Text>
      <Text style={[styles.actionIcon, {color: currentColors.secondaryText}]}>{icon}</Text>
    </TouchableOpacity>
  );

  // Handle profile save
  const handleSaveProfile = () => {
    // Basic validation
    if (!editableProfile.name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    
    if (editableProfile.email && !isValidEmail(editableProfile.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    // Update profile data
    setProfileData({...editableProfile});
    setIsEditProfileVisible(false);
    Alert.alert("Success", "Profile updated successfully!");
  };
  
  // Simple email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Edit Profile Modal
  const EditProfileModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isEditProfileVisible}
      onRequestClose={() => setIsEditProfileVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalKeyboardAvoid}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {backgroundColor: currentColors.cardBackground}]}>
            <Text style={[styles.modalTitle, {color: currentColors.text}]}>Edit Profile</Text>
            
            <ScrollView>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>Full Name*</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.inputBackground,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={editableProfile.name}
                  onChangeText={(text) => setEditableProfile({...editableProfile, name: text})}
                  placeholder="Enter your full name"
                  placeholderTextColor={currentColors.placeholderText}
                  autoFocus={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>Email</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.inputBackground,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={editableProfile.email}
                  onChangeText={(text) => setEditableProfile({...editableProfile, email: text})}
                  placeholder="Enter your email address"
                  placeholderTextColor={currentColors.placeholderText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>Password</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.inputBackground,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={editableProfile.password}
                  onChangeText={(text) => setEditableProfile({...editableProfile, password: text})}
                  placeholder="Enter a new password"
                  placeholderTextColor={currentColors.placeholderText}
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>Phone</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.inputBackground,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={editableProfile.phone}
                  onChangeText={(text) => setEditableProfile({...editableProfile, phone: text})}
                  placeholder="Enter your phone number"
                  placeholderTextColor={currentColors.placeholderText}
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: currentColors.buttonBackground}]} 
                onPress={handleSaveProfile}
              >
                <Text style={[styles.buttonText, {color: currentColors.buttonText}]}>Save Changes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: 'transparent', borderWidth: 1, borderColor: currentColors.border}]} 
                onPress={() => setIsEditProfileVisible(false)}
              >
                <Text style={[styles.buttonText, {color: currentColors.text}]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Function to display profile info or placeholder
  const renderProfileSection = () => {
    return (
      <View>
        <Text style={[styles.userNameText, {color: currentColors.text}]}>
          {profileData.name}
        </Text>
        {profileData.email ? (
          <Text style={[styles.emailText, {color: currentColors.secondaryText}]}>
            {profileData.email}
          </Text>
        ) : null}
        <View style={[styles.divider, {backgroundColor: currentColors.border}]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: currentColors.background}]}>
      <StatusBar backgroundColor={currentColors.headerBackground} barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.headerContainer, {backgroundColor: currentColors.headerBackground}]}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      
      {/* Main Container */}
      <View style={[styles.sectionContainer, {backgroundColor: currentColors.cardBackground}]}>
        {/* Profile Section */}
        {renderProfileSection()}

        {/* Account Settings Section */}
        <View>
          <Text style={[styles.sectionTitle, {color: currentColors.secondaryText}]}>Account Settings</Text>
          
          {/* Render setting items for account settings */}
          {renderSettingsItem('Edit profile', () => {
            setEditableProfile({...profileData});
            setIsEditProfileVisible(true);
          }, '>')}
          {renderSettingsItem('Change password', () => {}, '>')}
          {renderSettingsItem('Add a payment method', () => {}, '+')}
          
          {/* Push Notifications */}
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsText, {color: currentColors.text}]}>Push notifications</Text>
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
            <Text style={[styles.settingsText, {color: currentColors.text}]}>Dark mode</Text>
            <Switch
              trackColor={{ false: '#767577', true: currentColors.switchTrack }}
              thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => setIsDarkMode(!isDarkMode)}
              value={isDarkMode}
            />
          </View>

          <View style={[styles.divider, {backgroundColor: currentColors.border}]} />
        </View>

        {/* More Section */}
        <View>
          <Text style={[styles.sectionTitle, {color: currentColors.secondaryText}]}>More</Text>
          {renderSettingsItem('About us', () => {}, '>')}
          {renderSettingsItem('Privacy policy', () => {}, '>')}
          {renderSettingsItem('Terms and conditions', () => {}, '>')}
        </View>
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal />
    </SafeAreaView>
  );
};

// Stylesheet for components
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 23,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    padding: 19
  },
  settingsSection: {
    marginTop: 1,
    paddingVertical: 8
  },
  sectionTitle: {
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
    fontSize: 16
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    paddingTop: 20
  },
  emailText: {
    fontSize: 14,
    textAlign: 'center',
    paddingBottom: 10
  },
  actionIcon: {
    fontSize: 18
  },
  divider: {
    height: 1,
    marginHorizontal: 0,
    marginVertical: 10
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden'
  },
  modalKeyboardAvoid: {
    flex: 1
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 15
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    fontSize: 16
  },
  buttonContainer: {
    flexDirection: 'column',
    marginTop: 10
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500'
  }
});

export default SettingsScreen;



