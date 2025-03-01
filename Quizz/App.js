import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';

const QuizApp = () => {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = [
    {
      id: 1,
      title: 'Question 01',
      image: require('./assets/download.jpeg'),
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'B' },
        { id: 'C', text: 'C' },
      ],
    },
    {
      id: 2,
      title: 'Select the correct sign for B',
      options: [
        { image: require('./assets/image01.png') },
        { image: require('./assets/image01.png') },
        { image: require('./assets/image01.png') },
        { image: require('./assets/image01.png') },
      ],
      gridView: true,
    },
    {
      id: 3,
      title: 'Select the correct sign for C',
      options: [
        { image: require('./assets/image01.png') },
        { image: require('./assets/image01.png') },
        { image: require('./assets/image01.png') },
        { image: require('./assets/image01.png') },
      ],
      gridView: true,
    },
    {
      id: 4,
      title: 'Question 4',
      image: require('./assets/download.jpeg'),
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'C' },
        { id: 'C', text: 'B' },
      ],
    },
  ];

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
    }
  };

  const handleQuit = () => {
    Alert.alert(
      "Quit Quiz",
      "Are you sure you want to quit?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => setShowStartScreen(true) }
      ]
    );
  };

  // ** Welcome Screen **
  if (showStartScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to the Quiz!</Text>
          <Image source={require('./assets/image01.png')} style={styles.welcomeImage} />
          </View>
        {/* button container */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => setShowStartScreen(false)}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{currentQuestion + 1}/{questions.length}</Text>
    </View>
  );

  const renderQuestion = () => {
    const question = questions[currentQuestion];

   

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.questionContainer}>
          {question.title && (
            <Text style={styles.questionTitle}>{question.title}</Text>
          )}
          {question.image && (
            <Image source={question.image} style={styles.questionImage} />
          )}
          
          {question.gridView ? (
            <View style={styles.gridContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gridItem}
                  onPress={() => setSelectedAnswer(index)}
                >
                  <Image source={option.image} style={styles.optionImage} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedAnswer(index)}
                >
                  <View style={styles.optionContent}>
                    {option.id && (
                      <Text style={styles.optionId}>{option.id}</Text>
                    )}
                    {option.text && (
                      <Text style={styles.optionText}>{option.text}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
      {/* Back Button */}
      {<TouchableOpacity
        style={[
          styles.backButton,
          currentQuestion === 0 && styles.disabledButton]}
        onPress={handleBack}
        disabled={currentQuestion === 0}>
        <Text style={styles.backButton}> {'<'} </Text>
      </TouchableOpacity>}
      {/* close button */}
      <TouchableOpacity onPress={handleQuit}>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerText}> Quiz </Text> 
      </View>
      {renderProgressBar()}
      {renderQuestion()}

        


      <TouchableOpacity
        style={[
          styles.continueButton,
          selectedAnswer !== null && styles.continueButtonActive,
        ]}
        onPress={handleContinue}
        disabled={selectedAnswer === null}
      >
        <Text style={styles.continueButtonText}>CONTINUE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer:{
    flexDirection: 'row', 
    justifyContent: 'space-between',  
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
  },

  container: {
    flex: 1,
    backgroundColor: '#E6E6FA',
  },
// Welcome page style 
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 100,
    marginStart: 70,
  },

  welcomeImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 30,
    marginStart: 70,
  },

  startButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',  
    alignItems: 'center',        
    paddingBottom: 30,           
  },

  startButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    margin: 5,
    padding: 5,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 25,
    fontWeight: '600',
  },
  backButton:{
    fontSize: 30,
    fontWeight: '600',
    color: 'black',
  },

  closeButton: {
    fontSize: 30,
    fontWeight: '600',
    color: 'black',
    marginLeft: 'auto',
    marginTop:'auto',
  },
  progressContainer: {
    padding: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6A5ACD',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'right',
    color: '#666',
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  questionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: '#F0F0FF',
    borderColor: '#6A5ACD',
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  optionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  continueButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#9290A3',
    borderRadius: 8,
    opacity: 0.5,
  },
  continueButtonActive: {
    backgroundColor: '#6A5ACD',
    opacity: 1,
  },
  continueButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuizApp;
