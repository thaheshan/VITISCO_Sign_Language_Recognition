import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen.js';
import LessonScreen from './Screens/Lesson.js';
import QuizScreen from './Screens/Quiz.js';
import VirtualRoomScreen  from './Screens/VirtualRoom.js';
import ProgressAnalysisScreen  from './Screens/ProgressAnalysis.js';
import ProfileScreen from './Screens/ProfileScreen.js';
import SettingsScreen from './Screens/Settings.js';
import TranslatorScreen from './Screens/Translator.js';
import TextoSpeechScreen from './Screens/TexttoSpeech.js';
// import SchedulePage  from './Screens/Schedule.js';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Lesson" 
          component={LessonScreen}
          options={{ title: 'Lesson Details' }}
        />
           <Stack.Screen 
          name="Quiz" 
          component={QuizScreen}
          options={{ title: 'Quiz Details' }}
        />
                <Stack.Screen 
          name="Virtual Room" 
          component={VirtualRoomScreen}
          options={{ title: 'Virtual Room  Details' }}
        />
                     {/* <Stack.Screen 
          name="Schedule Page" 
          component={SchedulePage}
          options={{ title: 'Schedule Details' }}
        /> */}

<Stack.Screen 
          name="Progress Analysis" 
          component={ProgressAnalysisScreen}
          options={{ title: 'Progress Analysis Details' }}
        />

<Stack.Screen 
          name="Profile Screen" 
          component={ProfileScreen}
        />

<Stack.Screen 
          name="Settings Screen" 
          component={SettingsScreen}
        />

<Stack.Screen 
          name="Translator Screen" 
          component={TranslatorScreen}
        />
<Stack.Screen 
          name="TexttoSpeech" 
          component={TextoSpeechScreen}
        />
     
      </Stack.Navigator>

  
    </NavigationContainer>
  );
};

export default App;