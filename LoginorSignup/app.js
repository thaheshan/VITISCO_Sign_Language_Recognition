// App.js - Main Navigation Setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './screens/Welcome';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import ProfileSetup from './screens/ProfileSetup';
import LanguageSetup from './screens/LanguageSetup';
import Home from './screens/Home';
import { AuthProvider } from './context/AuthContext';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
          <Stack.Screen name="LanguageSetup" component={LanguageSetup} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;

// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);
          // Set auth header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          // Fetch user data
          const userData = await AsyncStorage.getItem('userData');
          if (userData) setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log('Error loading auth token', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadToken();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      
      if (response.data.token) {
        // Store token and user data
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Update context
        setToken(response.data.token);
        setUser(response.data.user);
        
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Remove token and user data from storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Clear context
      setToken(null);
      setUser(null);
      
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading, 
      login, 
      register, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// screens/Welcome.js - Welcome/Splash Screen (Image 7)
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

const Welcome = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>VITISCO</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.buttonText}>SIGNUP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('About')}>
            <Text style={styles.aboutText}>About Us</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5d1f0',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 150,
    height: 150,
  },
  appName: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a3b8b',
    letterSpacing: 2,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4a3b8b',
    width: '100%',
    borderRadius: 50,
    paddingVertical: 15,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aboutText: {
    marginTop: 20,
    color: '#4a3b8b',
    fontSize: 14,
  },
});

export default Welcome;

