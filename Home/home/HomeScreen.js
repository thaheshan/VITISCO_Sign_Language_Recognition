import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

      {/* Daily Tasks Section */}
      <View style={styles.section}>
        <View style={styles.tasksHeader}>
          <Ionicons name="grid" size={24} color="#000" />
          <Text style={styles.sectionTitle}>DAILY TASKS</Text>
          <Text style={styles.sectionTitle}>CHALLENGES</Text>
        </View>

        <View style={styles.taskCards}>
          <TouchableOpacity style={styles.taskCard}>
            <Ionicons name="time" size={24} color="#6B5ECD" />
            <Text style={styles.taskTitle}>Lesson Time</Text>
            <Text style={styles.taskSubtitle}>TASK 01</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskCard}>
            <Ionicons name="book" size={24} color="#6B5ECD" />
            <Text style={styles.taskTitle}>Coursework</Text>
            <Text style={styles.taskSubtitle}>TASK 02</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskCard}>
            <Ionicons name="help-circle" size={24} color="#6B5ECD" />
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
              <View style={styles.avatar} />
              <View style={styles.avatar} />
              <View style={styles.avatar} />
            </View>
            <Text style={styles.dueDate}>Due on : 21 March</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>75%</Text>
          </View>
        </TouchableOpacity>

        {/* Quizzes Card */}
        <TouchableOpacity style={styles.QuizzCard}>
          <View>
            <Text style={styles.cardTitle}>Quizzes</Text>
            <Text style={styles.activeText}>Active</Text>
            <View style={styles.avatarRow}>
              <View style={styles.avatar} />
              <View style={styles.avatar} />
              <View style={styles.avatar} />
            </View>
            <Text style={styles.dueDate}>Due on : 04 April</Text>
          </View>
        </TouchableOpacity>

        {/* Virtual Room Card */}
        <TouchableOpacity style={styles.QuizzCard}>
          <Text style={styles.cardTitle}>Virtual Room</Text>
          <Text style={styles.activeText}>Active</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="grid" size={24} color="#6B5ECD" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time" size={24} color="#6B5ECD" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications" size={24} color="#6B5ECD" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#6B5ECD" />
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
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userButton: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
  },
  userText: {
    color: '#6B5ECD',
  },
  section: {
    padding: 16,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  taskCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '30%',
  },
  taskTitle: {
    marginTop: 8,
    fontWeight: '600',
  },
  taskSubtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    color: '#6B5ECD',
  },
  lessonCard: {
    backgroundColor: '#352561',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  QuizzCard: {
    backgroundColor: '#6154EF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeText: {
    color: '#FFF',
    opacity: 0.7,
    marginTop: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 4,
  },
  dueDate: {
    color: '#FFF',
    marginTop: 8,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#483D8B',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#6B5ECD',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
});

export default HomeScreen;