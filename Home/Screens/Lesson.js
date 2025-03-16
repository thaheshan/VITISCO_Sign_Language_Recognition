import React, { useState } from 'react';
import  WelcomeScreen from './LessonScreens/WelcomeScreen';

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
      case 'LearningPathwayCustomization':
        return <LearningPathwayCustomizationScreen navigate={navigate} {...screenParams} />;
      case 'GamePreparation':
        return <GamePreparationScreen navigate={navigate} {...screenParams} />;
      case 'DailyRewards':
        return <DailyRewardsScreen navigate={navigate} {...screenParams} />;
      case 'ReadyCountdown':
        return <ReadyCountdownScreen navigate={navigate} {...screenParams} />;
      case 'GetStarted':
        return <GetStartedScreen navigate={navigate} {...screenParams} />;
      case 'LessonIntro':
        return <LessonIntroScreen navigate={navigate} {...screenParams} />;
      case 'WelcomeLessons':
        return <WelcomeLessonsScreen navigate={navigate} {...screenParams} />;
      case 'LearningPathway':
        return <LearningPathwayScreen navigate={navigate} {...screenParams} />;
      case 'AlphabetLearning':
        return <AlphabetLearningScreen navigate={navigate} {...screenParams} />;
      case 'LessonComplete':
        return <LessonCompleteScreen navigate={navigate} {...screenParams} />;
      case 'quizzes':
        return <PracticeQuizScreen navigate={navigate} {...screenParams} />;
      default:
        return <WelcomeScreen navigate={navigate} />;
    }
  };

  return renderScreen();
}