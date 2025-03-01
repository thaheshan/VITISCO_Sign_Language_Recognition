// App.js - Main entry file
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with company name */}
      <Text style={styles.headerText}>V I T I S C O</Text>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('./assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Login Form */}
      <View style={styles.formContainer}>
        {/* Username Input */}
        <View style={styles.inputContainer}>
          <Image 
            source={require('./assets/user-icon.png')} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#fff"
          />
        </View>
        
        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Image 
            source={require('./assets/lock-icon.png')} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#fff"
            secureTextEntry={true}
          />
        </View>
        
        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>forgot password?</Text>
        </TouchableOpacity>
        
        {/* Social Login Options */}
        <View style={styles.socialLoginContainer}>
          <Text style={styles.socialLoginText}>Or sign in with</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={require('./assets/google-icon.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={require('./assets/facebook-icon.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={require('./assets/twitter-icon.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={require('./assets/linkedin-icon.png')} style={styles.socialIcon} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3b6e3',
  },
  headerText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 3,
    color: '#444',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  formContainer: {
    backgroundColor: 'rgba(150, 150, 190, 0.8)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
  },
  socialLoginContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  socialLoginText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 15,
  },
  socialButtons: {
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
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  loginButton: {
    backgroundColor: '#615885',
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 40,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});