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
} from 'react-native';

const QuizApp = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = [
    /*{
      id: 1,
      title: 'Time Consuming',
      options: [
        { id: 'A', text: 'A', icon: require('./assets/zu1.jpg') },
        { id: 'B', text: 'B', icon: require('./assets/zu2.jpg') },
        { id: 'C', text: 'C', icon: require('./assets/zu3.jpg') },
      ],
    },*/
    {
      id: 2,
      title: '',
      image: require('./assets/download.jpeg'),
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'C' },
        { id: 'C', text: 'B' },
      ],
    },
    {
      id: 3,
      title: 'select the correct sign for B',
      options: [
        { image: require('./assets/zu2.jpg') },
        { image: require('./assets/zu1.jpg') },
        { image: require('./assets/zu3.jpg') },
        { image: require('./assets/zu1.jpg') },
      ],
      gridView: true,
    },
  ];

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    }
  };

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
                  {option.icon && (
                    <Image source={option.icon} style={styles.optionIcon} />
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
      <View style={styles.header}>
        <Text style={styles.headerText}>Fantasy Quiz #{156}</Text>
        <TouchableOpacity>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: '#E6E6FA',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Ensures space for the continue button
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '600',
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
  optionIcon: {
    width: 32,
    height: 32,
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