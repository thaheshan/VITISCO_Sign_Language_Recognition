import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Alert,
  Modal,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Update your API base URL to work with Expo Go
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://192.168.58.40:5000';  // Use your actual IP address

// Logo component with animation
const Logo = ({ small = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    
    return () => animation.stop();
  }, []);
  
  return (
    <View style={small ? styles.smallLogoContainer : styles.logoContainer}>
      <Animated.Image
        source={require('../assets/vitisco logo PNG.png')}
        style={[
          small ? styles.smallLogo : styles.logo,
          { transform: [{ scale: scaleAnim }] },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

// Validation message popup component
const ValidationPopup = ({ visible, message, onClose }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons name="alert-circle" size={40} color="#FF5252" />
          <Text style={styles.modalText}>{message}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const LoginScreen = ({navigation}) => {
  // Screen state management
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [createAccountStep, setCreateAccountStep] = useState(1);
  
  // Form visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [profileName, setProfileName] = useState('');
  const [birthDate, setBirthDate] = useState('18/03/2024');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('male');
  const [otp, setOtp] = useState(['', '', '', '']);
  
  // Validation popup state
  const [validationPopup, setValidationPopup] = useState({
    visible: false,
    message: ''
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // API data
  const [apiMessage, setApiMessage] = useState('Loading...');
  const [apiError, setApiError] = useState('');
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Fetch data from API with proper error handling for Expo Go
  useEffect(() => {
    if (currentScreen === 'welcome') {
      console.log("Attempting to connect to:", `${API_BASE_URL}/api/message`);
      axios.get(`${API_BASE_URL}/api/message`)
        .then(response => {
          console.log("API Connection successful:", response.data);
          setApiMessage(response.data.message);
          setApiError('');
        })
        .catch(error => {
          console.log("API Connection failed with error:", error.message);
          
          // More detailed error logging
          if (error.response) {
            console.log("Server responded with error:", error.response.status, error.response.data);
          } else if (error.request) {
            console.log("No response received, network issue likely");
          } else {
            console.log("Error setting up request:", error.message);
          }
          
          setApiError("Could not connect to server. Please try again later.");
        });
    }
  }, [currentScreen]);

  useEffect(() => {
    // Run animation when screen changes
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentScreen, createAccountStep]);

  // Show validation popup
  const showValidation = (message) => {
    setValidationPopup({
      visible: true,
      message: message
    });
  };

  // Close validation popup
  const closeValidation = () => {
    setValidationPopup({
      ...validationPopup,
      visible: false
    });
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const isValidPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  // Phone number validation
  const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
  };

  // OTP input handler - Modified for React Native
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto focus next input
    if (text && index < 3 && otpInputRefs[index + 1]) {
      otpInputRefs[index + 1].focus();
    }
  };

  // Create refs for OTP inputs
  const otpInputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Handle login
  const handleLogin = () => {
    // Validate inputs
    if (!username) {
      showValidation("Please enter your username");
      return;
    }
    
    if (!password) {
      showValidation("Please enter your password");
      return;
    }
    
    console.log('Login pressed with:', { username, password });
    
    // Show loading state
    setIsLoading(true);
    
    axios.post(`${API_BASE_URL}/api/login`, { username, password })
      .then(response => {
        console.log('Login response:', response.data);
        setIsLoading(false);
        // Navigate to Home screen upon successful login
        navigation.navigate("Home", {}, { animation: 'slide_from_right' });
      })
      .catch(error => {
        setIsLoading(false);
        console.log('Login error:', error);
        // Show error message to user
        if (error.response) {
          showValidation(error.response.data.error || 'Login failed');
        } else if (error.request) {
          showValidation('Network error - check your connection');
          console.log('Network error details:', error.request);
        } else {
          showValidation('An error occurred during login');
        }
      });
  };

  // Validate signup step 1
  const validateSignupStep1 = () => {
    if (!username) {
      showValidation("Please enter a username");
      return false;
    }
    
    if (!email) {
      showValidation("Please enter your email");
      return false;
    }
    
    if (!isValidEmail(email)) {
      showValidation("Please enter a valid email address");
      return false;
    }
    
    if (!password) {
      showValidation("Please enter a password");
      return false;
    }
    
    if (!isValidPassword(password)) {
      showValidation("Password must be at least 8 characters and include uppercase, lowercase, and a number");
      return false;
    }
    
    if (password !== confirmPassword) {
      showValidation("Passwords don't match");
      return false;
    }
    
    return true;
  };

  // Validate signup step 2
  const validateSignupStep2 = () => {
    if (!profileName) {
      showValidation("Please enter your profile name");
      return false;
    }
    
    if (!phoneNumber) {
      showValidation("Please enter your phone number");
      return false;
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
      showValidation("Please enter a valid phone number");
      return false;
    }
    
    return true;
  };

  // Validate signup step 3
  const validateSignupStep3 = () => {
    if (!nativeLanguage) {
      showValidation("Please enter your native language");
      return false;
    }
    
    if (!preferredLanguage) {
      showValidation("Please enter your preferred language");
      return false;
    }
    
    return true;
  };

  // Validate forgot password
  const validateForgotPassword = () => {
    if (!email) {
      showValidation("Please enter your email");
      return false;
    }
    
    if (!isValidEmail(email)) {
      showValidation("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  // Validate OTP
  const validateOtp = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      showValidation("Please enter the complete 4-digit code");
      return false;
    }
    
    return true;
  };

  // Validate reset password
  const validateResetPassword = () => {
    if (!password) {
      showValidation("Please enter a new password");
      return false;
    }
    
    if (!isValidPassword(password)) {
      showValidation("Password must be at least 8 characters and include uppercase, lowercase, and a number");
      return false;
    }
    
    if (password !== confirmPassword) {
      showValidation("Passwords don't match");
      return false;
    }
    
    return true;
  };

  // Welcome Screen
  const WelcomeScreen = () => (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.logoSection}>
        <Logo />
        <Text style={styles.brandName}>VITISCO</Text>
        {apiMessage && <Text style={styles.apiMessageText}>{apiMessage}</Text>}
        {apiError && <Text style={styles.apiErrorText}>{apiError}</Text>}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setCurrentScreen('login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText} >LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            setCurrentScreen('signup');
            setCreateAccountStep(1);
          }}
          activeOpacity={0.86}
        >
          <Text style={styles.buttonText}>SIGNUP</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.textButton}
          activeOpacity={0.65}
        >
          <Text style={styles.aboutText}>About Us</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Login Screen
  const LoginScreenComponent = () => (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.brandText}>VITISCO</Text>
      </View>
      <View style={styles.logoSection}>
        <Logo />
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={24} 
              color="#666"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.textButton}
          onPress={() => setCurrentScreen('forgotPassword')}
          activeOpacity={0.6}
        >
          <Text style={styles.forgotPassword}>forgot password?</Text>
        </TouchableOpacity>
        <Text style={styles.orText}>Or sign in with</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <Image 
              source={require('../assets/vitisco logo PNG.png')} 
              style={styles.socialIcon} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <Image 
              source={require('../assets/vitisco logo PNG.png')} 
              style={styles.socialIcon} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <Image 
              source={require('../assets/vitisco logo PNG.png')} 
              style={styles.socialIcon} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <Image 
              source={require('../assets/vitisco logo PNG.png')} 
              style={styles.socialIcon} 
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "LOGGING IN..." : "LOGIN"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('welcome')}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
    </Animated.View>
  );

  // Create Account Step 1
  const CreateAccountStep1 = () => (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.smallLogoContainer}>
        <Logo small />
      </View>
      <Text style={styles.createAccountTitle}>CREATE ACCOUNT</Text>
      <View style={styles.formContainerWithIndicator}>
        <Text style={styles.stepIndicator}>1 of 3</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={24} 
              color="#666"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
              size={24} 
              color="#666"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.passwordRequirements}>
          * Password must be at least 8 characters with uppercase, lowercase, and numbers
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            if (validateSignupStep1()) {
              setCreateAccountStep(2);
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('welcome')}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
    </Animated.View>
  );

  // Create Account Step 2 (Profile Details)
  const CreateAccountStep2 = () => (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.smallLogoContainer}>
        <Logo small />
      </View>
      <Text style={styles.createAccountTitle}>CREATE ACCOUNT</Text>
      <View style={styles.formContainerWithIndicator}>
        <Text style={styles.stepIndicator}>2 of 3</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Profile Name"
            placeholderTextColor="#666"
            value={profileName}
            onChangeText={setProfileName}
          />
        </View>
        
        <Text style={styles.formLabel}>Birth of date</Text>
        <TouchableOpacity style={styles.datePickerButton}>
          <Text style={styles.dateText}>{birthDate}</Text>
          <Ionicons name="calendar-outline" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.formLabel}>Phone Number</Text>
        <View style={styles.phoneInputContainer}>
          <TouchableOpacity style={styles.countryCodeButton}>
            <Image 
              source={require('../assets/favicon.png')} 
              style={styles.flagIcon} 
            />
            <Text style={styles.countryCodeText}>+</Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </TouchableOpacity>
          <TextInput
            style={styles.phoneInput}
            placeholder="Phone Number"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>
        
        <View style={styles.genderContainer}>
          <TouchableOpacity 
            style={[
              styles.genderButton, 
              gender === 'male' && styles.genderButtonActive
            ]}
            onPress={() => setGender('male')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="man-outline" 
              size={24} 
              color={gender === 'male' ? "#fff" : "#333"} 
            />
            <Text style={gender === 'male' ? styles.genderTextActive : styles.genderText}>
              Male
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.genderButton, 
              gender === 'female' && styles.genderButtonActive
            ]}
            onPress={() => setGender('female')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="woman-outline" 
              size={24} 
              color={gender === 'female' ? "#fff" : "#333"} 
            />
            <Text style={gender === 'female' ? styles.genderTextActive : styles.genderText}>
              Female
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            if (validateSignupStep2()) {
              setCreateAccountStep(3);
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCreateAccountStep(1)}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
    </Animated.View>
  );

  // Create Account Step 3 (Language Preferences)
  const CreateAccountStep3 = () => (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.smallLogoContainer}>
        <Logo small />
      </View>
      <Text style={styles.createAccountTitle}>CREATE ACCOUNT</Text>
      <View style={styles.formContainerWithIndicator}>
        <Text style={styles.stepIndicator}>3 of 3</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="language-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Native Language"
            placeholderTextColor="#666"
            value={nativeLanguage}
            onChangeText={setNativeLanguage}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="language-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Preferred Language"
            placeholderTextColor="#666"
            value={preferredLanguage}
            onChangeText={setPreferredLanguage}
          />
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            if (validateSignupStep3()) {
              // Complete signup process via API
              const userData = {
                username,
                email,
                password,
                profileName,
                birthDate,
                phoneNumber,
                gender,
                nativeLanguage,
                preferredLanguage
              };
              
              console.log('Signup data:', userData);
              setIsLoading(true);
              
              // API call for signup
              axios.post(`${API_BASE_URL}/api/signup`, userData)
                .then(response => {
                  setIsLoading(false);
                  console.log('Signup response:', response.data);
                  showValidation("Account created successfully! Please login.");
                  setTimeout(() => {
                    setCurrentScreen('login');
                  }, 2000);
                })
                .catch(error => {
                  setIsLoading(false);
                  console.log('Signup error:', error);
                  if (error.response) {
                    showValidation(error.response.data.error || 'Signup failed');
                  } else {
                    showValidation('Network error - check your connection');
                  }
                });
            }
          }}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "CREATING ACCOUNT..." : "Finish"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCreateAccountStep(2)}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
    </Animated.View>
  );

  // Forgot Password Screen
  const ForgotPasswordScreen = () => (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.smallLogoContainer}>
        <Logo small />
      </View>
      <Text style={styles.createAccountTitle}>RESET PASSWORD</Text>
      <View style={styles.formContainerWithIndicator}>
        <Text style={styles.forgotPasswordText}>
          Enter your email to receive a password reset code
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#333" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            if (validateForgotPassword()) {
              // Request OTP via API
              setIsLoading(true);
              axios.post(`${API_BASE_URL}/api/request-otp`, { email })
                .then(response => {
                  setIsLoading(false);
                  console.log('OTP request response:', response.data);
                  setCurrentScreen('verifyOtp');
                })
                .catch(error => {
                  setIsLoading(false);
                  console.log('OTP request error:', error);
                  if (error.response) {
                    showValidation(error.response.data.error || 'Failed to send OTP');
                  } else {
                    showValidation('Network error - check your connection');
                  }
                });
            }
          }}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "SENDING..." : "Send OTP"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('login')}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
    </Animated.View>
  );