// screens/Login.js - Login Screen (Image 2)
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loading } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setError('');
    const result = await login(username, password);
    
    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      setError(result.message || 'Login failed');
    }
  };

  const handleSocialLogin = (provider) => {
    // In a real app, you would implement OAuth login for each provider
    console.log(`Login with ${provider}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.appTitle}>VITISCO</Text>
      </View>
      
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#000" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#000" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>forgot password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>LOGIN</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.orText}>Or sign in with</Text>
        
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Google')}
          >
            <Image 
              source={require('../assets/google-icon.png')} 
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Facebook')}
          >
            <Image 
              source={require('../assets/facebook-icon.png')} 
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Twitter')}
          >
            <Image 
              source={require('../assets/twitter-icon.png')} 
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('LinkedIn')}
          >
            <Image 
              source={require('../assets/linkedin-icon.png')} 
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5d1f0',
  },
  header: {
    paddingTop: 10,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a3b8b',
    letterSpacing: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#000',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#4a3b8b',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4a3b8b',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    elevation: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
});

export default Login;

// screens/SignUp.js - Account Creation Screen (Image 1 & 6)
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';

const SignUp = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { register, loading } = useContext(AuthContext);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = async () => {
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    
    const result = await register({
      username,
      email,
      password
    });
    
    if (result.success) {
      // Move to profile setup
      navigation.navigate('ProfileSetup', { userId: result.user.id });
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Image 
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>CREATE ACCOUNT</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.stepIndicator}>1 of 3</Text>
        
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#000" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="mail" size={20} color="#000" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#000" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#000" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5d1f0',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    position: 'relative',
  },
  stepIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#000',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  nextButton: {
    backgroundColor: '#4a3b8b',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SignUp;

// screens/ProfileSetup.js - Profile Setup Screen (Image 4)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_URL } from '../config';

const ProfileSetup = ({ route, navigation }) => {
  const { userId } = route.params;
  
  const [profileName, setProfileName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const handleNext = async () => {
    if (!profileName || !phoneNumber) {
      setError('Profile name and phone number are required');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/users/${userId}/profile`, {
        profileName,
        dob: dob.toISOString(),
        phoneNumber: `${countryCode}${phoneNumber}`,
        gender
      });
      
      if (response.data.success) {
        navigation.navigate('LanguageSetup', { userId });
      }
    } catch (error) {
      console.error('Profile setup error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to set up profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Image 
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.stepIndicator}>2 of 3</Text>
        
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#000" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Profile Name"
            value={profileName}
            onChangeText={setProfileName}
          />
        </View>
        
        <Text style={styles.label}>Birth of date</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{formatDate(dob)}</Text>
          <Icon name="calendar" size={20} color="#666" />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
        
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.countryCodeContainer}>
            <Text style={styles.countryCode}>{countryCode}</Text>
            <Icon name="chevron-down" size={16} color="#666" />
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.genderContainer}>
          <TouchableOpacity 
            style={[
              styles.genderOption,
              gender === 'male' && styles.selectedGender
            ]}
            onPress={() => setGender('male')}
          >
            <Icon 
              name="user" 
              size={24} 
              color={gender === 'male' ? '#fff' : '#000'} 
            />
            <Text style={gender === 'male' ? styles.selectedGenderText : null}>
              Male
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.genderOption,
              gender === 'female' && styles.selectedGender
            ]}
            onPress={() => setGender('female')}
          >
            <Icon 
              name="user" 
              size={24} 
              color={gender === 'female' ? '#fff' : '#000'} 
            />
            <Text style={gender === 'female' ? styles.selectedGenderText : null}>
              Female
            </Text>
          </TouchableOpacity>
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5d1f0',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    position: 'relative',
  },
  stepIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#000',
    fontSize: 16,
  },
  label: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  countryCode: {
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 15,
    height: 40,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
  selectedGender: {
    backgroundColor: '#4a3b8b',
  },
  selectedGenderText: {
    color: '#fff',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  // Continuing styles for ProfileSetup.js
  nextButton: {
    backgroundColor: '#4a3b8b',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileSetup;

// screens/LanguageSetup.js - Language Setup Screen (Image 3)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

const LanguageSetup = ({ route, navigation }) => {
  const { userId } = route.params;
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = React.useContext(AuthContext);

  const handleFinish = async () => {
    if (!nativeLanguage || !preferredLanguage) {
      setError('Both language fields are required');
      return;
    }
    
    try {
      setLoading(true);
      // Update user profile with language preferences
      const response = await axios.post(`${API_URL}/users/${userId}/language-preferences`, {
        nativeLanguage,
        preferredLanguage
      });
      
      if (response.data.success) {
        // Get login credentials from previous screens
        const credentials = await axios.get(`${API_URL}/users/${userId}/credentials`);
        
        if (credentials.data.username && credentials.data.password) {
          // Auto login after registration complete
          const loginResult = await login(
            credentials.data.username, 
            credentials.data.password
          );
          
          if (loginResult.success) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } else {
            // If auto-login fails, redirect to login page
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      }
    } catch (error) {
      console.error('Language setup error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to set up language preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Image 
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.stepIndicator}>3 of 3</Text>
        
        <View style={styles.inputContainer}>
          <Icon name="globe" size={20} color="#000" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Native Language"
            value={nativeLanguage}
            onChangeText={setNativeLanguage}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="message-circle" size={20} color="#000" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Preferred Language"
            value={preferredLanguage}
            onChangeText={setPreferredLanguage}
          />
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={styles.finishButton}
          onPress={handleFinish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.finishButtonText}>Finish</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5d1f0',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    position: 'relative',
  },
  stepIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#000',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  finishButton: {
    backgroundColor: '#4a3b8b',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LanguageSetup;

// screens/Home.js - Home Screen (Image 5)
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { API_URL } from '../config';

const Home = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user's tasks
        const tasksResponse = await axios.get(`${API_URL}/tasks`);
        if (tasksResponse.data.success) {
          setTasks(tasksResponse.data.tasks);
        }
        
        // Fetch user's lessons
        const lessonsResponse = await axios.get(`${API_URL}/lessons`);
        if (lessonsResponse.data.success) {
          setLessons(lessonsResponse.data.lessons);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  // Sample task data based on image
  const dailyTasks = [
    { id: 1, title: 'Workout', icon: 'activity' },
    { id: 2, title: 'Coursework', icon: 'book' },
    { id: 3, title: 'Plant Tree', icon: 'leaf' },
  ];

  // Sample lesson data based on image
  const ongoingLessons = [
    { 
      id: 1, 
      title: 'Lesson 01', 
      status: 'Active', 
      progress: 75, 
      dueDate: '21 March',
      participants: 3
    },
    { 
      id: 2, 
      title: 'Quiz', 
      status: 'Active', 
      progress: 0, 
      dueDate: '04 April',
      participants: 3
    },
    { 
      id: 3, 
      title: 'Virtual Room', 
      status: 'Active', 
      progress: 0, 
      dueDate: '',
      participants: 3
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image 
            source={require('../assets/profile-pic.png')} 
            style={styles.profilePic}
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>DAILY TASKS</Text>
          <Text style={styles.sectionTitle}>CHALLENGES</Text>
        </View>
        
        <View style={styles.taskCards}>
          {dailyTasks.map((task, index) => (
            <TouchableOpacity key={task.id} style={styles.taskCard}>
              <View style={styles.taskIconContainer}>
                <Icon name={task.icon} size={20} color="#4a3b8b" />
              </View>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskSubtitle}>TASK 0{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.lessonsHeader}>
          <Text style={styles.lessonsTitle}>Ongoing Lessons</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        {ongoingLessons.map((lesson) => (
          <View key={lesson.id} style={styles.lessonCard}>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonStatus}>{lesson.status}</Text>
              <View style={styles.participantsContainer}>
                {[...Array(lesson.participants)].map((_, i) => (
                  <View key={i} style={styles.participantIcon} />
                ))}
              </View>
              {lesson.dueDate && (
                <Text style={styles.dueDate}>Due on : {lesson.dueDate}</Text>
              )}
            </View>
            
            {lesson.progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressText}>{lesson.progress}%</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="grid" size={24} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon name="target" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addButton}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon name="bell" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon name="user" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5d1f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  tasksSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  taskCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '30%',
    alignItems: 'center',
  },
  taskIconContainer: {
    backgroundColor: '#e8e5f7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskSubtitle: {
    fontSize: 10,
    color: '#888',
  },
  lessonsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  lessonsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4a3b8b',
  },
  lessonCard: {
    backgroundColor: '#9985d3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  lessonStatus: {
    fontSize: 12,
    color: '#e8e5f7',
    marginBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  participantIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffcc00',
    marginRight: 5,
  },
  dueDate: {
    fontSize: 12,
    color: '#e8e5f7',
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    elevation: 5,
  },
  navItem: {
    padding: 10,
  },
  addButton: {
    backgroundColor: '#9985d3',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 15,
  },
});

export default Home;

// config.js
export const API_URL = 'https://api.vitisco.example.com/v1';