import React, { useState, useRef, useEffect } from 'react';
import { 
  KeyboardAvoidingView,
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform,
  Image, 
  ScrollView,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [showUserId, setShowUserId] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Animation values
  const addButtonRotation = useRef(new Animated.Value(0)).current;
  const menuHeight = useRef(new Animated.Value(0)).current;
  
  // Instructions states
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Coming Soon popup state
  const [showComingSoon, setShowComingSoon] = useState(false);
  const comingSoonAnimation = useRef(new Animated.Value(0)).current;
  
  // Check if user is new on component mount
  useEffect(() => {
    checkIfFirstTimeUser();
  }, []);
  
  // Effect to animate the coming soon popup when it opens
  useEffect(() => {
    if (showComingSoon) {
      Animated.spring(comingSoonAnimation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      comingSoonAnimation.setValue(0);
    }
  }, [showComingSoon]);
  
  const checkIfFirstTimeUser = async () => {
    try {
      const hasSeenInstructions = await AsyncStorage.getItem('@instructions_viewed');
      if (hasSeenInstructions !== 'true') {
        setShowInstructions(true);
      }
    } catch (e) {
      console.log('Failed to load user status');
      setShowInstructions(true);
    }
  };
  
  const completeInstructions = async () => {
    try {
      await AsyncStorage.setItem('@instructions_viewed', 'true');
      setShowInstructions(false);
    } catch (e) {
      console.log('Failed to save instructions status');
      setShowInstructions(false);
    }
  };
  
  // Toggle user ID display
  const toggleUserId = () => {
    setShowUserId(!showUserId);
  };
  
  // Toggle menu animation
  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    
    Animated.parallel([
      Animated.timing(addButtonRotation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(menuHeight, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
    
    setMenuOpen(!menuOpen);
  };
  
  // Show coming soon popup
  const handleSpeechTherapyPress = () => {
    setShowComingSoon(true);
  };
  
  // Close coming soon popup
  const closeComingSoon = () => {
    Animated.timing(comingSoonAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowComingSoon(false);
    });
  };
  
  // Interpolate rotation for + to x animation
  const rotateInterpolation = addButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });
  
  // Interpolate height for menu animation
  const menuHeightInterpolation = menuHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100]
  });
  
  // Coming soon popup animations
  const popupScale = comingSoonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1]
  });
  
  const popupOpacity = comingSoonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  // Instructions data
  const instructions = [
    {
      title: "Home Screen Overview",
      content: "The top of the screen displays your User ID. Tap to toggle between showing and hiding your ID.",
      position: { top: 80, left: 20 },
      pointer: { top: 30, left: Dimensions.get('window').width - 70 }
    },
    {
      title: "Daily Tasks",
      content: "Here you'll find your daily tasks. Complete these to track your progress.",
      position: { top: 200, left: 20 },
      pointer: { top: 170, left: Dimensions.get('window').width / 2 }
    },
    {
      title: "Ongoing Lessons",
      content: "Track your active courses, quizzes, and virtual room sessions with their due dates and completion percentages.",
      position: { top: 350, left: 20 },
      pointer: { top: 320, left: Dimensions.get('window').width - 50 }
    },
    {
      title: "Quizzes",
      content: "Tap on a quiz card to start or resume a quiz.",
      position: { top: 350, left: 20 },
      pointer: { top: 340, left: Dimensions.get('window').width -50 }
    },
    {
      title: "Virtual Room",
      content: "Tap on a virtual room card to join and play quizzes with other players",
      position: { bottom: 150, left: 20 },
      pointer: { bottom: 85, left: Dimensions.get('window').width / 2 }
    },
    {
      title: "Quick Actions Menu",
      content: "Tap the + button to access quick actions like the Translator and adding to your Schedule.",
      position: { bottom: 150, left: 20 },
      pointer: { bottom: 85, left: Dimensions.get('window').width / 2 }
    },
    {
      title: "Navigation Bar",
      content: "Use these icons to navigate between Home, Progress Analysis, Notifications, and Profile screens.",
      position: { bottom: 100, left: 20 },
      pointer: { bottom: 40, left: Dimensions.get('window').width / 4 }
    }
  ];
  
  // Navigation through instructions
  const nextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeInstructions();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const skipAll = () => {
    completeInstructions();
  };

  // Task data
  const taskItems = [
    {
      id: 1,
      icon: "flame-outline",
      title: "Lesson Time",
      subtitle: "TASK 01"
    },
    {
      id: 2,
      icon: "time-outline",
      title: "Coursework",
      subtitle: "TASK 02"
    },
    {
      id: 3,
      icon: "help-circle-outline",
      title: "Do Quiz",
      subtitle: "TASK 03"
    },
    {
      id: 4,
      icon: "document-text-outline",
      title: "Assignments",
      subtitle: "TASK 04"
    },
    {
      id: 5,
      icon: "create-outline",
      title: "Sign Forms",
      subtitle: "TASK 05"
    },
    {
      id: 6,
      icon: "book-outline",
      title: "Reading",
      subtitle: "TASK 06"
    },
    {
      id: 7,
      icon: "laptop-outline",
      title: "Lab Work",
      subtitle: "TASK 07"
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('./assets/logo.png')} 
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity 
          style={styles.userButton}
          onPress={toggleUserId}
          activeOpacity={0.8}
        >
          <Text style={styles.userText}>
          {showUserId ? "VIT5643" : "USER ID"}  
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.tasksHeader}>
              <TouchableOpacity style={styles.tabIndicator}>
                <Ionicons name="grid-outline" size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.tabText} >DAILY TASKS</Text>
              </TouchableOpacity>
          
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll} onPress={() => navigation.navigate('Scheduler', {}, { animation: 'slide_from_right' })}>See all</Text>
            </TouchableOpacity>
          </View>
           
          {/* Horizontal Scrollable Task Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.taskScrollContainer}
            contentContainerStyle={styles.taskScrollContent}
          >
            {taskItems.map((task) => (
              <TouchableOpacity 
                key={task.id}
                style={styles.taskCard}
                activeOpacity={0.7}
              >
                <Ionicons name={task.icon} size={24} color="#4A86FF" />
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Ongoing Lessons Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ongoing Lessons</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll} onPress={() => navigation.navigate('LearnPathway', {}, { animation: 'slide_from_right' })}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Lessons Card */}
          <TouchableOpacity 
            style={styles.lessonCard} 
            onPress={() => navigation.navigate('Lesson', {}, { animation: 'slide_from_right' })}
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.cardTitle}>Lessons</Text>
              <Text style={styles.activeText}>Active</Text>
              <View style={styles.avatarRow}>
                <View style={[styles.avatar, { backgroundColor: '#FFC107' }]} />
                <View style={[styles.avatar, { backgroundColor: '#FF9800' }]} />
                <View style={[styles.avatar, { backgroundColor: '#FF5722' }]} />
              </View>
              <Text style={styles.dueDate}>Due on : 21 April</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>0%</Text>
            </View>
          </TouchableOpacity>

          {/* Quizzes Card */}
          <TouchableOpacity 
            style={styles.lessonCard} 
            onPress={() => navigation.navigate('Quiz', {}, { animation: 'slide_from_right' })}
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.cardTitle}>Quizzes</Text>
              <Text style={styles.activeText}>Active</Text>
              <View style={styles.avatarRow}>
                <View style={[styles.avatar, { backgroundColor: '#FFC107' }]} />
                <View style={[styles.avatar, { backgroundColor: '#FF9800' }]} />
                <View style={[styles.avatar, { backgroundColor: '#FF5722' }]} />
              </View>
              <Text style={styles.dueDate}>Due on : 13 April</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>0%</Text>
            </View>
          </TouchableOpacity>

          {/* Virtual Room Card */}
          <TouchableOpacity 
            style={styles.lessonCard} 
            onPress={() => navigation.navigate('VirtualRoom', {}, { animation: 'slide_from_right' })}
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.cardTitle}>Virtual Room</Text>
              <Text style={styles.activeText}>Active</Text>
              <View style={styles.avatarRow}>
                <View style={[styles.avatar, { backgroundColor: '#FFC107' }]} />
                <View style={[styles.avatar, { backgroundColor: '#FF9800' }]} />
                <View style={[styles.avatar, { backgroundColor: '#FF5722' }]} />
              </View>
              <Text style={styles.dueDate}>Due on : 2 May</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>0%</Text>
            </View>
          </TouchableOpacity>

          {/* Speech Therapy Card - Now triggers the Coming Soon popup */}
          <TouchableOpacity 
            style={styles.lessonCard} 
            onPress={handleSpeechTherapyPress}
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.cardTitle}>Speech Therapy</Text>
              <Text style={styles.activeText}>Active</Text>
              <View style={styles.avatarRow}>
                <View style={[styles.avatar, { backgroundColor: '#FFC107' }]} />
                <View style={[styles.avatar, { backgroundColor: '#FF9800' }]} />
                <View style={[styles.avatar, { backgroundColor: '#FF5722' }]} />
              </View>
              <Text style={styles.dueDate}>Coming Soon</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>0%</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Add extra padding at bottom for scrolling past the nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Popup Menu */}
      <Animated.View style={[styles.popupMenu, { height: menuHeightInterpolation }]}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText} onPress={() => navigation.navigate('Translator', {}, { animation: 'slide_from_right' })}>Translator</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText} onPress={() => navigation.navigate('Scheduler', {}, { animation: 'slide_from_right' })}>ADD SCHEDULE</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="grid-outline" size={24} color="#352561" />
          <View style={styles.activeNavIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ProgressAnalysis", {}, { animation: 'slide_from_right' })}>
          <Feather name="pie-chart" size={26} color="#9E9AA7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={toggleMenu}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <Ionicons name="add" size={32} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notifications', {}, { animation: 'slide_from_right' })}>
          <Ionicons name="notifications-outline" size={24} color="#9E9AA7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile', {}, { animation: 'slide_from_right' })}>
          <Ionicons name="person-outline" size={24} color="#9E9AA7" />
        </TouchableOpacity>
      </View>

      {/* Instructions Modal Overlay */}
      <Modal
        transparent={true}
        visible={showInstructions}
        animationType="fade"
        onRequestClose={skipAll}
      >
        <View style={styles.instructionsContainer}>
          {/* Instruction card */}
          <View style={[styles.instructionCard, instructions[currentStep].position]}>
            <Text style={styles.instructionTitle}>
              {instructions[currentStep].title}
            </Text>
            <Text style={styles.instructionText}>
              {instructions[currentStep].content}
            </Text>
            
            {/* Progress dots */}
            <View style={styles.progressIndicator}>
              {instructions.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.progressDot, 
                    index === currentStep ? styles.activeDot : {}
                  ]} 
                />
              ))}
            </View>
            
            {/* Navigation buttons */}
            <View style={styles.instructionButtons}>
              {currentStep > 0 && (
                <TouchableOpacity 
                  style={styles.prevButton} 
                  onPress={prevStep}
                >
                  <Text style={styles.buttonText}>Prev</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={nextStep}
              >
                <Text style={styles.buttonText}>
                  {currentStep === instructions.length - 1 ? "Done" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Pointer arrow */}
          <View style={[styles.pointerArrow, instructions[currentStep].pointer]} />
          
          {/* Skip button */}
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={skipAll}
          >
            <Text style={styles.skipText}>Skip Tutorial</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Coming Soon Modal Popup */}
      <Modal
        transparent={true}
        visible={showComingSoon}
        animationType="fade"
        onRequestClose={closeComingSoon}
      >
        <View style={styles.comingSoonContainer}>
          <Animated.View 
            style={[
              styles.comingSoonContent,
              { 
                transform: [{ scale: popupScale }],
                opacity: popupOpacity 
              }
            ]}
          >
            {/* Close button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeComingSoon}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            {/* Icon */}
            <View style={styles.comingSoonIconContainer}>
              <Ionicons name="mic-outline" size={64} color="#FFFFFF" />
            </View>
            
            {/* Title */}
            <Text style={styles.comingSoonTitle}>Speech Therapy</Text>
            
            {/* Coming soon text */}
            <Text style={styles.comingSoonText}>
              Exciting new features are on the way!
            </Text>
            
            {/* Info text */}
            <Text style={styles.comingSoonInfo}>
              Our team is working hard to bring you advanced speech therapy tools. 
              Stay tuned for updates!
            </Text>
            
            {/* Details button */}
            <TouchableOpacity 
              style={styles.notifyButton}
              onPress={closeComingSoon}
            >
              <Text style={styles.notifyButtonText}>Notify Me</Text>
            </TouchableOpacity>
            
            {/* Progress indicator */}
            <View style={styles.comingSoonProgress}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressPercent}>80% Complete</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// StylesSheet
