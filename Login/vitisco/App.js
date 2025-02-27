import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from './Screens/LoginScreen';
import SignupScreen from './Screens/SignupScreen';
import ProfileSetupScreen from './Screens/ProfileSetupScreen';
// Import other screens you've referenced
// import HomeScreen from './Screens/HomeScreen';
// import StatsScreen from './Screens/StatsScreen';
// import AddLessonScreen from './Screens/AddLessonScreen';
// import NotificationsScreen from './Screens/NotificationsScreen';
// import ProfileScreen from './Screens/ProfileScreen';
// import LanguageSetupScreen from './Screens/LanguageSetupScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Updated to match React Navigation v7 API
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6b64c3',
        tabBarInactiveTintColor: '#8980d0',
        tabBarStyle: {
          backgroundColor: '#e3e0ff',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
        },
        headerShown: false,
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen
        name="Add"
        component={AddLessonScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="add-circle"
              size={48}
              color="#6b64c3"
              style={{
                position: 'absolute',
                bottom: 5,
              }}
            />
          ),
        }}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#d8d5ff" barStyle="dark-content" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // Updated animation for React Navigation v7
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="LanguageSetup" component={LanguageSetupScreen} />
        <Stack.Screen name="MainApp" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}