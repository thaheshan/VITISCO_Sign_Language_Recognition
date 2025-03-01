import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  Image,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import CalendarPicker from 'react-native-calendar-picker';
import * as Haptics from 'expo-haptics';

// Mock for user profile image
const defaultUserImage = 'https://randomuser.me/api/portraits/lego/1.jpg';

// Icons for the app
const Icons = {
  Home: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>🏠</Text>
    </View>
  ),
  Stats: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>📊</Text>
    </View>
  ),
  Add: (props) => (
    <View style={[styles.icon, props.style, { backgroundColor: '#8a6eff', padding: 10, borderRadius: 20 }]}>
      <Text style={{ fontSize: 22, color: 'white' }}>+</Text>
    </View>
  ),
  Notifications: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>🔔</Text>
    </View>
  ),
  Profile: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>👤</Text>
    </View>
  ),
  Fire: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>🔥</Text>
    </View>
  ),
  Clock: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>⏰</Text>
    </View>
  ),
  Book: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>📚</Text>
    </View>
  ),
  Quiz: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>❓</Text>
    </View>
  ),
  Menu: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>☰</Text>
    </View>
  ),
  Back: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>←</Text>
    </View>
  ),
};

// Main App component
const App = () => {
  const [currentPage, setCurrentPage] = useState('Home');
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Lessons',
      type: 'lesson',
      status: 'Active',
      progress: 75,
      dueDate: '21 March',
      participants: 3,
    },
    {
      id: '2',
      title: 'Quizzes',
      type: 'quiz',
      status: 'Active',
      progress: 0,
      dueDate: '04 April',
      participants: 3,
    },
    {
      id: '3',
      title: 'Virtual Room',
      type: 'virtual',
      status: 'Active',
      progress: 0,
      dueDate: '',
      participants: 0,
    },
  ]);
  
  const [dailyTasks, setDailyTasks] = useState([
    { id: 'dt1', title: 'Lesson Time', taskNumber: '01', icon: 'Fire' },
    { id: 'dt2', title: 'Coursework', taskNumber: '02', icon: 'Clock' },
    { id: 'dt3', title: 'Do Quiz', taskNumber: '03', icon: 'Quiz' },
  ]);
  
  const [scheduleItems, setScheduleItems] = useState([
    { 
      id: 's1', 
      date: new Date(2025, 2, 15), 
      tasks: [
        { id: 't1', title: 'Math Homework', status: 'done', time: '10:00 AM' },
        { id: 't2', title: 'Physics Study', status: 'in_progress', time: '2:00 PM' },
      ]
    },
    { 
      id: 's2', 
      date: new Date(2025, 2, 20), 
      tasks: [
        { id: 't3', title: 'History Essay', status: 'not_started', time: '11:00 AM' },
      ]
    },
  ]);
  
  // States for adding new tasks
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState('not_started');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  
  // Learning suggestions
  const learningSuggestions = [
    'Try the Pomodoro technique: 25 minutes of focus followed by a 5-minute break',
    'Review your notes within 24 hours of taking them to improve retention',
    'Take breaks to avoid burnout and improve productivity',
    'Stay hydrated and get enough sleep to optimize learning',
    'Set specific, achievable goals for each study session',
  ];
  
  // Helper function to format date
  const formatDate = (date) => {
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Animation functions
  useEffect(() => {
    if (showAddModal) {
      // Animate modal in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate modal out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showAddModal]);
  
  // Function to add a new task
  const addNewTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    
    // Find if there's already a schedule for the selected date
    const existingScheduleIndex = scheduleItems.findIndex(
      item => item.date.toDateString() === selectedDate.toDateString()
    );
    
    const newTask = {
      id: `t${Date.now()}`,
      title: newTaskTitle,
      status: taskStatus,
      time: selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    if (existingScheduleIndex !== -1) {
      // Add to existing schedule
      const updatedScheduleItems = [...scheduleItems];
      updatedScheduleItems[existingScheduleIndex].tasks.push(newTask);
      setScheduleItems(updatedScheduleItems);
    } else {
      // Create new schedule
      const newSchedule = {
        id: `s${Date.now()}`,
        date: new Date(selectedDate),
        tasks: [newTask],
      };
      setScheduleItems([...scheduleItems, newSchedule]);
    }
    
    // Reset form and close modal
    setNewTaskTitle('');
    setTaskStatus('not_started');
    setShowAddModal(false);
    // Haptic feedback on success
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Function to update task status
  const updateTaskStatus = (scheduleId, taskId, newStatus) => {
    const updatedScheduleItems = scheduleItems.map(schedule => {
      if (schedule.id === scheduleId) {
        const updatedTasks = schedule.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, status: newStatus };
          }
          return task;
        });
        return { ...schedule, tasks: updatedTasks };
      }
      return schedule;
    });
    
    setScheduleItems(updatedScheduleItems);
    // Haptic feedback on status change
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Render status badge based on status
  const renderStatusBadge = (status) => {
    let color;
    let label;
    
    switch (status) {
      case 'done':
        color = '#4CAF50';
        label = 'Done';
        break;
      case 'in_progress':
        color = '#FFC107';
        label = 'In Progress';
        break;
      case 'not_started':
      default:
        color = '#F44336';
        label = 'Not Started';
        break;
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{label}</Text>
      </View>
    );
  };
  
  // Function to get a random learning suggestion
  const getRandomSuggestion = () => {
    const randomIndex = Math.floor(Math.random() * learningSuggestions.length);
    return learningSuggestions[randomIndex];
  };
  
  // Render the Home page
  const renderHomePage = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity style={styles.userButton}>
          <Text style={styles.userButtonText}>USER ID</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabSection}>
        <Icons.Menu />
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={styles.tabText}>DAILY TASKS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>CHALLENGES</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.dailyTasksContainer}>
        {dailyTasks.map(task => (
          <TouchableOpacity 
            key={task.id} 
            style={styles.taskCard}
            onPress={() => {
              // Simulate task selection with haptic feedback
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            {task.icon === 'Fire' && <Icons.Fire />}
            {task.icon === 'Clock' && <Icons.Clock />}
            {task.icon === 'Quiz' && <Icons.Quiz />}
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskNumber}>TASK {task.taskNumber}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ongoing Lessons</Text>
        <TouchableOpacity onPress={() => setCurrentPage('Schedule')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      
      {tasks.map(task => (
        <View key={task.id} style={styles.lessonCard}>
          <View style={styles.lessonCardHeader}>
            <Text style={styles.lessonTitle}>{task.title}</Text>
            {task.progress > 0 && (
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>{task.progress}%</Text>
              </View>
            )}
          </View>
          <View style={styles.lessonCardContent}>
            <Text style={styles.statusText}>Active</Text>
            {task.participants > 0 && (
              <View style={styles.participantsContainer}>
                {[...Array(Math.min(task.participants, 3))].map((_, index) => (
                  <View key={index} style={[styles.participantAvatar, { left: index * -10 }]}>
                    <Text>👤</Text>
                  </View>
                ))}
              </View>
            )}
            {task.dueDate && (
              <Text style={styles.dueDate}>Due on: {task.dueDate}</Text>
            )}
          </View>
        </View>
      ))}
      
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Learning Tip</Text>
        <Text style={styles.tipText}>{getRandomSuggestion()}</Text>
      </View>
    </ScrollView>
  );
  
  // Render the Schedule page
  const renderSchedulePage = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentPage('Home')} style={styles.backButton}>
          <Icons.Back />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Schedule</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.calendarButton}
        onPress={() => setShowCalendar(true)}
      >
        <Text style={styles.calendarButtonText}>Open Calendar</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.scheduleList}>
        {scheduleItems.sort((a, b) => a.date - b.date).map(schedule => (
          <View key={schedule.id} style={styles.scheduleItem}>
            <Text style={styles.scheduleDate}>{formatDate(schedule.date)}</Text>
            
            {schedule.tasks.map(task => (
              <View key={task.id} style={styles.scheduleTask}>
                <View style={styles.scheduleTaskLeft}>
                  <Text style={styles.scheduleTime}>{task.time}</Text>
                  <Text style={styles.scheduleTaskTitle}>{task.title}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.statusDropdown}
                  onPress={() => {
                    // Show status dropdown
                    Alert.alert(
                      'Update Status',
                      'Select a new status',
                      [
                        { text: 'Done', onPress: () => updateTaskStatus(schedule.id, task.id, 'done') },
                        { text: 'In Progress', onPress: () => updateTaskStatus(schedule.id, task.id, 'in_progress') },
                        { text: 'Not Started', onPress: () => updateTaskStatus(schedule.id, task.id, 'not_started') },
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  {renderStatusBadge(task.status)}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
        
        {scheduleItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No schedules yet. Tap the + button to add tasks.</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <CalendarPicker
              onDateChange={date => {
                setSelectedDate(date);
                setShowCalendar(false);
              }}
              selectedDayColor="#8a6eff"
              selectedDayTextColor="#FFFFFF"
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
  
  // Render the Add Task form
  const renderAddTaskForm = () => (
    <Animated.View 
      style={[
        styles.modalOverlay,
        {
          opacity: fadeAnim,
          justifyContent: 'flex-end',
        }
      ]}
    >
      <Animated.View
        style={[
          styles.addTaskModal,
          {
            transform: [
              { translateY: slideAnim },
              { scale: modalScale }
            ],
          }
        ]}
      >
        <Text style={styles.modalTitle}>Add New Task</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Task Title"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />
        
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={styles.datePickerButtonText}>
            Date: {selectedDate.toDateString()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.datePickerButtonText}>
            Time: {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.dropdownLabel}>Status:</Text>
        <DropDownPicker
          open={dropdownOpen}
          value={taskStatus}
          items={[
            { label: 'Not Started', value: 'not_started' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Done', value: 'done' },
          ]}
          setOpen={setDropdownOpen}
          setValue={setTaskStatus}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => setShowAddModal(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={addNewTask}
          >
            <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
          </TouchableOpacity>
        </View>
        
        {Platform.OS === 'ios' && showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setSelectedTime(time);
            }}
          />
        )}
        
        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour={false}
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setSelectedTime(time);
            }}
          />
        )}
      </Animated.View>
    </Animated.View>
  );
  
  // Main render method
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        {/* Main Content */}
        {currentPage === 'Home' && renderHomePage()}
        {currentPage === 'Schedule' && renderSchedulePage()}
        
        {/* Navigation Bar */}
        <View style={styles.navigationBar}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setCurrentPage('Home')}
          >
            <Icons.Home style={{ opacity: currentPage === 'Home' ? 1 : 0.5 }} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setCurrentPage('Stats')}
          >
            <Icons.Stats style={{ opacity: 0.5 }} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              setSelectedDate(new Date());
              setSelectedTime(new Date());
              setShowAddModal(true);
              // Haptic feedback
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              }
            }}
          >
            <Icons.Add />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setCurrentPage('Notifications')}
          >
            <Icons.Notifications style={{ opacity: 0.5 }} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setCurrentPage('Profile')}
          >
            <Icons.Profile style={{ opacity: 0.5 }} />
          </TouchableOpacity>
        </View>
        
        {/* Calendar Modal */}
        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModal}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <CalendarPicker
                onDateChange={date => {
                  setSelectedDate(date);
                  setShowCalendar(false);
                }}
                selectedDayColor="#8a6eff"
                selectedDayTextColor="#FFFFFF"
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Add Task Modal */}
        {showAddModal && renderAddTaskForm()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f1ff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f1ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f4f1ff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
  },
  userButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8a6eff',
  },
  tabSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  tabs: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 20,
    backgroundColor: '#e6e1ff',
    borderRadius: 25,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8a6eff',
  },
  dailyTasksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  taskNumber: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8a6eff',
  },
  lessonCard: {
    backgroundColor: '#6c5ce7',
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  lessonCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  participantsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e6e1ff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dueDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginLeft: 'auto',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navButton: {
    padding: 10,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleList: {
    flex: 1,
    padding: 20,
  },
  scheduleItem: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  scheduleTask: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scheduleTaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#8a6eff',
    fontWeight: 'bold',
    marginRight: 10,
  },
  scheduleTaskTitle: {
    fontSize: 16,
    color: '#333',
  },
  statusDropdown: {
    marginLeft: 'auto',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: 15,
  },
  calendarButton: {
    backgroundColor: '#8a6eff',
    borderRadius: 10,
    padding: 12,
    margin: 20,
    alignItems: 'center',
  },
  calendarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#8a6eff',
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addTaskModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    fontSize: 16,
  },
  datePickerButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  dropdown: {
    backgroundColor: '#f8f8f8',
    borderWidth: 0,
    borderRadius: 10,
    marginBottom: 50, // Extra space for dropdown items
  },
  dropdownContainer: {
    backgroundColor: '#f8f8f8',
    borderWidth: 0,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#8a6eff',
    marginLeft: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8a6eff',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default App;