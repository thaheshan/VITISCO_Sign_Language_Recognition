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
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import CalendarPicker from 'react-native-calendar-picker';
import * as Haptics from 'expo-haptics';

// Icons for the app
const Icons = {
  Calendar: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>📅</Text>
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
  Check: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>✅</Text>
    </View>
  ),
  Close: (props) => (
    <View style={[styles.icon, props.style]}>
      <Text style={{ fontSize: 18 }}>❌</Text>
    </View>
  ),
};

// Lesson plan suggestions
const lessonPlanSuggestions = [
  { 
    title: 'Mathematics - Algebra Basics', 
    description: 'Introduction to algebraic expressions and equations', 
    duration: '45 min'
  },
  { 
    title: 'Science - Cell Biology', 
    description: 'Structure and function of cellular components', 
    duration: '60 min'
  },
  { 
    title: 'History - Ancient Civilizations', 
    description: 'Overview of early human societies and their development', 
    duration: '50 min'
  },
  { 
    title: 'Literature - Creative Writing', 
    description: 'Techniques for narrative development and character creation', 
    duration: '45 min'
  },
  { 
    title: 'Physics - Forces and Motion', 
    description: 'Understanding Newton\'s laws of motion', 
    duration: '60 min'
  },
  { 
    title: 'Language - Grammar Fundamentals', 
    description: 'Essential grammar rules and sentence structure', 
    duration: '40 min'
  },
];

