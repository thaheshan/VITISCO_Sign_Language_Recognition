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
  
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';



import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
// With this Expo-friendly approach:
import Constants from 'expo-constants';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// At the end of your file, after all your code

// Register the root component
// Update your API base URL to work with Expo Go
// For Expo Go, you need to use your machine's local IP address instead of localhost or 10.0.2.2

// Make this more dynamic
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://192.168.58.40:5000';  // Use your actual IP address


// Replace X with your actual IP address segment

// Example MySQL connection setup for your backend (this would go in your Node.js server file, not in this React Native file)
// const mysql = require('mysql2');
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'yourpassword',
//   database: 'vitisco_db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });



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
  
  // Use the correct path for Expo assets
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

axios.get(`${API_BASE_URL}/api/message`)
  .then(response => {
    console.log("API Response:", response.data);
    setApiMessage(response.data.message);
    setApiError('');
  })
  .catch(error => {
    console.log("Full error details:", error);
    if (error.response) {
      console.log("Server responded with:", error.response.status, error.response.data);
    } else if (error.request) {
      console.log("No response received:", error.request);
    } else {
      console.log("Error setting up request:", error.message);
    }
  });
  
  

const LoginScreen = ({navigation}) =>  {
    
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
          // Error logging...
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

  // OTP input handler - Modified for React Native
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto focus next input (modified for React Native)
    if (text && index < 3) {
      // Note: In React Native, we would need refs for this to work properly
      // This is a simplified version
      if (otpInputRefs && otpInputRefs[index + 1]) {
        otpInputRefs[index + 1].focus();
      }
    }
  };

  // Create refs for OTP inputs
  const otpInputRefs = [useRef(), useRef(), useRef(), useRef()];

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

  // In the LoginScreen component
const handleLogin = () => {
  console.log('Login pressed with:', { username, password });
  
  // Show some loading state
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
        setApiError(error.response.data.error || 'Login failed');
      } else if (error.request) {
        setApiError('Network error - check your connection and API URL');
        console.log('Network error details:', error.request);
      } else {
        setApiError('An error occurred during login');
      }
    });
};

  // Login Screen
  const LoginScreen = () => (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
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
          onPress={() => {
            // Handle login logic with updated API_BASE_URL
            console.log('Login pressed with:', { username, password });
            
            // Simulate API call for login
            axios.post(`${API_BASE_URL}/api/login`, { username, password })
              .then(response => {
                console.log('Login response:', response.data);
                // Handle successful login
              })
              .catch(error => {
                console.log('Login error:', error);
                // Handle login error
              });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}  onPress={() => navigation.navigate("Home" , {}, { animation: 'slide_from_right' })}>LOGIN</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.backButton2}
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
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setCreateAccountStep(2)}
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
      <View style={styles.smallLogoContainer2}>
        <Logo small />
      </View>

      
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
          onPress={() => setCreateAccountStep(3)}
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
            // Complete signup process via API with updated API_BASE_URL
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
            
            // Simulated API call for signup
            axios.post(`${API_BASE_URL}/api/signup`, userData)
              .then(response => {
                console.log('Signup response:', response.data);
                setCurrentScreen('welcome');
              })
              .catch(error => {
                console.log('Signup error:', error);
                // Handle signup error
              });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}  onPress={() => navigation.navigate('Home', {}, { animation: 'slide_from_right' })}>Finish</Text>
        </TouchableOpacity>
      </View>

         <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('welcome')}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>2`
`
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
            // Request OTP via API with updated API_BASE_URL
            axios.post(`${API_BASE_URL}/api/request-otp`, { email })
              .then(response => {
                console.log('OTP request response:', response.data);
                setCurrentScreen('verifyOtp');
              })
              .catch(error => {
                console.log('OTP request error:', error);
                // Handle OTP request error
              });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Send OTP</Text>
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

  // OTP Verification Screen
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
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={otpInputRefs[index]} // Use refs for focus management
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              maxLength={1}
              keyboardType="number-pad"
              textAlign="center"
            />
          ))}
        </View>
        <TouchableOpacity 
          style={styles.textButton}
          onPress={() => {
            // Resend OTP via API with updated API_BASE_URL
            axios.post(`${API_BASE_URL}/api/resend-otp`, { email })
              .then(response => {
                console.log('Resend OTP response:', response.data);
                // Handle successful resend
              })
              .catch(error => {
                console.log('Resend OTP error:', error);
                // Handle resend error
              });
          }}
          activeOpacity={0.6}
        >
          <Text style={styles.resendOtpText}>Resend OTP</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            // Verify OTP via API with updated API_BASE_URL
            const otpCode = otp.join('');
            axios.post(`${API_BASE_URL}/api/verify-otp`, { email, otp: otpCode })
              .then(response => {
                console.log('Verify OTP response:', response.data);
                setCurrentScreen('resetPassword');
              })
              .catch(error => {
                console.log('Verify OTP error:', error);
                // Handle verification error
              });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Verify</Text>
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
          Create a new password for your account
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
            placeholder="Confirm New Password"
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
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            // Reset password via API with updated API_BASE_URL
            if (password === confirmPassword) {
              axios.post(`${API_BASE_URL}/api/reset-password`, { email, password })
                .then(response => {
                  console.log('Password reset response:', response.data);
                  setCurrentScreen('login');
                })
                .catch(error => {
                  console.log('Password reset error:', error);
                  // Handle reset error
                });
            } else {
              console.log('Passwords do not match');
              // Show error message
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Render the appropriate screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'signup':
        if (createAccountStep === 1) return <CreateAccountStep1 />;
        if (createAccountStep === 2) return <CreateAccountStep2 />;
        if (createAccountStep === 3) return <CreateAccountStep3 />;
        return <CreateAccountStep1 />; // Default
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.safeArea}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
        >
          {renderScreen()}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

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
  smallLogoContainer2: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    height: 120,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
  smallLogo: {
    width: 50,
    height: 250,
    right: 40,
    marginTop: -155,
    marginLeft: -260,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4B3F72',
    marginTop: 15,
    letterSpacing: 8,
  },
  apiMessageText: {
    marginTop: 75,
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
   backButton2: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backButton: {
    position: 'absolute',
    top: 150,
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
  },
  resendOtpText: {
    color: '#4B3F72',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  
});






export default LoginScreen;