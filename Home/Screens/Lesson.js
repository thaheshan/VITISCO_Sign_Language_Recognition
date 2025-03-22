import React, { useState } from 'react';
import  WelcomeScreen from './LessonScreens/WelcomeScreen';
import WelcomeScreen2 from './LessonScreens/WelcomeScreen2'
import WelcomeScreen3 from './LessonScreens/WelcomeScreen3'
import WelcomeScreen4 from './LessonScreens/WelcomeScreen4'
import LoadingScreen from './LessonScreens/LoadingScreen';


import LanguageSelectionScreen from './LessonScreens/LanguageSelectionScreen';

import CustomizationScreen from './LessonScreens/CustomizationScreen';
import CustomizationScreen2 from './LessonScreens/CustomizationScreen2';
import CustomizationScreen3 from './LessonScreens/CustomizationScreen3';

import LanguagePathwayCustomizationScreen from './LessonScreens/LanguagePathwayCustomizationScreen';
import  LanguagePathwayCustomizationScreen2 from "./LessonScreens/LanguagePathwayCustomizationScreen2";
import  LanguagePathwayCustomizationScreen3 from "./LessonScreens/LanguagePathwayCustomizationScreen3";

import CountDownScreen from './LessonScreens/CountDownScreen';
import CountDownScreen2 from './LessonScreens/CountDownScreen2';
import CountDownScreen3 from './LessonScreens/CountDownScreen3';



import GetStartedScreen from './LessonScreens/GetStartedScreen';
import GetStartedScreen2 from './LessonScreens/GetStartedScreen2';
import GetStartedScreen3 from './LessonScreens/GetStartedScreen3';



import LessonIntroScreen from './LessonScreens/LessonIntroScreen';




import LearningPathwayScreen from './LessonScreens/LearningPathwayScreen';
import LearningPathwayScreen2 from './LessonScreens/LearningPathway2';
import LearningPathwayScreen3 from './LessonScreens/LearningPathway3';



import AlphabetLessonScreen from './LessonScreens/AlphabetLessonScreen';




export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [screenParams, setScreenParams] = useState({});

  const navigate = (screenName, params = {}) => {
    setScreenParams(params);
    setCurrentScreen(screenName);
  };

  const renderScreen = () => {
    switch(currentScreen) {
      case 'Welcome':
        return <WelcomeScreen navigate={navigate} />;
        case 'Welcome2':
          return <WelcomeScreen2 navigate={navigate} />;
          case 'Welcome3':
            return <WelcomeScreen3 navigate={navigate} />;
            case 'Welcome4':
            return <WelcomeScreen4 navigate={navigate} />;
      case 'Loading':
        return <LoadingScreen navigate={navigate} />;
      case 'Languageselection':
        return <LanguageSelectionScreen navigate={navigate} {...screenParams} />;


      case 'Customization':
        return <CustomizationScreen navigate={navigate} {...screenParams} />;
        case 'Customization2':
          return <CustomizationScreen2 navigate={navigate} {...screenParams} />;
          case 'Customization3':
            return <CustomizationScreen3 navigate={navigate} {...screenParams} />;



      case 'LanguagePathwayCustomization':
        return <LanguagePathwayCustomizationScreen navigate={navigate} {...screenParams} />;
        case 'LanguagePathwayCustomization2':
          return <LanguagePathwayCustomizationScreen2 navigate={navigate} {...screenParams} />;
          case 'LanguagePathwayCustomization3':
            return <LanguagePathwayCustomizationScreen3 navigate={navigate} {...screenParams} />;
          
      // case 'GamePreparation':
      //   return <GamePreparationScreen navigate={navigate} {...screenParams} />;
      // case 'DailyRewards':
      //   return <DailyRewardsScreen navigate={navigate} {...screenParams} />;


      case 'ReadyCountdown':
        return <CountDownScreen navigate={navigate} {...screenParams} />;
        case 'ReadyCountdown2':
          return <CountDownScreen2 navigate={navigate} {...screenParams} />;

          case 'ReadyCountdown3':
            return <CountDownScreen3 navigate={navigate} {...screenParams} />;


      case 'GetStarted':
        return <GetStartedScreen navigate={navigate} {...screenParams} />;
        case 'GetStarted2':
          return <GetStartedScreen navigate={navigate} {...screenParams} />;
          case 'GetStarted3':
            return <GetStartedScreen navigate={navigate} {...screenParams} />;



      case 'LessonIntro':
        return <LessonIntroScreen navigate={navigate} {...screenParams} />;
      // case 'WelcomeLessons':
      //   return <WelcomeLessonsScreen navigate={navigate} {...screenParams} />;


      case 'LearningPathway':
        return <LearningPathwayScreen navigate={navigate} {...screenParams} />;
        case 'LearningPathway2':
        return <LearningPathwayScreen2 navigate={navigate} {...screenParams} />;
        case 'LearningPathway3':
        return <LearningPathwayScreen3 navigate={navigate} {...screenParams} />;



      case 'AlphabetLearning':
        return <AlphabetLessonScreen navigate={navigate} {...screenParams} />;
      // case 'LessonComplete':
      //   return <LessonCompleteScreen navigate={navigate} {...screenParams} />;
      // case 'quizzes':
      //   return <PracticeQuizScreen navigate={navigate} {...screenParams} />;
      default:
        return <WelcomeScreen navigate={navigate} />;
    }
  };

  return renderScreen();
}