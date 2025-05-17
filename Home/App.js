import React, { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./HomeScreen.js";
import QuizScreen from "./Screens/Quiz.js";
import VirtualRoomScreen from "./Screens/VirtualRoom.js";
import LessonScreen from  "./Screens/Lesson.js";
import ProgressAnalysisScreen from "./Screens/ProgressAnlaysis/ProgressApp.js";
import ProfileScreen from "./Screens/Profile.js";
import SettingsScreen from "./Screens/Settings.js";
import TranslatorScreen from "./Screens/Translator.js";
import TextToSpeechScreen from "./Screens/TexttoSpeech.js";
import NotificationScreen from "./Screens/Feedback.js";
import LoginScreen from "./Screens/Login.js";
import SchedulerScreen from  "./Screens/schduler.js";

import LearningPathwayScreens from "./Screens/LessonScreens/LearningPathwayEnglishScreen.js";


const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        setIsLoggedIn(!!userToken); // If token exists, user is logged in
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (

    
    <NavigationContainer>
      <Stack.Navigator initialRouteName={ "Login" }>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: "" }} /> 
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: "" }} />
        <Stack.Screen name="VirtualRoom" component={VirtualRoomScreen} options={{ title: "" }} />
        <Stack.Screen name="ProgressAnalysis" component={ProgressAnalysisScreen}  options={{ headerShown: false }}  />
        <Stack.Screen name="Profile" component={ProfileScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Translator" component={TranslatorScreen} />  
         <Stack.Screen name="TextToSpeech" component={TextToSpeechScreen} /> 
        <Stack.Screen name="Notifications" component={NotificationScreen}  options={{ headerShown: false }} />
        <Stack.Screen name="Scheduler" component={SchedulerScreen} />
        <Stack.Screen name="LearnPathway" component={LearningPathwayScreens} />
      </Stack.Navigator>
    </NavigationContainer>


  );
};

export default App;