const styles = StyleSheet.create({
  // Main container style
  container: {
    flex: 1, 
    backgroundColor: '#B2B5E7',
  },
  // Header section styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },

  logo: {
    width: 40,
    height: 40,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingTop: 40,
  },
  //User ID button
  userButton: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userText: {
    color: '#6B5ECD',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  // Section header style (for titles and "See all" buttons)
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIndicator: {
    backgroundColor: '#352561',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 16,
  },
  inactiveTab: {
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAll: {
    color: '#352561',
    fontSize: 14,
    fontWeight: '600',
  },
  // Horizontal scrolling task cards
  taskScrollContainer: {
    marginBottom: 10,
  },
  taskScrollContent: {
    paddingRight: 16, // Add some right padding for the last item
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: 110, // Fixed width for each card
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginRight: 12, // Space between cards
  },
  taskTitle: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  taskSubtitle: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
  },
  lessonCard: {
    backgroundColor: '#4E3D81',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeText: {
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 4,
    fontSize: 13,
  },
  avatarRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 4,
  },
  dueDate: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 13,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  progressText: {
    color: '#4E3D81',
    fontWeight: 'bold',
    fontSize: 15,
  },
  popupMenu: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(107, 94, 205, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  menuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  activeNavIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#352561',
    position: 'absolute',
    bottom: -6,
  },
  addButton: {
    backgroundColor: '#6B5ECD',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    bottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  bottomPadding: {
    height: 80,
  },
  
  // Instruction overlay styles
  instructionsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  instructionCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#352561',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  progressIndicator: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B2B5E7',
    marginRight: 4,
  },
  activeDot: {
    backgroundColor: '#6B5ECD',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  instructionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  prevButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#B2B5E7',
    marginRight: 8,
  },
  nextButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#6B5ECD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  pointerArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    transform: [{ rotate: '180deg' }],
  },
  
// Coming Soon popup styles
comingSoonContainer: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  justifyContent: 'center',
  alignItems: 'center',
},
comingSoonContent: {
  backgroundColor: '#4E3D81',
  borderRadius: 20,
  padding: 24,
  width: '85%',
  maxWidth: 340,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.4,
  shadowRadius: 8,
  elevation: 8,
},
closeButton: {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  alignItems: 'center',
  justifyContent: 'center',
},
comingSoonIconContainer: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: '#6B5ECD',
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 16,
},
comingSoonTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#FFFFFF',
  marginBottom: 8,
},
comingSoonText: {
  fontSize: 18,
  color: '#FFFFFF',
  marginBottom: 16,
  textAlign: 'center',
  fontWeight: '600',
},
comingSoonInfo: {
  fontSize: 14,
  color: '#FFFFFF',
  opacity: 0.8,
  textAlign: 'center',
  marginBottom: 24,
  lineHeight: 20,
},
notifyButton: {
  backgroundColor: '#B2B5E7',
  paddingVertical: 12,
  paddingHorizontal: 32,
  borderRadius: 25,
  marginBottom: 20,
},
notifyButtonText: {
  color: '#352561',
  fontSize: 16,
  fontWeight: 'bold',
},
comingSoonProgress: {
  width: '100%',
  alignItems: 'center',
},
progressBar: {
  width: '100%',
  height: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 4,
  marginBottom: 8,
  overflow: 'hidden',
},
progressFill: {
  width: '80%',
  height: '100%',
  backgroundColor: '#FFC107',
  borderRadius: 4,
},
progressPercent: {
  color: '#FFFFFF',
  fontSize: 12,
  opacity: 0.8,
}
});

export default HomeScreen;