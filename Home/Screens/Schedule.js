import React, { useState, useRef, useEffect } from 'react';
import {
  Platform,
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
  
  StatusBar,
} from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import CalendarPicker from 'react-native-calendar-picker';
import * as Haptics from 'expo-haptics';

const SchedulePage = () => {
  // State management
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

  // UI state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState('not_started');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;

  // Format date to display in a more readable way
  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Handle modal animations
  useEffect(() => {
    if (showAddModal) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(modalScale, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: Dimensions.get('window').height, duration: 200, useNativeDriver: true }),
        Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [showAddModal]);

  // Add a new task to the schedule
  const addNewTask = () => {
    if (!newTaskTitle.trim()) {
      return Alert.alert('Error', 'Please enter a task title');
    }
    
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
      updatedScheduleItems = scheduleItems.map((item, index) => 
        index === existingScheduleIndex ? 
        {...item, tasks: [...item.tasks, newTask]} : item
      );
    } else {
      updatedScheduleItems = [
        ...scheduleItems, 
        { 
          id: `s${Date.now()}`, 
          date: new Date(selectedDate), 
          tasks: [newTask] 
        }
      ];
    }

    // Sort schedules by date
    setScheduleItems(updatedScheduleItems.sort((a, b) => a.date - b.date));
    
    // Reset form fields
    setNewTaskTitle('');
    setNewTaskDescription('');
    setShowAddModal(false);
    
    // Provide haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Update a task's status
  const updateTaskStatus = (scheduleId, taskId, newStatus) => {
    setScheduleItems(scheduleItems.map(schedule => 
      schedule.id === scheduleId ? 
      {
        ...schedule, 
        tasks: schedule.tasks.map(task => 
          task.id === taskId ? {...task, status: newStatus} : task
        )
      } : schedule
    ));
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Render status badge based on task status
  const renderStatusBadge = (status) => {
    const statusConfig = {
      done: { color: '#4CAF50', label: 'Done' },
      in_progress: { color: '#FFC107', label: 'In Progress' },
      not_started: { color: '#F44336', label: 'Not Started' }
    };
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: statusConfig[status].color }]}>
        <Text style={styles.statusText}>{statusConfig[status].label}</Text>
      </View>
    );
  };

  // Handle date selection from calendar
  const handleDateSelected = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    setShowAddModal(true);
  };

  // Open add task form for the current date
  const handleAddTaskNow = () => {
    setSelectedDate(new Date());
    setShowAddModal(true);
  };

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Schedule</Text>
            <TouchableOpacity style={styles.userButton}>
              <Text style={styles.userButtonText}>USER</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Button Section */}
          <View style={styles.calendarSection}>
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={styles.calendarButtonText}>📅 Open Calendar</Text>
            </TouchableOpacity>
            <Text style={styles.currentDateText}>{formatDate(new Date())}</Text>
          </View>

          {/* Schedule List */}
          <ScrollView style={styles.scheduleList}>
            {scheduleItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No schedules found. Add new tasks using the calendar!</Text>
              </View>
            ) : (
              scheduleItems.map(schedule => (
                <View key={schedule.id} style={styles.scheduleItem}>
                  <Text style={styles.scheduleDate}>{formatDate(schedule.date)}</Text>
                  {schedule.tasks.map(task => (
                    <View key={task.id} style={styles.scheduleTask}>
                      <View style={styles.scheduleTaskHeader}>
                        <View style={styles.scheduleTaskLeft}>
                          <Text style={styles.scheduleTime}>{task.time}</Text>
                          <Text style={styles.scheduleTaskTitle}>{task.title}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => Alert.alert(
                            'Update Status',
                            'Select a new status for this task',
                            [
                              {
                                text: 'Done',
                                onPress: () => updateTaskStatus(schedule.id, task.id, 'done')
                              },
                              {
                                text: 'In Progress',
                                onPress: () => updateTaskStatus(schedule.id, task.id, 'in_progress')
                              },
                              {
                                text: 'Not Started',
                                onPress: () => updateTaskStatus(schedule.id, task.id, 'not_started')
                              },
                              {
                                text: 'Cancel',
                                style: 'cancel'
                              }
                            ]
                          )}
                        >
                          {renderStatusBadge(task.status)}
                        </TouchableOpacity>
                      </View>
                      {task.description ? (
                        <Text style={styles.taskDescription}>{task.description}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>

          {/* Floating Action Button */}
          <TouchableOpacity 
            style={styles.fab}
            onPress={handleAddTaskNow}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Modal */}
        <Modal visible={showCalendar} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModal}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <CalendarPicker
                onDateChange={handleDateSelected}
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
        <Modal visible={showAddModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.addTaskModal}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <Text style={styles.selectedDateText}>
                For: {formatDate(selectedDate)}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Task Title"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                multiline
              />
              
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  ⏰ {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.dropdownContainer}>
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
                  dropDownContainerStyle={styles.dropdownList}
                  placeholder="Select Status"
                  zIndex={1000}
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

        {/* Time Picker */}
        {showTimePicker && (
          Platform.OS === 'android' ? (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="default"
              onChange={(_, time) => {
                setShowTimePicker(false);
                if (time) setSelectedTime(time);
              }}
            />
          ) : (
            <Modal visible={showTimePicker} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.timePickerModal}>
                  <Text style={styles.modalTitle}>Select Time</Text>
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="spinner"
                    onChange={(_, time) => time && setSelectedTime(time)}
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
          )
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  // Core layout styles
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f1ff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f1ff',
  },
  
  // Header styles
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
  
  // Calendar section styles
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
  
  // Schedule list styles
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
  
  // Task styles
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
  
  // Status badge styles
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
  
  // Modal styles
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
    alignItems: 'center',
  },
  timePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  addTaskModal: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  selectedDateText: {
    fontSize: 16,
    color: '#8a6eff',
    marginBottom: 20,
    fontWeight: '500',
  },
  
  // Input styles
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
  
  // Dropdown styles
  dropdownContainer: {
    marginBottom: 15,
    zIndex: 2000,
  },
  dropdown: {
    backgroundColor: '#f4f1ff',
    borderWidth: 0,
    borderRadius: 10,
  },
  dropdownList: {
    backgroundColor: '#f4f1ff',
    borderWidth: 0,
    borderRadius: 10,
  },
  
  // Button styles
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
  
  // Empty state
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
  
  // Floating action button
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#8a6eff',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
    lineHeight: 30,
  },
});

export default SchedulePage;

