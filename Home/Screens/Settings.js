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

  // State for password change
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for payment method
  const [isAddPaymentVisible, setIsAddPaymentVisible] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });

  // State for About Us modal
  const [isAboutUsVisible, setIsAboutUsVisible] = useState(false);
  
  // State for Terms and Conditions modal
  const [isTermsVisible, setIsTermsVisible] = useState(false);

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
  
  // Handle password change
  const handleChangePassword = () => {
    // Basic validation
    if (!passwordData.currentPassword.trim()) {
      Alert.alert("Error", "Current password cannot be empty");
      return;
    }
    
    if (!passwordData.newPassword.trim()) {
      Alert.alert("Error", "New password cannot be empty");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    
    // Minimum password length check
    if (passwordData.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }
    
    // In a real app, you would verify the current password and update with the new one
    // For this example, we'll just show a success message
    
    // Reset form and close modal
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangePasswordVisible(false);
    Alert.alert("Success", "Password changed successfully!");
  };

  // Handle payment method save
  const handleSavePaymentMethod = () => {
    // Basic validation
    if (!paymentData.cardNumber.trim()) {
      Alert.alert("Error", "Card number cannot be empty");
      return;
    }
    
    if (!paymentData.cardholderName.trim()) {
      Alert.alert("Error", "Cardholder name cannot be empty");
      return;
    }
    
    if (!paymentData.expiryDate.trim()) {
      Alert.alert("Error", "Expiry date cannot be empty");
      return;
    }
    
    if (!paymentData.cvv.trim()) {
      Alert.alert("Error", "CVV cannot be empty");
      return;
    }
    
    // Validate card number (simple check for length)
    if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert("Error", "Card number must be 16 digits");
      return;
    }
    
    // Validate expiry date format (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(paymentData.expiryDate)) {
      Alert.alert("Error", "Expiry date must be in MM/YY format");
      return;
    }
    
    // Validate CVV (3 or 4 digits)
    if (!/^[0-9]{3,4}$/.test(paymentData.cvv)) {
      Alert.alert("Error", "CVV must be 3 or 4 digits");
      return;
    }
    
    // In a real app, you would send this data securely to your backend
    // Reset form and close modal
    setPaymentData({
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: ''
    });
    setIsAddPaymentVisible(false);
    Alert.alert("Success", "Payment method added successfully!");
  };

  // Format card number with spaces
  const formatCardNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Format with spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };
  
  // Simple email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password Change Modal
  const ChangePasswordModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isChangePasswordVisible}
      onRequestClose={() => setIsChangePasswordVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalKeyboardAvoid}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {backgroundColor: currentColors.cardBackground}]}>
            <Text style={[styles.modalTitle, {color: currentColors.text}]}>Change Password</Text>
            
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>Current Password*</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.inputBackground,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({...passwordData, currentPassword: text})}
                  placeholder="Enter your current password"
                  placeholderTextColor={currentColors.placeholderText}
                  secureTextEntry={true}
                  autoFocus={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>New Password*</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.inputBackground,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
                  placeholder="Enter your new password"
                  placeholderTextColor={currentColors.placeholderText}
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>Confirm New Password*</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.inputBackground,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
                  placeholder="Confirm your new password"
                  placeholderTextColor={currentColors.placeholderText}
                  secureTextEntry={true}
                />
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: currentColors.buttonBackground}]} 
                onPress={handleChangePassword}
              >
                <Text style={[styles.buttonText, {color: currentColors.buttonText}]}>Update Password</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: 'transparent', borderWidth: 1, borderColor: currentColors.border}]} 
                onPress={() => setIsChangePasswordVisible(false)}
              >
                <Text style={[styles.buttonText, {color: currentColors.text}]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

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
            
            <ScrollView keyboardShouldPersistTaps="handled" >
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

  // Add Payment Method Modal
  const AddPaymentMethodModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isAddPaymentVisible}
      onRequestClose={() => setIsAddPaymentVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalKeyboardAvoid}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {backgroundColor: currentColors.cardBackground}]}>
            <Text style={[styles.modalTitle, {color: currentColors.text}]}>Add Payment Method</Text>
            
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>Card Number*</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.inputBackground,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={paymentData.cardNumber}
                  onChangeText={(text) => {
                    const formatted = formatCardNumber(text);
                    setPaymentData({...paymentData, cardNumber: formatted});
                  }}
                  placeholder=""
                  placeholderTextColor={currentColors.placeholderText}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>Cardholder Name*</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.inputBackground,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={paymentData.cardholderName}
                  onChangeText={(text) => setPaymentData({...paymentData, cardholderName: text})}
                  placeholder=""
                  placeholderTextColor={currentColors.placeholderText}
                />
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
                  <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>Expiry Date (MM/YY)*</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: currentColors.inputBackground,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }]}
                    value={paymentData.expiryDate}
                    onChangeText={(text) => {
                      // Format as MM/YY
                      let formatted = text.replace(/\D/g, '');
                      if (formatted.length > 2) {
                        formatted = `${formatted.substring(0, 2)}/${formatted.substring(2, 4)}`;
                      }
                      setPaymentData({...paymentData, expiryDate: formatted});
                    }}
                    placeholder="MM/YY"
                    placeholderTextColor={currentColors.placeholderText}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputContainer, {flex: 1}]}>
                  <Text style={[styles.inputLabel, {color: currentColors.secondaryText}]}>CVV*</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: currentColors.inputBackground,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }]}
                    value={paymentData.cvv}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/\D/g, '');
                      setPaymentData({...paymentData, cvv: cleaned});
                    }}
                    placeholder="123"
                    placeholderTextColor={currentColors.placeholderText}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={true}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: currentColors.buttonBackground}]} 
                onPress={handleSavePaymentMethod}
              >
                <Text style={[styles.buttonText, {color: currentColors.buttonText}]}>Add Payment Method</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: 'transparent', borderWidth: 1, borderColor: currentColors.border}]} 
                onPress={() => setIsAddPaymentVisible(false)}
              >
                <Text style={[styles.buttonText, {color: currentColors.text}]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // About Us Modal
  const AboutUsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isAboutUsVisible}
      onRequestClose={() => setIsAboutUsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, {backgroundColor: currentColors.cardBackground}]}>
          <Text style={[styles.modalTitle, {color: currentColors.text}]}>About Us</Text>
          
          <ScrollView>
            <Text style={[styles.aboutUsText, {color: currentColors.text}]}>
              Vitisco is an innovative language-learning platform designed to empower the Deaf and Hard of Hearing (DHH) community. Our goal is to bridge the communication gap by integrating AI-driven Sri Lankan Sign Language (SLSL) recognition with a gamified learning experience. Through interactive lessons, real-time feedback, and a personalized learning path, we ensure an engaging and inclusive environment. Our commitment extends to accessibility, inclusivity, and user-centric design, making language learning a fun and rewarding journey for all.
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, {backgroundColor: currentColors.buttonBackground}]} 
              onPress={() => setIsAboutUsVisible(false)}
            >
              <Text style={[styles.buttonText, {color: currentColors.buttonText}]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Terms and Conditions Modal
  const TermsAndConditionsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isTermsVisible}
      onRequestClose={() => setIsTermsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, {backgroundColor: currentColors.cardBackground}]}>
          <Text style={[styles.modalTitle, {color: currentColors.text}]}>Terms and Conditions</Text>
          
          <ScrollView>
            <View style={styles.termsSection}>
              <Text style={[styles.termTitle, {color: currentColors.text}]}>1. Acceptance of Terms</Text>
              <Text style={[styles.termText, {color: currentColors.text}]}>
                By accessing and using Vitisco, you agree to comply with these terms and conditions.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={[styles.termTitle, {color: currentColors.text}]}>2. User Conduct</Text>
              <Text style={[styles.termText, {color: currentColors.text}]}>
                Users must engage respectfully and ethically while using the platform. Any misuse, such as harmful or disruptive behavior, may result in account suspension.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={[styles.termTitle, {color: currentColors.text}]}>3. Intellectual Property</Text>
              <Text style={[styles.termText, {color: currentColors.text}]}>
                All content, including AI models, gamified features, and sign language resources, is owned by Vitisco and cannot be replicated without permission.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={[styles.termTitle, {color: currentColors.text}]}>4. Data Usage</Text>
              <Text style={[styles.termText, {color: currentColors.text}]}>
                User data is collected solely to improve the platform experience and will be protected under our Privacy Policy.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={[styles.termTitle, {color: currentColors.text}]}>5. Service Modifications</Text>
              <Text style={[styles.termText, {color: currentColors.text}]}>
                We reserve the right to modify or discontinue features without prior notice.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={[styles.termTitle, {color: currentColors.text}]}>6. Liability Limitation</Text>
              <Text style={[styles.termText, {color: currentColors.text}]}>
                Vitisco is provided on an "as is" basis. We are not liable for any technical issues or data loss caused by third-party services.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, {backgroundColor: currentColors.buttonBackground}]} 
              onPress={() => setIsTermsVisible(false)}
            >
              <Text style={[styles.buttonText, {color: currentColors.buttonText}]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
          {renderSettingsItem('Change password', () => {
            setPasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
            setIsChangePasswordVisible(true);
          }, '>')}
          {renderSettingsItem('Add a payment method', () => {
            setPaymentData({
              cardNumber: '',
              cardholderName: '',
              expiryDate: '',
              cvv: ''
            });
            setIsAddPaymentVisible(true);
          }, '+')}
          
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
          {renderSettingsItem('About us', () => setIsAboutUsVisible(true), '>')}
          {renderSettingsItem('Privacy policy', () => {}, '>')}
          {renderSettingsItem('Terms and conditions', () => setIsTermsVisible(true), '>')}
        </View>
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal />
      
      {/* Change Password Modal */}
      <ChangePasswordModal />

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal />

      {/* About Us Modal */}
      <AboutUsModal />
      
      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal />
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
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  aboutUsText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 15
  }
});

export default SettingsScreen;