// Main App component
const App = () => {
  const [scheduleItems, setScheduleItems] = useState([
    { 
      id: 's1', 
      date: new Date(2025, 2, 15), 
      tasks: [
        { id: 't1', title: 'Math Homework', description: 'Complete exercises 1-10', status: 'done', time: '10:00 AM' },
        { id: 't2', title: 'Physics Study', description: 'Review chapter 3', status: 'in_progress', time: '2:00 PM' },
      ]
    },
    { 
      id: 's2', 
      date: new Date(2025, 2, 20), 
      tasks: [
        { id: 't3', title: 'History Essay', description: 'Renaissance period overview', status: 'not_started', time: '11:00 AM' },
      ]
    },
  ]);
  
  // States for calendar and task management
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState('not_started');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  
  // Helper function to format date
  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Animation functions
  useEffect(() => {
    if (showAddModal || showSuggestionsModal) {
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
  }, [showAddModal, showSuggestionsModal, fadeAnim, slideAnim, modalScale]);
  
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
      description: newTaskDescription,
      status: taskStatus,
      time: selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    let updatedScheduleItems;
    if (existingScheduleIndex !== -1) {
      // Add to existing schedule
      updatedScheduleItems = [...scheduleItems];
      updatedScheduleItems[existingScheduleIndex].tasks.push(newTask);
    } else {
      // Create new schedule
      const newSchedule = {
        id: `s${Date.now()}`,
        date: new Date(selectedDate),
        tasks: [newTask],
      };
      updatedScheduleItems = [...scheduleItems, newSchedule];
    }
    
    // Sort schedules by date
    updatedScheduleItems.sort((a, b) => a.date - b.date);
    setScheduleItems(updatedScheduleItems);
    
    // Reset form and close modal
    setNewTaskTitle('');
    setNewTaskDescription('');
    setTaskStatus('not_started');
    setShowAddModal(false);
    
    // Haptic feedback on success
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Function to add a lesson plan from suggestions
  const addLessonPlan = (lessonPlan) => {
    // Find if there's already a schedule for the selected date
    const existingScheduleIndex = scheduleItems.findIndex(
      item => item.date.toDateString() === selectedDate.toDateString()
    );
    
    const newTask = {
      id: `t${Date.now()}`,
      title: lessonPlan.title,
      description: lessonPlan.description,
      status: 'not_started',
      time: selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: lessonPlan.duration
    };
    
    let updatedScheduleItems;
    if (existingScheduleIndex !== -1) {
      // Add to existing schedule
      updatedScheduleItems = [...scheduleItems];
      updatedScheduleItems[existingScheduleIndex].tasks.push(newTask);
    } else {
      // Create new schedule
      const newSchedule = {
        id: `s${Date.now()}`,
        date: new Date(selectedDate),
        tasks: [newTask],
      };
      updatedScheduleItems = [...scheduleItems, newSchedule];
    }
    
    // Sort schedules by date
    updatedScheduleItems.sort((a, b) => a.date - b.date);
    setScheduleItems(updatedScheduleItems);
    
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
  
  // Handle date selection in calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    setShowSuggestionsModal(true);
  };
  
  // Render Schedule page
  const renderSchedulePage = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <TouchableOpacity style={styles.userButton}>
          <Text style={styles.userButtonText}>USER ID</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendarSection}>
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => setShowCalendar(true)}
        >
          <Icons.Calendar style={{ marginRight: 8 }} />
          <Text style={styles.calendarButtonText}>Open Calendar</Text>
        </TouchableOpacity>
        
        <Text style={styles.currentDateText}>
          {formatDate(new Date())}
        </Text>
      </View>
      
      <ScrollView style={styles.scheduleList}>
        {scheduleItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No schedules yet. Open the calendar to add lessons and tasks.</Text>
          </View>
        ) : (
          scheduleItems.map(schedule => (
            <View key={schedule.id} style={styles.scheduleItem}>
              <Text style={styles.scheduleDate}>{formatDate(schedule.date)}</Text>
              
              {schedule.tasks.map(task => (
                <View key={task.id} style={styles.scheduleTask}>
                  <View style={styles.scheduleTaskHeader}>
                    <View style={styles.scheduleTaskLeft}>
                      <Text style={styles.scheduleTime}>{task.time} {task.duration && `(${task.duration})`}</Text>
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
                  
                  {task.description && (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                  )}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
  
  // Render the Add Task form
  const renderAddTaskForm = () => (
    <Modal
      visible={showAddModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.addTaskModal}>
          <Text style={styles.modalTitle}>Add New Task</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            value={newTaskDescription}
            onChangeText={setNewTaskDescription}
            multiline={true}
            numberOfLines={3}
          />
          
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              Time: {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.dropdownLabel}>Status:</Text>
          <View style={{zIndex: 1000, height: dropdownOpen ? 160 : 50, marginBottom: 20}}>
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
          </View>
          
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
        </View>
      </View>
    </Modal>
  );
  
  // Render the Suggestions Modal
  const renderSuggestionsModal = () => (
    <Modal
      visible={showSuggestionsModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSuggestionsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.suggestionsModal}>
          <View style={styles.suggestionHeader}>
            <Text style={styles.modalTitle}>
              Lesson Plans for {selectedDate.toDateString()}
            </Text>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowSuggestionsModal(false)}
            >
              <Icons.Close />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.suggestionsList}>
            {lessonPlanSuggestions.map((plan, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  addLessonPlan(plan);
                  setShowSuggestionsModal(false);
                }}
              >
                <View style={styles.suggestionIconContainer}>
                  <Icons.Book />
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>{plan.title}</Text>
                  <Text style={styles.suggestionDesc}>{plan.description}</Text>
                  <Text style={styles.suggestionTime}>{plan.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.suggestionFooter}>
            <TouchableOpacity 
              style={styles.createCustomButton}
              onPress={() => {
                setShowSuggestionsModal(false);
                setShowAddModal(true);
              }}
            >
              <Text style={styles.createCustomText}>Create Custom Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  
  // Main render method
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        {/* Main Content */}
        {renderSchedulePage()}
        
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
                onDateChange={handleDateSelect}
                selectedDayColor="#8a6eff"
                selectedDayTextColor="#FFFFFF"
              />
              <Text style={styles.calendarHint}>
                Tap on a date to see lesson suggestions
              </Text>
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
        {renderAddTaskForm()}
        
        {/* Time Picker for Android */}
        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setSelectedTime(time);
            }}
          />
        )}
        
        {/* Time Picker for iOS */}
        {Platform.OS === 'ios' && showTimePicker && (
          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.calendarModal}>
                <Text style={styles.modalTitle}>Select Time</Text>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, time) => {
                    if (time) setSelectedTime(time);
                  }}
                />
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.closeButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        
        {/* Suggestions Modal */}
        {renderSuggestionsModal()}
        
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
  calendarSection: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  calendarButton: {
    backgroundColor: '#8a6eff',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currentDateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    elevation: 3,
  },
  scheduleDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8a6eff',
    marginBottom: 15,
  },
  scheduleTask: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 5,
  },
  scheduleTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTaskLeft: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scheduleTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    paddingLeft: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  calendarHint: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#8a6eff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addTaskModal: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    width: '90%',
    maxHeight: '90%',
  },
  suggestionsModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeModalButton: {
    padding: 5,
  },
  suggestionsList: {
    maxHeight: 400,
  },
  suggestionItem: {
    flexDirection: 'row',
    backgroundColor: '#f6f4ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  suggestionIconContainer: {
    backgroundColor: '#dcd6ff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  suggestionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  suggestionTime: {
    fontSize: 12,
    color: '#8a6eff',
    fontWeight: 'bold',
  },
  suggestionFooter: {
    marginTop: 15,
    alignItems: 'center',
  },
  createCustomButton: {
    backgroundColor: '#e6e1ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  createCustomText: {
    color: '#8a6eff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#f4f1ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    backgroundColor: '#f4f1ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#f4f1ff',
    borderWidth: 0,
    borderRadius: 10,
  },
  dropdownContainer: {
    backgroundColor: '#f4f1ff',
    borderRadius: 10,
    borderWidth: 0,
    zIndex: 1000,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  saveButton: {
    backgroundColor: '#8a6eff',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  saveButtonText: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyStateText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDropdown: {
    padding: 5,
  }
});

export default App;