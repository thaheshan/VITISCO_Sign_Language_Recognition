// App.js - Task Manager for Language Learning App
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

const App = () => {
  // State variables
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [customTaskModalVisible, setCustomTaskModalVisible] = useState(false);
  const [suggestedTasksOpen, setSuggestedTasksOpen] = useState(false);
  
  // Language learning specific tasks
  const [suggestedTasks, setSuggestedTasks] = useState([
    { label: 'Vocabulary Practice: Food', value: 'vocab_food', icon: () => <Icon name="fast-food-outline" size={18} color="#8676D1" /> },
    { label: 'Grammar: Past Tense', value: 'grammar_past', icon: () => <Icon name="book-outline" size={18} color="#8676D1" /> },
    { label: 'Listening Exercise: Conversations', value: 'listening', icon: () => <Icon name="headset-outline" size={18} color="#8676D1" /> },
    { label: 'Speaking Practice: Introductions', value: 'speaking', icon: () => <Icon name="mic-outline" size={18} color="#8676D1" /> },
    { label: 'Reading: Short Stories', value: 'reading', icon: () => <Icon name="newspaper-outline" size={18} color="#8676D1" /> },
  ]);
  
  const [selectedSuggestedTask, setSelectedSuggestedTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskTime, setTaskTime] = useState(new Date());
  const [reminderTime, setReminderTime] = useState(15); // minutes before
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Setup marked dates for calendar
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    // Update marked dates whenever tasks change
    const newMarkedDates = {};
    tasks.forEach(task => {
      newMarkedDates[task.date] = {
        marked: true,
        dotColor: '#8676D1',
        selectedColor: '#8676D1'
      };
    });
    
    if (selectedDate) {
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate],
        selected: true,
        selectedColor: '#8676D1'
      };
    }
    
    setMarkedDates(newMarkedDates);
  }, [tasks, selectedDate]);

  // Add a new task
  const addTask = (isSuggested = false) => {
    const newTask = {
      id: Date.now().toString(),
      title: isSuggested ? suggestedTasks.find(task => task.value === selectedSuggestedTask)?.label : taskTitle,
      description: taskDescription,
      time: taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedDate || new Date().toISOString().split('T')[0],
      reminderMinutes: reminderTime,
      isCompleted: false,
      progress: 'Not Started' // Initial progress status
    };
    
    setTasks([...tasks, newTask]);
    resetFormFields();
    setTaskModalVisible(false);
    setCustomTaskModalVisible(false);
  };

  // Reset form fields
  const resetFormFields = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskTime(new Date());
    setReminderTime(15);
    setSelectedSuggestedTask(null);
  };

  // Filter tasks by date
  const getTasksForDate = (date) => {
    return tasks.filter(task => task.date === date);
  };

  // Update task progress status
  const updateTaskProgress = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Rotate between the three progress states
        let newProgress;
        switch (task.progress) {
          case 'Not Started':
            newProgress = 'In Progress';
            break;
          case 'In Progress':
            newProgress = 'Completed';
            break;
          case 'Completed':
            newProgress = 'Not Started';
            break;
          default:
            newProgress = 'Not Started';
        }
        return { ...task, progress: newProgress };
      }
      return task;
    }));
  };

  // Get learning progress for profile data
  const getLearningProgress = () => {
    // This would normally be calculated based on actual user progress
    // For this example, we'll return a fixed value
    return {
      vocabularyProgress: 65,
      grammarProgress: 78,
      listeningProgress: 42,
      speakingProgress: 51,
      readingProgress: 70,
      overallProgress: 61
    };
  };

  // Generate task recommendations based on user's learning progress
  const getRecommendedTasks = () => {
    const progress = getLearningProgress();
    const recommendations = [];
    
    // Add recommendations based on lowest progress areas
    if (progress.listeningProgress < 50) {
      recommendations.push('Listening exercises would help improve your comprehension');
    }
    
    if (progress.speakingProgress < 60) {
      recommendations.push('Regular speaking practice is recommended to improve fluency');
    }
    
    if (progress.vocabularyProgress < 70) {
      recommendations.push('Focus on expanding your vocabulary with daily practice');
    }
    
    return recommendations.length > 0 ? recommendations : ['Continue with regular practice in all language areas'];
  };

  // Get progress badge color based on status
  const getProgressColor = (progress) => {
    switch (progress) {
      case 'Not Started':
        return '#FF7676'; // Red
      case 'In Progress':
        return '#FFB347'; // Orange
      case 'Completed':
        return '#77DD77'; // Green
      default:
        return '#8a6eff'; // Default purple
    }
  };

  // Main render
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f1ff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Manager</Text>
        <TouchableOpacity style={styles.userButton}>
          <Text style={styles.userButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.flex}>
        {/* Date selection */}
        <View style={styles.calendarSection}>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setCalendarVisible(true)}
          >
            <Text style={styles.calendarButtonText}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.currentDateText}>
            {selectedDate ? `Tasks for ${new Date(selectedDate).toLocaleDateString()}` : 'All upcoming tasks'}
          </Text>
        </View>
        
        {/* Schedule List */}
        <View style={styles.scheduleList}>
          {/* Learning Progress Summary */}
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleDate}>Learning Progress</Text>
            <View style={{backgroundColor: '#f4f1ff', height: 20, borderRadius: 10, overflow: 'hidden'}}>
              <View style={{
                backgroundColor: '#8a6eff', 
                width: `${getLearningProgress().overallProgress}%`,
                height: '100%'
              }} />
            </View>
            <Text style={{textAlign: 'center', marginTop: 10, color: '#666'}}>
              {getLearningProgress().overallProgress}% Overall Progress
            </Text>
            
            {/* Recommendations */}
            <View style={{marginTop: 15}}>
              <Text style={{fontWeight: 'bold', color: '#8a6eff', marginBottom: 10}}>Recommended Focus Areas:</Text>
              {getRecommendedTasks().map((recommendation, index) => (
                <View key={index} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <Icon name="bulb-outline" size={18} color="#8a6eff" style={{marginRight: 8}} />
                  <Text style={{color: '#666'}}>{recommendation}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Tasks List */}
          {selectedDate ? (
            getTasksForDate(selectedDate).length > 0 ? (
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleDate}>Scheduled Tasks</Text>
                {getTasksForDate(selectedDate).map(task => (
                  <View key={task.id} style={styles.scheduleTask}>
                    <View style={styles.scheduleTaskHeader}>
                      <View style={styles.scheduleTaskLeft}>
                        <Text style={styles.scheduleTime}>{task.time}</Text>
                        <Text style={styles.scheduleTaskTitle}>{task.title}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.statusBadge, {backgroundColor: getProgressColor(task.progress)}]}
                        onPress={() => updateTaskProgress(task.id)}
                      >
                        <Text style={styles.statusText}>{task.progress}</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.taskDescription}>
                      {task.description || 'Complete this language learning task to improve your skills'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No tasks scheduled for this date. Add a language learning task!</Text>
              </View>
            )
          ) : (
            tasks.length > 0 ? (
              Object.entries(tasks.reduce((groups, task) => {
                const date = task.date;
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(task);
                return groups;
              }, {})).slice(0, 3).map(([date, dateTasks]) => (
                <View key={date} style={styles.scheduleItem}>
                  <Text style={styles.scheduleDate}>{new Date(date).toLocaleDateString()}</Text>
                  {dateTasks.map(task => (
                    <View key={task.id} style={styles.scheduleTask}>
                      <View style={styles.scheduleTaskHeader}>
                        <View style={styles.scheduleTaskLeft}>
                          <Text style={styles.scheduleTime}>{task.time}</Text>
                          <Text style={styles.scheduleTaskTitle}>{task.title}</Text>
                        </View>
                        <TouchableOpacity 
                          style={[styles.statusBadge, {backgroundColor: getProgressColor(task.progress)}]}
                          onPress={() => updateTaskProgress(task.id)}
                        >
                          <Text style={styles.statusText}>{task.progress}</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.taskDescription}>
                        {task.description || 'Complete this language learning task to improve your skills'}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No tasks scheduled. Start adding language learning tasks!</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
      
      {/* Add Task Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setTaskModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      {/* Calendar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={calendarVisible}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <Text style={styles.modalTitle}>Select Date for Tasks</Text>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarVisible(false);
              }}
              markedDates={markedDates}
              theme={{
                calendarBackground: '#fff',
                textSectionTitleColor: '#8a6eff',
                selectedDayBackgroundColor: '#8a6eff',
                selectedDayTextColor: '#fff',
                todayTextColor: '#8a6eff',
                dayTextColor: '#333',
                textDisabledColor: '#d9e1e8',
                dotColor: '#8a6eff',
                selectedDotColor: '#fff',
                arrowColor: '#8a6eff',
                monthTextColor: '#8a6eff',
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCalendarVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Task Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={taskModalVisible}
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addTaskModal}>
            <Text style={styles.modalTitle}>Add Language Learning Task</Text>
            <Text style={styles.selectedDateText}>
              Selected Date: {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Today'}
            </Text>
            
            <Text style={{fontSize: 16, fontWeight: '500', marginBottom: 5, color: '#333'}}>
              Suggested Learning Tasks
            </Text>
            <View style={styles.dropdownContainer}>
              <DropDownPicker
                open={suggestedTasksOpen}
                value={selectedSuggestedTask}
                items={suggestedTasks}
                setOpen={setSuggestedTasksOpen}
                setValue={setSelectedSuggestedTask}
                setItems={setSuggestedTasks}
                placeholder="Select a suggested task"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownList}
                listMode="SCROLLVIEW"
                />
              </View>
              
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  setTaskModalVisible(false);
                  setCustomTaskModalVisible(true);
                }}
              >
                <Text style={styles.datePickerButtonText}>Create Custom Learning Task</Text>
              </TouchableOpacity>
              
              {selectedSuggestedTask && (
                <>
                  <Text style={{fontSize: 16, fontWeight: '500', marginTop: 15, marginBottom: 5, color: '#333'}}>
                    Set Time
                  </Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                  
                  {showTimePicker && (
                    <DateTimePicker
                      value={taskTime}
                      mode="time"
                      is24Hour={false}
                      display="default"
                      onChange={(event, selectedTime) => {
                        setShowTimePicker(false);
                        if (selectedTime) {
                          setTaskTime(selectedTime);
                        }
                      }}
                    />
                  )}
                  
                  <Text style={{fontSize: 16, fontWeight: '500', marginTop: 15, marginBottom: 5, color: '#333'}}>
                    Set Reminder (minutes before)
                  </Text>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
                    {[5, 15, 30, 60].map((mins) => (
                      <TouchableOpacity
                        key={mins}
                        style={{
                          backgroundColor: reminderTime === mins ? '#8a6eff' : '#f4f1ff',
                          paddingVertical: 10,
                          paddingHorizontal: 15,
                          borderRadius: 8,
                          width: '22%',
                          alignItems: 'center'
                        }}
                        onPress={() => setReminderTime(mins)}
                      >
                        <Text
                          style={{
                            color: reminderTime === mins ? '#fff' : '#333',
                            fontWeight: reminderTime === mins ? 'bold' : 'normal',
                          }}
                        >
                          {mins}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setTaskModalVisible(false);
                    resetFormFields();
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.saveButton,
                    !selectedSuggestedTask && {opacity: 0.5}
                  ]}
                  disabled={!selectedSuggestedTask}
                  onPress={() => addTask(true)}
                >
                  <Text style={styles.saveButtonText}>Add Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Custom Task Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={customTaskModalVisible}
          onRequestClose={() => setCustomTaskModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addTaskModal}>
              <Text style={styles.modalTitle}>Create Custom Learning Task</Text>
              <Text style={styles.selectedDateText}>
                Selected Date: {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Today'}
              </Text>
              
              <Text style={{fontSize: 16, fontWeight: '500', marginBottom: 5, color: '#333'}}>
                Task Title
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task title"
                value={taskTitle}
                onChangeText={setTaskTitle}
              />
              
              <Text style={{fontSize: 16, fontWeight: '500', marginBottom: 5, color: '#333'}}>
                Description
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter task description"
                value={taskDescription}
                onChangeText={setTaskDescription}
                multiline
                numberOfLines={4}
              />
              
              <Text style={{fontSize: 16, fontWeight: '500', marginTop: 5, marginBottom: 5, color: '#333'}}>
                Set Time
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  {taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <DateTimePicker
                  value={taskTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      setTaskTime(selectedTime);
                    }
                  }}
                />
              )}
              
              <Text style={{fontSize: 16, fontWeight: '500', marginTop: 15, marginBottom: 5, color: '#333'}}>
                Set Reminder (minutes before)
              </Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
                {[5, 15, 30, 60].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={{
                      backgroundColor: reminderTime === mins ? '#8a6eff' : '#f4f1ff',
                      paddingVertical: 10,
                      paddingHorizontal: 15,
                      borderRadius: 8,
                      width: '22%',
                      alignItems: 'center'
                    }}
                    onPress={() => setReminderTime(mins)}
                  >
                    <Text
                      style={{
                        color: reminderTime === mins ? '#fff' : '#333',
                        fontWeight: reminderTime === mins ? 'bold' : 'normal',
                      }}
                    >
                      {mins}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setCustomTaskModalVisible(false);
                    resetFormFields();
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.saveButton,
                    !taskTitle && {opacity: 0.5}
                  ]}
                  disabled={!taskTitle}
                  onPress={() => addTask(false)}
                >
                  <Text style={styles.saveButtonText}>Add Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };
  
  // Styles
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
  
  export default App;