// OTP Verification Screen (continued)
const OtpVerificationScreen = () => (
  <Animated.View 
    style={[
      styles.container,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}
  >
    <StatusBar barStyle="dark-content" />
    <View style={styles.smallLogoContainer}>
      <Logo small />
    </View>
    <Text style={styles.createAccountTitle}>VERIFY OTP</Text>
    <View style={styles.formContainerWithIndicator}>
      <Text style={styles.forgotPasswordText}>
        Enter the verification code sent to your email
      </Text>
      <View style={styles.otpContainer}>
        {[0, 1, 2, 3].map((i) => (
          <TextInput
            key={i}
            ref={otpInputRefs[i]}
            style={styles.otpInput}
            maxLength={1}
            keyboardType="number-pad"
            value={otp[i]}
            onChangeText={(text) => handleOtpChange(text, i)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !otp[i] && i > 0 && otpInputRefs[i - 1]) {
                otpInputRefs[i - 1].focus();
              }
            }}
          />
        ))}
      </View>
      <TouchableOpacity 
        style={styles.textButton}
        onPress={() => {
          // Resend OTP logic
          setIsLoading(true);
          axios.post(`${API_BASE_URL}/api/resend-otp`, { email })
            .then(response => {
              setIsLoading(false);
              showValidation("OTP resent successfully");
            })
            .catch(error => {
              setIsLoading(false);
              showValidation("Failed to resend OTP");
            });
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.resendOtpText}>Resend OTP</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          if (validateOtp()) {
            // Verify OTP via API
            const otpCode = otp.join('');
            setIsLoading(true);
            
            axios.post(`${API_BASE_URL}/api/verify-otp`, { email, otp: otpCode })
              .then(response => {
                setIsLoading(false);
                console.log('OTP verification response:', response.data);
                setCurrentScreen('resetPassword');
              })
              .catch(error => {
                setIsLoading(false);
                console.log('OTP verification error:', error);
                showValidation("Invalid OTP, please try again");
              });
          }
        }}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "VERIFYING..." : "Verify"}
        </Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity 
      style={styles.backButton}
      onPress={() => setCurrentScreen('forgotPassword')}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>
  </Animated.View>
);

