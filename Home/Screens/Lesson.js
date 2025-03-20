import React, { useState } from 'react';
import  WelcomeScreen from './LessonScreens/WelcomeScreen';
import LoadingScreen from './LessonScreens/LoadingScreen';
import LanguageSelectionScreen from './LessonScreens/LanguageSelectionScreen';
import CustomizationScreen from './LessonScreens/CustomizationScreen';
import LanguagePathwayCustomizationScreen from './LessonScreens/LanguagePathwayCustomizationScreen';
import CountDownScreen from './LessonScreens/CountdownScreen';
import GetStartedScreen from './LessonScreens/GetStartedScreen';
import LessonIntroScreen from './LessonScreens/LessonIntroScreen';
import LearningPathwayScreen from './LessonScreens/LearningPathwayScreen';




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
      case 'Loading':
        return <LoadingScreen navigate={navigate} />;
      case 'Languageselection':
        return <LanguageSelectionScreen navigate={navigate} {...screenParams} />;
      case 'Customization':
        return <CustomizationScreen navigate={navigate} {...screenParams} />;
      case 'LanguagePathwayCustomization':
        return <LanguagePathwayCustomizationScreen navigate={navigate} {...screenParams} />;
      // case 'GamePreparation':
      //   return <GamePreparationScreen navigate={navigate} {...screenParams} />;
      // case 'DailyRewards':
      //   return <DailyRewardsScreen navigate={navigate} {...screenParams} />;
      case 'ReadyCountdown':
        return <CountDownScreen navigate={navigate} {...screenParams} />;
      case 'GetStarted':
        return <GetStartedScreen navigate={navigate} {...screenParams} />;
      case 'LessonIntro':
        return <LessonIntroScreen navigate={navigate} {...screenParams} />;
      // case 'WelcomeLessons':
      //   return <WelcomeLessonsScreen navigate={navigate} {...screenParams} />;
      case 'LearningPathway':
        return <LearningPathwayScreen navigate={navigate} {...screenParams} />;
      // case 'AlphabetLearning':
      //   return <AlphabetLearningScreen navigate={navigate} {...screenParams} />;
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