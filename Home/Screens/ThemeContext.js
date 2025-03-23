import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Load theme preference when app starts
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('isDarkMode');
        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Save theme preference whenever it changes
  const toggleTheme = async (value) => {
    try {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(value));
      setIsDarkMode(value);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  // Define color schemes
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

  const currentColors = isDarkMode ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, currentColors, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);