import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Progress Bar Component
const ProgressBar = ({ current, total }) => {
  const progress = (current / total) * 100;
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{current}/{total}</Text>
    </View>
  );
};

// Welcome Screen
const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeTitle}>WELCOME TO THE BASIC LEVEL OF LESSONS FOR SINHALA FROM ENGLISH THROUGH SIGN LANGUAGE SYSTEM.</Text>
      
      <TouchableOpacity 
        style={styles.beginButton}
        onPress={() => navigation.navigate('Loading')}
      >
        <Text style={styles.nextButtonText}>BEGIN</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Loading Screen
const LoadingScreen = ({ navigation }) => {
  React.useEffect(() => {
    // Automatically navigate to customization after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Customization');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContent}>
        <Image
          source={require('./assets/adaptive-icon.png')}
          style={styles.characterImage}
          resizeMode="contain"
        />
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>30%</Text>
        </View>
        <Text style={styles.loadingText}>
          Hi User Name,{'\n'}
          Our Assistance are Preparing{'\n'}
          a lesson plan for your learning
        </Text>
        <View style={styles.dotLine} />
      </View>
    </SafeAreaView>
  );
};

// Customization Screen
const CustomizationScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.customizeTitle}>Do You Want To Customize Your Learning Pathway?</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => navigation.navigate('ReadyCountdown')}
        >
          <Text style={styles.optionButtonText}>YES</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => navigation.navigate('ReadyCountdown')}
        >
          <Text style={styles.optionButtonText}>NO</Text>
        </TouchableOpacity>
      </View>
      
      <Image
        source={require('./assets/favicon.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// Ready Countdown Screen
const ReadyCountdownScreen = ({ navigation }) => {
  React.useEffect(() => {
    // Automatically navigate to get started screen after countdown
    const timer = setTimeout(() => {
      navigation.navigate('GetStarted');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.levelIndicator}>BASIC LEVEL (LEVEL 4)</Text>
      
      <View style={styles.countdownContainer}>
        <Text style={styles.countdownText}>BE READY IN</Text>
        <View style={styles.countdownCircle}>
          <Text style={styles.countdownNumber}>10</Text>
          <Text style={styles.countdownUnit}>SECONDS</Text>
        </View>
      </View>
      
      <Image
        source={require('./assets/image 01.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// Get Started Screen
const GetStartedScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.levelIndicator}>BASIC LEVEL (LEVEL 4)</Text>
      
      <Text style={styles.getStartedTitle}>LET'S{'\n'}GET</Text>
      
      <Image
        source={require('./assets/adaptive-icon.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => navigation.navigate('WelcomeLessons')}
      >
        <Text style={styles.nextButtonText}>START</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Welcome to Lessons Screen
const WelcomeLessonsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeLessonsTitle}>WELCOME TO THE LESSONS!!!</Text>
      
      <Image
        source={require('./assets/splash-icon.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
      
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => navigation.navigate('LearningPathway')}
      >
        <Text style={styles.nextButtonText}>CONTINUE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Learning Pathway Screen
const LearningPathwayScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.levelIndicator}>LESSON (BASIC LEVEL)</Text>
      
      <View style={styles.pathwayContainer}>
        {/* Create circular nodes for the learning pathway */}
        <View style={styles.pathwayNode}>
          <Image
            source={require('./assets/favicon.png')}
            style={styles.avatarIcon}
            resizeMode="contain"
          />
        </View>
        
        {/* Add pathway nodes */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.pathwayCircle, 
              index === 4 ? styles.giftNode : {},
              index === 5 ? styles.largeNode : {}
            ]}
            onPress={() => navigation.navigate('AlphabetLearning')}
          >
            {index === 4 && (
              <Image
                source={require('./assets/favicon.png')}
                style={styles.nodeIcon}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

// Alphabet Learning Screen (Original Component Updated)
const AlphabetLearningScreen = ({ navigation }) => {
  const [currentLesson, setCurrentLesson] = useState(1);
  const totalLessons = 6;
  
  const goToNextLesson = () => {
    if (currentLesson < totalLessons) {
      setCurrentLesson(currentLesson + 1);
    } else {
      navigation.navigate('LearningPathway');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.basicText}>BASIC LEVEL</Text>
      </View>
      
      <Text style={styles.levelText}>LEVEL 01</Text>
      
      <ProgressBar current={currentLesson} total={totalLessons} />
      
      <View style={styles.letterContainer}>
        <Text style={styles.letterText}>A</Text>
        <Image
          source={require('./assets/icon.png')}
          style={styles.letterImage}
          resizeMode="contain"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={goToNextLesson}
      >
        <Text style={styles.nextButtonText}>NEXT</Text>
      </TouchableOpacity>
    </View>
  );
};

// Create the stack navigator
const Stack = createStackNavigator();

// Main App component with navigation
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Customization" component={CustomizationScreen} />
        <Stack.Screen name="ReadyCountdown" component={ReadyCountdownScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="WelcomeLessons" component={WelcomeLessonsScreen} />
        <Stack.Screen name="LearningPathway" component={LearningPathwayScreen} />
        <Stack.Screen name="AlphabetLearning" component={AlphabetLearningScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5c6e8',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 30,
    alignItems: 'center',
  },
  basicText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
    marginVertical: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5d5b8d',
    borderRadius: 10,
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  letterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#000',
  },
  letterImage: {
    width: width * 0.8,
    height: height * 0.4,
    marginTop: -60,
  },
  nextButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 50,
  },
  beginButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
    alignSelf: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 20,
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#5d5b8d',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#383773',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#383773',
    marginVertical: 10,
  },
  dotLine: {
    width: width * 0.7,
    height: 2,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#383773',
    marginTop: 10,
  },
  customizeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  levelIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 40,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 40,
  },
  countdownText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#383773',
    marginBottom: 20,
  },
  countdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#5d5b8d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383773',
  },
  countdownUnit: {
    fontSize: 10,
    color: '#383773',
  },
  getStartedTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginTop: 40,
  },
  startButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
    alignSelf: 'center',
  },
  welcomeLessonsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#383773',
    textAlign: 'center',
    marginTop: 60,
  },
  continueButton: {
    backgroundColor: '#5d5b8d',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
    alignSelf: 'center',
  },
  pathwayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
  },
  pathwayNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 40,
  },
  pathwayCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a86e8',
    margin: 10,
    position: 'absolute',
  },
  giftNode: {
    backgroundColor: '#4a86e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeNode: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarIcon: {
    width: 30,
    height: 30,
  },
  nodeIcon: {
    width: 24,
    height: 24,
  },
});

export default App;