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
import LanguagePathwayCustomizationScreen2 from "./LessonScreens/LanguagePathwayCustomizationScreen2";
import LanguagePathwayCustomizationScreen3 from "./LessonScreens/LanguagePathwayCustomizationScreen3";

//import CountDownScreen from './LessonScreens/CountDownScreen';
import CountDownScreen2 from './LessonScreens/CountDownScreen2';
import CountDownScreen3 from './LessonScreens/CountDownScreen3';

import GetStartedScreen from './LessonScreens/GetStartedScreen';
import GetStartedScreen2 from './LessonScreens/GetStartedScreen2';
import GetStartedScreen3 from './LessonScreens/GetStartedScreen3';

import LessonAtoDascreen from './LessonScreens/ContentScreensEnglish/AtoD';
import LessonEtoHscreen from './LessonScreens/ContentScreensEnglish/EtoH';
import LessonItoLscreen from './LessonScreens/ContentScreensEnglish/ItoL';
import LessonMtoPscreen from './LessonScreens/ContentScreensEnglish/Mtop';
import LessonQtoTscreen from './LessonScreens/ContentScreensEnglish/QtoT';
import LessonUtoZscreen from './LessonScreens/ContentScreensEnglish/UtoZ';

import EnglishQuiz1 from './LessonScreens/ContentScreensEnglish/Quiz1';
import EnglishQuiz2 from './LessonScreens/ContentScreensEnglish/Quiz2';
import EnglishQuiz3 from './LessonScreens/ContentScreensEnglish/Quiz3';
import EnglishQuiz4 from './LessonScreens/ContentScreensEnglish/Quiz4';
import EnglishQuiz5 from './LessonScreens/ContentScreensEnglish/Quiz5';
import EnglishQuiz6 from './LessonScreens/ContentScreensEnglish/Quiz6';

import LessonIntroScreen from './LessonScreens/LessonIntroScreen';

import LearningPathwayScreen from './LessonScreens/LearningPathwayScreen';
import LearningPathwayScreen2 from './LessonScreens/LearningPathwayTamil';
import LearningPathwayScreen3 from './LessonScreens/LearningPathwaySinhala';

import AlphabetLessonScreen from './LessonScreens/ContentScreenSinhala/AlphabetLessonScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [screenParams, setScreenParams] = useState({});

  // Map of content screens to their corresponding quiz screens
  const contentQuizMap = {
    'AtoD': 'Quiz1',
    'EtoH': 'Quiz2',
    'ItoL': 'Quiz3',
    'MtoP': 'Quiz4',
    'QtoT': 'Quiz5',
    'UtoZ': 'Quiz6'
  };

  // Map of node indices to their content screens
  const nodeContentMap = {
    0: 'AtoD',      // Node 1
    1: 'EtoH',      // Node 2
    2: 'ItoL',      // Node 3 
    3: 'Quiz1',     // Node 4 (Knowledge Check)
    4: 'MtoP',      // Node 5
    5: 'QtoT',      // Node 6
    6: 'UtoZ',      // Node 7
    7: 'Quiz4',     // Node 8 (Application)
    8: 'AtoD',      // Node 9 (can repeat with harder content)
    9: 'EtoH',      // Node 10
    10: 'ItoL',     // Node 11
    11: 'Quiz6'     // Node 12 (Final Assessment)
  };

  const navigate = (screenName, params = {}) => {
    // If this is a navigation from a content screen to a quiz,
    // update the parameters to include the quiz information
    if (params.completedContent && contentQuizMap[params.completedContent]) {
      params.quizToShow = contentQuizMap[params.completedContent];
      screenName = params.quizToShow;
    }
    
    // If this is a navigation from the learning pathway to a lesson
    if (params.lessonName && nodeContentMap[params.level - 1]) {
      // Override the screenName to use the appropriate content screen
      screenName = nodeContentMap[params.level - 1];
    }

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
      case 'ReadyCountdown':
        return <CountDownScreen navigate={navigate} {...screenParams} />;
      case 'ReadyCountdown2':
        return <CountDownScreen2 navigate={navigate} {...screenParams} />;
      case 'ReadyCountdown3':
        return <CountDownScreen3 navigate={navigate} {...screenParams} />;
      case 'GetStarted':
        return <GetStartedScreen navigate={navigate} {...screenParams} />;
      case 'GetStarted2':
        return <GetStartedScreen2 navigate={navigate} {...screenParams} />;
      case 'GetStarted3':
        return <GetStartedScreen3 navigate={navigate} {...screenParams} />;
      case 'LessonIntro':
        return <LessonIntroScreen navigate={navigate} {...screenParams} />;
      case 'LearningPathway':
        return <LearningPathwayScreen navigate={navigate} {...screenParams} />;
      case 'LearningPathway2':
        return <LearningPathwayScreen2 navigate={navigate} {...screenParams} />;
      case 'LearningPathway3':
        return <LearningPathwayScreen3 navigate={navigate} {...screenParams} />;
      case 'AtoD':
        return <LessonAtoDascreen navigate={navigate} {...screenParams} />;
      case 'EtoH':
        return <LessonEtoHscreen navigate={navigate} {...screenParams} />;
      case 'ItoL':
        return <LessonItoLscreen navigate={navigate} {...screenParams} />;
      case 'MtoP':
        return <LessonMtoPscreen navigate={navigate} {...screenParams} />;
      case 'QtoT':
        return <LessonQtoTscreen navigate={navigate} {...screenParams} />;
      case 'UtoZ':
        return <LessonUtoZscreen navigate={navigate} {...screenParams} />;
      case 'Quiz1':
        return <EnglishQuiz1 navigate={navigate} {...screenParams} />;
      case 'Quiz2':
        return <EnglishQuiz2 navigate={navigate} {...screenParams} />;
      case 'Quiz3':
        return <EnglishQuiz3 navigate={navigate} {...screenParams} />;
      case 'Quiz4':
        return <EnglishQuiz4 navigate={navigate} {...screenParams} />;
      case 'Quiz5':
        return <EnglishQuiz5 navigate={navigate} {...screenParams} />;
      case 'Quiz6':
        return <EnglishQuiz6 navigate={navigate} {...screenParams} />;
      case 'AlphabetLearning':
        return <AlphabetLessonScreen navigate={navigate} {...screenParams} />;
      default:
        return <WelcomeScreen navigate={navigate} />;
    }
  };

  return renderScreen();
}