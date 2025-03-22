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

import CountDownScreen from './LessonScreens/CountDownScreen';
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

import Lesson1to6screen from './LessonScreens/ContentScreenSinhala/1to6';
import Lesson6to12screen from './LessonScreens/ContentScreenSinhala/6to12';
import Lesson12to18screen from './LessonScreens/ContentScreenSinhala/12to18';
import Lesson18to24screen from './LessonScreens/ContentScreenSinhala/18t024';
import Lesson24to30screen from './LessonScreens/ContentScreenSinhala/24to30';
import Lesson30to36screen from './LessonScreens/ContentScreenSinhala/30to36';


import SinhalaQuiz1 from './LessonScreens/ContentScreenSinhala/SQuiz1';
import SinhalaQuiz2 from './LessonScreens/ContentScreenSinhala/SQuiz2';
import SinhalaQuiz3 from './LessonScreens/ContentScreenSinhala/SQuiz3';
import SinhalaQuiz4 from './LessonScreens/ContentScreenSinhala/SQuiz4';
import SinhalaQuiz5 from './LessonScreens/ContentScreenSinhala/SQuiz5';
import SinhalaQuiz6 from './LessonScreens/ContentScreenSinhala/SQuiz6';



import EnglishQuiz1 from './LessonScreens/ContentScreensEnglish/Quiz1';
import EnglishQuiz2 from './LessonScreens/ContentScreensEnglish/Quiz2';
import EnglishQuiz3 from './LessonScreens/ContentScreensEnglish/Quiz3';
import EnglishQuiz4 from './LessonScreens/ContentScreensEnglish/Quiz4';
import EnglishQuiz5 from './LessonScreens/ContentScreensEnglish/Quiz5';
import EnglishQuiz6 from './LessonScreens/ContentScreensEnglish/Quiz6';

import LessonIntroScreen from './LessonScreens/LessonIntroScreen';

import LearningPathwayScreenEnglish from './LessonScreens/LearningPathwayEnglishScreen';
import LearningPathwayScreenTamil from './LessonScreens/LearningPathwayTamil';
import LearningPathwayScreenSinhala from './LessonScreens/LearningPathwaySinhala';

import AlphabetLessonScreen from './LessonScreens/ContentScreenSinhala/AlphabetLessonScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [screenParams, setScreenParams] = useState({});




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
        return <LearningPathwayScreenEnglish navigate={navigate} {...screenParams} />;
      case 'LearningPathway2':
        return <LearningPathwayScreenTamil navigate={navigate} {...screenParams} />;
      case 'LearningPathway3':
        return <LearningPathwayScreenSinhala navigate={navigate} {...screenParams} />;



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



        case '1to6':
          return <Lesson1to6screen navigate={navigate} {...screenParams} />;
        case '6to12':
          return <Lesson6to12screen navigate={navigate} {...screenParams} />;
        case '12to18':
          return <Lesson12to18screen navigate={navigate} {...screenParams} />;
        case '18to24':
          return <Lesson18to24screen navigate={navigate} {...screenParams} />;
        case '24to30':
          return <Lesson24to30screen navigate={navigate} {...screenParams} />;
        case '30to36':
          return <Lesson30to36screen navigate={navigate} {...screenParams} />;
  



          case 'sQuiz1':
            return <SinhalaQuiz1 navigate={navigate} {...screenParams} />;
          case 'sQuiz2':
            return <SinhalaQuiz2 navigate={navigate} {...screenParams} />;
          case 'sQuiz3':
            return <SinhalaQuiz3 navigate={navigate} {...screenParams} />;
          case 'sQuiz4':
            return <SinhalaQuiz4 navigate={navigate} {...screenParams} />;
          case 'sQuiz5':
            return <SinhalaQuiz5 navigate={navigate} {...screenParams} />;
          case 'sQuiz6':
            return <SinhalaQuiz6 navigate={navigate} {...screenParams} />;








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