// Reset Password Screen
const ResetPasswordScreen = () => (
  <Animated.View 
    style={[
      styles.container,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}
  >
    <StatusBar barStyle="dark-content" />
    <View style={styles.smallLogoContainer}>
      <Logo small />
    </View>
    <Text style={styles.createAccountTitle}>NEW PASSWORD</Text>
    <View style={styles.formContainerWithIndicator}>
      <Text style={styles.forgotPasswordText}>
        Enter your new password
      </Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#333" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
          <Ionicons 
            name={showPassword ? "eye-outline" : "eye-off-outline"} 
            size={24} 
            color="#666"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#333" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#666"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity 
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
            size={24} 
            color="#666"
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.passwordRequirements}>
        * Password must be at least 8 characters with uppercase, lowercase, and numbers
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          if (validateResetPassword()) {
            // Reset password via API
            setIsLoading(true);
            
            axios.post(`${API_BASE_URL}/api/reset-password`, { 
              email, 
              password,
              otp: otp.join('')
            })
              .then(response => {
                setIsLoading(false);
                console.log('Password reset response:', response.data);
                showValidation("Password reset successfully!");
                setTimeout(() => {
                  setCurrentScreen('login');
                }, 2000);
              })
              .catch(error => {
                setIsLoading(false);
                console.log('Password reset error:', error);
                showValidation("Failed to reset password. Please try again.");
              });
          }
        }}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "UPDATING..." : "Update Password"}
        </Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity 
      style={styles.backButton}
      onPress={() => setCurrentScreen('verifyOtp')}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>
  </Animated.View>
);

