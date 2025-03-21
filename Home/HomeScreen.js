import React, { useState, useRef } from 'react';
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
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';


const HomeScreen = () => {
  const navigation = useNavigation(); //Hook to access navigation object
  const [showUserId, setShowUserId] = useState(false); //State to toggle user ID display
  const [menuOpen, setMenuOpen] = useState(false); //State to toggle menu open/close
  
  // Animation values
  const addButtonRotation = useRef(new Animated.Value(0)).current; //For rotating the add button
  const menuHeight = useRef(new Animated.Value(0)).current; // For animating the menu height
  
  // Toggle user ID display
  const toggleUserId = () => {
    setShowUserId(!showUserId);
  };
  
  // Toggle menu animation
  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1; // Determine the target value for animation
    
    // Animate both the button rotation and menu height simultaneously
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
    
    setMenuOpen(!menuOpen); // Toggle men state
  };
  
  // Interpolate rotation for + to x animation
  const rotateInterpolation = addButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'] //Rotate from 0 to 45 degrees
  });
  
  // Interpolate height for menu animation
  const menuHeightInterpolation = menuHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100] //Animate height from 0 to 100
  });

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
              <TouchableOpacity>
                <Text style={[styles.tabText, styles.inactiveTab]}>CHALLENGES</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}  onPress={() => navigation.navigate('Scheduler', {}, { animation: 'slide_from_right' })} >See all</Text>
            </TouchableOpacity>
          </View>
           
          {/* Task Cards */}
          <View style={styles.taskCards}>
            <TouchableOpacity 
              style={styles.taskCard}
              activeOpacity={0.7}
            >
              <Ionicons name="flame-outline" size={24} color="#4A86FF" />
              <Text style={styles.taskTitle}>Lesson Time</Text>
              <Text style={styles.taskSubtitle}>TASK 01</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.taskCard}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={24} color="#4A86FF" />
              <Text style={styles.taskTitle}>Coursework</Text>
              <Text style={styles.taskSubtitle}>TASK 02</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.taskCard}
              activeOpacity={0.7}
            >
              <AntDesign name="questioncircleo" size={23} color="#4A86FF" />
              <Text style={styles.taskTitle}>Do Quiz</Text>
              <Text style={styles.taskSubtitle}>TASK 03</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ongoing Lessons Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ongoing Lessons</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
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
              <Text style={styles.dueDate}>Due on : 21 March</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>75%</Text>
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
              <Text style={styles.dueDate}>Due on : 04 April</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>50%</Text>
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
              <Text style={styles.dueDate}>Due on : 06 June</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>60%</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Add extra padding at bottom for scrolling past the nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Popup Menu */}
      <Animated.View style={[styles.popupMenu, { height: menuHeightInterpolation }]}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}   onPress={() => navigation.navigate('Translator', {}, { animation: 'slide_from_right' })}>Translator</Text>
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
        <TouchableOpacity style={styles.navItem}  onPress={() => navigation.navigate("ProgressAnalysis" , {}, { animation: 'slide_from_right' })}>
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
  taskCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '30%',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    transform: [{ scale: 1 }],
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
});

export default HomeScreen;