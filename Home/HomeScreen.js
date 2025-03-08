import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';


const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('./assets/logo.png')} 
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity style={styles.userButton}>
          <Text style={styles.userText}>USER ID</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily Tasks Section */}
        <View style={styles.section}>
          <View style={styles.tasksHeader}>
            <TouchableOpacity style={styles.tabIndicator}>
              <Ionicons name="grid-outline" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity>
            <Text style={styles.tabText}>DAILY TASKS</Text>
            </TouchableOpacity>
            <TouchableOpacity>
            <Text style={[styles.tabText, styles.inactiveTab]}>CHALLENGES</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taskCards}>
            <TouchableOpacity style={styles.taskCard}>
              <Ionicons name="flame-outline" size={24} color="#4A86FF" />
              <Text style={styles.taskTitle}>Lesson Time</Text>
              <Text style={styles.taskSubtitle}>TASK 01</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskCard}>
              <Ionicons name="time-outline" size={24} color="#4A86FF" />
              <Text style={styles.taskTitle}>Coursework</Text>
              <Text style={styles.taskSubtitle}>TASK 02</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskCard}>
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
          <TouchableOpacity style={styles.lessonCard}>
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
          <TouchableOpacity style={styles.lessonCard}>
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
          </TouchableOpacity>

          {/* Virtual Room Card */}
          <TouchableOpacity style={styles.lessonCard}>
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
          </TouchableOpacity>
        </View>
        
        {/* Add extra padding at bottom for scrolling past the nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="grid-outline" size={24} color="#352561" />
          <View style={styles.activeNavIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="pie-chart" size={26} color="#9E9AA7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={24} color="#9E9AA7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#9E9AA7" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B2B5E7',
  },
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
  userButton: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
  },
  userText: {
    color: '#6B5ECD',
    fontSize: 12,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  seeAll: {
    color: '#352561',
    fontSize: 14,
  },
  lessonCard: {
    backgroundColor: '#4E3D81',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  bottomPadding: {
    height: 80, // Add padding at the bottom to allow scrolling past the nav bar
  },
});

export default HomeScreen;