// Render the appropriate screen based on current state
const renderScreen = () => {
  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'login':
      return <LoginScreenComponent />;
    case 'signup':
      if (createAccountStep === 1) {
        return <CreateAccountStep1 />;
      } else if (createAccountStep === 2) {
        return <CreateAccountStep2 />;
      } else {
        return <CreateAccountStep3 />;
      }
    case 'forgotPassword':
      return <ForgotPasswordScreen />;
    case 'verifyOtp':
      return <OtpVerificationScreen />;
    case 'resetPassword':
      return <ResetPasswordScreen />;
    default:
      return <WelcomeScreen />;
  }
};

return (
  <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {renderScreen()}
        <ValidationPopup 
          visible={validationPopup.visible}
          message={validationPopup.message}
          onClose={closeValidation}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
};

// Style definitions from the second file you provided
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D3D0F2', // Light purple background throughout app
  },
  container: {
    flex: 1,
    backgroundColor: '#D3D0F2',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4B3F72', // Dark purple for brand name
    letterSpacing: 8,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
  smallLogoContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
  },
  logoContainer: {
    height: 120,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  smallLogo: {
    width: 50,
    height: 50,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4B3F72',
    marginTop: 15,
    letterSpacing: 8,
  },
  apiMessageText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4B3F72',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  apiErrorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FF5252',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  createAccountTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 3,
  },
  buttonContainer: {
    padding: 30,
    width: '100%',
    alignItems: 'center',
  },
  formContainer: {
    padding: 30,
    width: '100%',
  },
  formContainerWithIndicator: {
    margin: 20,
    padding: 20,
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    alignSelf: 'center',
  },
  stepIndicator: {
    alignSelf: 'flex-end',
    color: '#FFF',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    marginBottom: 20,
    paddingBottom: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4B3F72',
    borderRadius: 25,
    padding: 15,
    width: '80%',
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    marginTop: 15,
  },
  forgotPassword: {
    color: '#4B3F72',
    textAlign: 'right',
    marginBottom: 20,
  },
  aboutText: {
    color: '#4B3F72',
    fontSize: 16,
  },
  orText: {
    color: '#4B3F72',
    textAlign: 'center',
    marginVertical: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  formLabel: {
    marginBottom: 8,
    color: '#333',
    fontSize: 14,
  },
  datePickerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#333',
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
  },
  flagIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  countryCodeText: {
    marginRight: 5,
    fontSize: 16,
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    width: '48%',
  },
  genderButtonActive: {
    backgroundColor: '#4B3F72',
  },
  genderText: {
    color: '#333',
    marginLeft: 8,
    fontSize: 16,
  },
  genderTextActive: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
  },
  forgotPasswordText: {
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B3F72',
    textAlign: 'center',
  },
  resendOtpText: {
    color: '#4B3F72',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  passwordRequirements: {
    color: '#333',
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    width: '85%',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 15,
  },
  modalButton: {
    backgroundColor: '#4B3F72',
    borderRadius: 25,
    padding: 10,
    width: '50%',
    alignItems: 'center',
    marginTop: 15,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Export the login screen component
export default LoginScreen;


