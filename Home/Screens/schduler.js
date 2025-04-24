// App.js - Task Manager for Language Learning App with improved notifications
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Switch
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// API base URL - replace with your actual backend URL
const API_BASE_URL = 'http://192.168.58.40:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const App = () => {
  // State variables
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [customTaskModalVisible, setCustomTaskModalVisible] = useState(false);
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [taskSyncing, setTaskSyncing] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  
  // Language learning specific tasks
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [suggestedTasksOpen, setSuggestedTasksOpen] = useState(false);
  const [selectedSuggestedTask, setSelectedSuggestedTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskTime, setTaskTime] = useState(new Date());
  const [reminderTime, setReminderTime] = useState(15); // minutes before
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Enhanced notification settings
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [customReminderTime, setCustomReminderTime] = useState('');
  const [showCustomReminderInput, setShowCustomReminderInput] = useState(false);
  const [multipleReminders, setMultipleReminders] = useState(false);
  const [secondReminderTime, setSecondReminderTime] = useState(60); // minutes before
  const [notificationSettings, setNotificationSettings] = useState({
    sound: true,
    vibration: true,
  });
  const [notificationsSettingsModal, setNotificationsSettingsModal] = useState(false);
  
  // Setup marked dates for calendar
  const [markedDates, setMarkedDates] = useState({});

  // Reference for notification listeners
  const notificationListener = useRef();
  const responseListener = useRef();

  // Request notification permissions
  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow notifications to receive task reminders',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('task-reminders', {
          name: 'Task Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8676D1',
          sound: notificationSettings.sound ? true : false,
          enableVibrate: notificationSettings.vibration,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  // Save notification settings to AsyncStorage
  const saveNotificationSettings = async () => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify({
        enabled: enableNotifications,
        defaultReminderTime: reminderTime,
        sound: notificationSettings.sound,
        vibration: notificationSettings.vibration,
        multipleReminders: multipleReminders,
        secondReminderTime: secondReminderTime
      }));
    } catch (err) {
      console.error('Error saving notification settings:', err);
    }
  };

  // Load notification settings from AsyncStorage
  const loadNotificationSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setEnableNotifications(parsedSettings.enabled);
        setReminderTime(parsedSettings.defaultReminderTime || 15);
        setNotificationSettings({
          sound: parsedSettings.sound !== undefined ? parsedSettings.sound : true,
          vibration: parsedSettings.vibration !== undefined ? parsedSettings.vibration : true,
        });
        setMultipleReminders(parsedSettings.multipleReminders || false);
        setSecondReminderTime(parsedSettings.secondReminderTime || 60);
      }
    } catch (err) {
      console.error('Error loading notification settings:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first
      try {
        const response = await api.get('/tasks');
        const fetchedTasks = response.data;
        
        // Schedule notifications for all tasks if enabled
        if (enableNotifications) {
          for (const task of fetchedTasks) {
            if (new Date(task.date) >= new Date()) {
              // Cancel existing notifications first
              if (task.notificationId) {
                await Notifications.cancelScheduledNotificationAsync(task.notificationId);
              }
              if (task.secondNotificationId) {
                await Notifications.cancelScheduledNotificationAsync(task.secondNotificationId);
              }
              
              // Schedule new notifications
              const notificationIds = await scheduleTaskNotifications(task);
              
              // Update task with new notification IDs
              if (notificationIds.primary) {
                task.notificationId = notificationIds.primary;
                if (task.id) { // Skip for temporary offline tasks
                  await api.put(`/tasks/${task.id}`, { 
                    notificationId: notificationIds.primary,
                    secondNotificationId: notificationIds.secondary || null 
                  });
                }
              }
              
              if (notificationIds.secondary) {
                task.secondNotificationId = notificationIds.secondary;
              }
            }
          }
        }
        
        setTasks(fetchedTasks);
      } catch (apiErr) {
        console.error('Error fetching tasks from API:', apiErr);
        
        // If API fails, try to load from local storage
        const storedTasks = await AsyncStorage.getItem('offlineTasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          setTasks([]);
        }
        
        // Only show error if we couldn't get tasks from either source
        if (!storedTasks) {
          setError('Could not connect to server. Please check your internet connection.');
        }
      }
    } catch (err) {
      console.error('Error in fetch tasks flow:', err);
      setError('An unexpected error occurred loading your tasks.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Schedule notifications for a task
  const scheduleTaskNotifications = async (task) => {
    if (!enableNotifications) return { primary: null, secondary: null };
    
    try {
      const hasPermission = await registerForPushNotifications();
      if (!hasPermission) return { primary: null, secondary: null };
      
      // Parse task date and time
      const taskDate = new Date(task.date);
      const timeParts = task.time.split(':');
      
      taskDate.setHours(
        parseInt(timeParts[0]),
        parseInt(timeParts[1]),
        0
      );
      
      // Calculate reminder times
      const reminderMinutes = task.reminderMinutes || reminderTime;
      const primaryReminderDate = new Date(taskDate.getTime() - (reminderMinutes * 60000));
      
      const result = { primary: null, secondary: null };
      
      // Schedule primary notification if it's in the future
      if (primaryReminderDate > new Date()) {
        result.primary = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Reminder: ${task.title}`,
            body: task.description || 'Time for your language learning task!',
            data: { taskId: task.id },
            sound: notificationSettings.sound,
            vibrate: notificationSettings.vibration ? [0, 250, 250, 250] : null,
          },
          trigger: primaryReminderDate,
        });
      }
      
      // Schedule second notification if multiple reminders enabled
      if (multipleReminders && task.useMultipleReminders !== false) {
        const secondReminderMins = task.secondReminderMinutes || secondReminderTime;
        if (secondReminderMins > reminderMinutes) {
          // If second reminder is set to be earlier than first reminder, swap them
          const secondReminderDate = new Date(taskDate.getTime() - (secondReminderMins * 60000));
          
          if (secondReminderDate > new Date()) {
            result.secondary = await Notifications.scheduleNotificationAsync({
              content: {
                title: `Early Reminder: ${task.title}`,
                body: `You have a language task coming up in ${secondReminderMins} minutes`,
                data: { taskId: task.id },
                sound: notificationSettings.sound,
                vibrate: notificationSettings.vibration ? [0, 250, 250, 250] : null,
              },
              trigger: secondReminderDate,
            });
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { primary: null, secondary: null };
    }
  };

  // Cancel notifications for a task
  const cancelTaskNotifications = async (task) => {
    try {
      if (task.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(task.notificationId);
      }
      if (task.secondNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(task.secondNotificationId);
      }
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setUserProfile(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile data.');
      
      // If API is unavailable, try to load from AsyncStorage
      try {
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }
      } catch (storageErr) {
        console.error('Error loading profile from storage:', storageErr);
      }
    }
  };

  // Fetch suggested tasks
  const fetchSuggestedTasks = async () => {
    try {
      const response = await api.get('/suggested-tasks');
      const formattedTasks = response.data.map(task => ({
        label: task.title,
        value: task.id,
        icon: () => <Icon name={getIconForTaskType(task.type)} size={18} color="#8676D1" />
      }));
      setSuggestedTasks(formattedTasks);
    } catch (err) {
      console.error('Error fetching suggested tasks:', err);
      // Fallback to default suggested tasks
      setSuggestedTasks([
        { label: 'Vocabulary Practice: Food', value: 'vocab_food', icon: () => <Icon name="fast-food-outline" size={18} color="#8676D1" /> },
        { label: 'Grammar: Past Tense', value: 'grammar_past', icon: () => <Icon name="book-outline" size={18} color="#8676D1" /> },
        { label: 'Listening Exercise: Conversations', value: 'listening', icon: () => <Icon name="headset-outline" size={18} color="#8676D1" /> },
        { label: 'Speaking Practice: Introductions', value: 'speaking', icon: () => <Icon name="mic-outline" size={18} color="#8676D1" /> },
        { label: 'Reading: Short Stories', value: 'reading', icon: () => <Icon name="newspaper-outline" size={18} color="#8676D1" /> },
      ]);
    }
  };

  // Helper function to get icon for task type
  const getIconForTaskType = (type) => {
    switch (type) {
      case 'vocabulary':
        return 'text-outline';
      case 'grammar':
        return 'book-outline';
      case 'listening':
        return 'headset-outline';
      case 'speaking':
        return 'mic-outline';
      case 'reading':
        return 'newspaper-outline';
      default:
        return 'document-outline';
    }
  };

  // Sync offline tasks with server
  const syncOfflineTasks = async () => {
    try {
      const offlineTasksString = await AsyncStorage.getItem('offlineTaskChanges');
      if (offlineTasksString) {
        const offlineTasks = JSON.parse(offlineTasksString);
        if (offlineTasks.length > 0) {
          setTaskSyncing(true);
          
          // Process each offline task change
          for (const taskChange of offlineTasks) {
            if (taskChange.action === 'add') {
              await api.post('/tasks', taskChange.task);
            } else if (taskChange.action === 'update') {
              await api.put(`/tasks/${taskChange.task.id}`, taskChange.task);
            } else if (taskChange.action === 'delete') {
              await api.delete(`/tasks/${taskChange.taskId}`);
            }
          }
          
          // Clear offline changes after successful sync
          await AsyncStorage.removeItem('offlineTaskChanges');
          
          // Refresh tasks from server
          await fetchTasks();
        }
      }
    } catch (err) {
      console.error('Error syncing offline tasks:', err);
      Alert.alert('Sync Failed', 'Could not sync your changes with the server. Will try again later.');
    } finally {
      setTaskSyncing(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    loadNotificationSettings();
    registerForPushNotifications();
    fetchTasks();
    fetchUserProfile();
    fetchSuggestedTasks();
    
    // Check for internet connection and sync offline changes if needed
    const netInfo = require('@react-native-community/netinfo');
    const unsubscribe = netInfo.addEventListener(state => {
      if (state.isConnected) {
        syncOfflineTasks();
      }
    });
    
    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { taskId } = response.notification.request.content.data;
      if (taskId) {
        // Find the task date and set selected date to it
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          setSelectedDate(task.date);
        }
      }
    });
    
    return () => {
      unsubscribe();
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Save notification settings when they change
  useEffect(() => {
    saveNotificationSettings();
  }, [enableNotifications, reminderTime, notificationSettings, multipleReminders, secondReminderTime]);

  // Update marked dates whenever tasks change
  useEffect(() => {
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
    
    // Save tasks to AsyncStorage for offline access
    AsyncStorage.setItem('offlineTasks', JSON.stringify(tasks));
  }, [tasks, selectedDate]);

  // Handle custom reminder time input
  const handleCustomReminderChange = (text) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setCustomReminderTime(numericValue);
  };

  const saveCustomReminderTime = () => {
    const customMinutes = parseInt(customReminderTime);
    if (customMinutes > 0) {
      setReminderTime(customMinutes);
      setShowCustomReminderInput(false);
      setCustomReminderTime('');
    } else {
      Alert.alert('Invalid Time', 'Please enter a valid number of minutes');
    }
  };

  // Add a new task
  const addTask = async (isSuggested = false) => {
    try {
      setLoading(true);
      
      // Format time as HH:MM
      const formattedTime = taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        .replace(/\s/g, '')  // Remove any spaces
        .replace(/[APap][Mm]$/i, ''); // Remove AM/PM
      
      let taskData = {
        title: isSuggested 
          ? suggestedTasks.find(task => task.value === selectedSuggestedTask)?.label 
          : taskTitle,
        description: taskDescription,
        time: formattedTime,
        date: selectedDate || new Date().toISOString().split('T')[0],
        reminderMinutes: reminderTime,
        useMultipleReminders: multipleReminders,
        secondReminderMinutes: secondReminderTime,
        progress: 'Not Started',
        suggestedTaskId: isSuggested ? selectedSuggestedTask : null
      };
      
      // Try to send to server
      try {
        const response = await api.post('/tasks', taskData);
        const newTask = response.data;
        
        // Schedule notifications if enabled
        if (enableNotifications) {
          const notificationIds = await scheduleTaskNotifications(newTask);
          if (notificationIds.primary || notificationIds.secondary) {
            // Update task with notification IDs
            newTask.notificationId = notificationIds.primary;
            newTask.secondNotificationId = notificationIds.secondary;
            
            // Update task on server with notification IDs
            await api.put(`/tasks/${newTask.id}`, { 
              notificationId: notificationIds.primary,
              secondNotificationId: notificationIds.secondary 
            });
          }
        }
        
        // Add the new task with the ID from the server
        setTasks(prevTasks => [...prevTasks, newTask]);
        
        // Close modals
        setTaskModalVisible(false);
        setCustomTaskModalVisible(false);
        setSuggestedTasksOpen(false);
        
        // Show confirmation
        Alert.alert('Success', 'Task added successfully' + (enableNotifications ? ' and reminder set!' : '!'));
      } catch (err) {
        console.error('Error adding task to server:', err);
        
        // Store for offline use with temp ID
        const tempId = Date.now().toString();
        const newTask = { ...taskData, id: tempId };
        
        // Schedule notification for offline task if enabled
        if (enableNotifications) {
          const notificationIds = await scheduleTaskNotifications(newTask);
          if (notificationIds.primary) {
            newTask.notificationId = notificationIds.primary;
          }
          if (notificationIds.secondary) {
            newTask.secondNotificationId = notificationIds.secondary;
          }
        }
        
        // Add to local state
        setTasks(prevTasks => [...prevTasks, newTask]);
        
        // Store offline change to sync later
        const offlineChanges = await AsyncStorage.getItem('offlineTaskChanges');
        const changes = offlineChanges ? JSON.parse(offlineChanges) : [];
        changes.push({ action: 'add', task: newTask });
        await AsyncStorage.setItem('offlineTaskChanges', JSON.stringify(changes));
        
        Alert.alert(
          'Offline Mode',
          'Your task has been saved locally and will sync when you reconnect to the internet.' + 
          (enableNotifications ? ' Reminder has been set!' : ''),
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Error in add task flow:', err);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    } finally {
      setLoading(false);
      resetFormFields();
    }
  };

  // Update an existing task
  const updateTask = async () => {
    if (!editingTask) return;
    
    try {
      setLoading(true);
      
      // Format time as HH:MM
      const formattedTime = taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        .replace(/\s/g, '')  // Remove any spaces
        .replace(/[APap][Mm]$/i, ''); // Remove AM/PM
      
      const updatedTask = {
        ...editingTask,
        title: taskTitle,
        description: taskDescription,
        time: formattedTime,
        date: selectedDate || editingTask.date,
        reminderMinutes: reminderTime,
        useMultipleReminders: multipleReminders,
        secondReminderMinutes: secondReminderTime
      };
      
      // Update in local state first for responsiveness
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));
      
      // Cancel existing notifications
      await cancelTaskNotifications(editingTask);
      
      // Schedule new notifications if enabled
      if (enableNotifications) {
        const notificationIds = await scheduleTaskNotifications(updatedTask);
        if (notificationIds.primary) {
          updatedTask.notificationId = notificationIds.primary;
        }
        if (notificationIds.secondary) {
          updatedTask.secondNotificationId = notificationIds.secondary;
        }
      } else {
        // Clear notification IDs if notifications are disabled
        updatedTask.notificationId = null;
        updatedTask.secondNotificationId = null;
      }
      
      // Try to update on server
      try {
        await api.put(`/tasks/${editingTask.id}`, updatedTask);
        Alert.alert('Success', 'Task updated successfully' + (enableNotifications ? ' and reminder reset!' : '!'));
      } catch (err) {
        console.error('Error updating task on server:', err);
        
        // Store offline change to sync later
        const offlineChanges = await AsyncStorage.getItem('offlineTaskChanges');
        const changes = offlineChanges ? JSON.parse(offlineChanges) : [];
        changes.push({ action: 'update', task: updatedTask });
        await AsyncStorage.setItem('offlineTaskChanges', JSON.stringify(changes));
        
        Alert.alert(
          'Offline Mode',
          'Your task has been updated locally and will sync when you reconnect to the internet.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Error in update task flow:', err);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setLoading(false);
      setEditTaskModalVisible(false);
      setEditingTask(null);
      resetFormFields();
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      // Find task to get notification ID
      const taskToRemove = tasks.find(task => task.id === taskId);
      if (!taskToRemove) return;
      
      // Cancel any scheduled notifications
      await cancelTaskNotifications(taskToRemove);
      
      // Remove from local state first for responsiveness
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Try to delete from server
      try {
        await api.delete(`/tasks/${taskId}`);
        Alert.alert('Success', 'Task deleted successfully');
      } catch (err) {
        console.error('Error deleting task from server:', err);
        
        // Store offline change to sync later
        const offlineChanges = await AsyncStorage.getItem('offlineTaskChanges');
        const changes = offlineChanges ? JSON.parse(offlineChanges) : [];
        changes.push({ action: 'delete', taskId });
        await AsyncStorage.setItem('offlineTaskChanges', JSON.stringify(changes));
        
        Alert.alert(
          'Offline Mode',
          'Your task has been deleted locally and will sync when you reconnect to the internet.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Error in delete task flow:', err);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    } finally {
      setDeleteConfirmModalVisible(false);
      setTaskToDelete(null);
    }
  };

  // Open edit task modal
  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    
    // Parse time from HH:MM format
    const timeComponents = task.time.split(':');
    const now = new Date();
    now.setHours(parseInt(timeComponents[0]), parseInt(timeComponents[1]));
    setTaskTime(now);
    
    setReminderTime(task.reminderMinutes || reminderTime);
    setMultipleReminders(task.useMultipleReminders || false);
    setSecondReminderTime(task.secondReminderMinutes || secondReminderTime);
    setSelectedDate(task.date);
    setEditTaskModalVisible(true);
  };

  // Update task progress status
  const updateTaskProgress = async (taskId) => {
    try {
      // Find the task and determine new progress
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;
      
      let newProgress;
      switch (taskToUpdate.progress) {
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
      
      // Update local state first for responsiveness
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, progress: newProgress };
        }
        return task;
      }));
      
      // Try to update server
      try {
        await api.put(`/tasks/${taskId}`, { progress: newProgress });
      } catch (err) {
        console.error('Error updating task on server:', err);
        
        // Store offline change to sync later
        const offlineChanges = await AsyncStorage.getItem('offlineTaskChanges');
        const changes = offlineChanges ? JSON.parse(offlineChanges) : [];
        const updatedTask = tasks.find(t => t.id === taskId);
        changes.push({ action: 'update', task: {...updatedTask, progress: newProgress} });
        await AsyncStorage.setItem('offlineTaskChanges', JSON.stringify(changes));
      }
    } catch (err) {
      console.error('Error in update task flow:', err);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  // Reset form fields
  const resetFormFields = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskTime(new Date());
    setReminderTime(15);
    setSelectedSuggestedTask(null);
    setShowCustomReminderInput(false);
    setCustomReminderTime('');
  };

  // Filter tasks by date
  const getTasksForDate = (date) => {
    return tasks.filter(task => task.date === date);
  };

  // Get learning progress from user profile data
  const getLearningProgress = () => {
    if (userProfile && userProfile.progress) {
      return userProfile.progress;
    }
    
    // Default values if no profile data is available
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
    if (userProfile && userProfile.recommendations) {
      return userProfile.recommendations;
    }
    
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

  // Navigate to user profile screen
  const goToProfile = () => {
    // This would navigate to a profile screen in a real app
    Alert.alert('Profile', 'Profile screen would open here');
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

  // Confirm delete task
  const confirmDeleteTask = (taskId) => {
    setTaskToDelete(taskId);
    setDeleteConfirmModalVisible(true);
  };

  // Open suggested task selection modal
  const openSuggestedTaskModal = () => {
    fetchSuggestedTasks();
    setTaskModalVisible(false);
    setTimeout(() => {
      setSuggestedTasksOpen(true);
    }, 300);
  };

  // Handle selection of a suggested task
  const handleSuggestedTaskSelect = (item) => {
    setSelectedSuggestedTask(item.value);
    setTaskTitle(item.label);
    setSuggestedTasksOpen(false);
    setTimeout(() => {
      setCustomTaskModalVisible(true);
    }, 300);
  };

  // Main render
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f1ff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Manager</Text>
        <TouchableOpacity style={styles.userButton} onPress={goToProfile}>
          <Text style={styles.userButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
      
      {/* Sync indicator */}
      {taskSyncing && (
        <View style={styles.syncIndicator}>
          <ActivityIndicator size="small" color="#8a6eff" />
          <Text style={styles.syncText}>Syncing...</Text>
        </View>
      )}
      
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchTasks}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8a6eff" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
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
              <Text style={styles.scheduleDate}>Schedule Progress</Text>
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
                        <View style={styles.taskActionRow}>
                          <TouchableOpacity 
                            style={[styles.statusBadge, {backgroundColor: getProgressColor(task.progress)}]}
                            onPress={() => updateTaskProgress(task.id)}
                          >
                            <Text style={styles.statusText}>{task.progress}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.taskDescription}>
                        {task.description || 'Complete this language learning task to improve your skills'}
                      </Text>
                      
                      {/* Task Action Buttons */}
                      <View style={styles.taskActionButtons}>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => openEditTaskModal(task)}
                        >
                          <Icon name="create-outline" size={16} color="#fff" />
                         
                          <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => confirmDeleteTask(task.id)}
                        >
                          <Icon name="trash-outline" size={16} color="#fff" />
                          <Text style={styles.actionButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="calendar-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyStateText}>No tasks scheduled for this date</Text>
                  <TouchableOpacity 
                    style={styles.addTaskButton}
                    onPress={() => setTaskModalVisible(true)}
                  >
                    <Text style={styles.addTaskButtonText}>Add a Task</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              tasks.length > 0 ? (
                <View style={styles.scheduleItem}>
                  <Text style={styles.scheduleDate}>Upcoming Tasks</Text>
                  {tasks
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5)
                    .map(task => (
                      <View key={task.id} style={styles.scheduleTask}>
                        <View style={styles.scheduleTaskHeader}>
                          <View style={styles.scheduleTaskLeft}>
                            <Text style={styles.scheduleDate}>
                              {new Date(task.date).toLocaleDateString()} at {task.time}
                            </Text>
                            <Text style={styles.scheduleTaskTitle}>{task.title}</Text>
                          </View>
                          <View style={styles.taskActionRow}>
                            <TouchableOpacity 
                              style={[styles.statusBadge, {backgroundColor: getProgressColor(task.progress)}]}
                              onPress={() => updateTaskProgress(task.id)}
                            >
                              <Text style={styles.statusText}>{task.progress}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={styles.taskDescription}>
                          {task.description || 'Complete this language learning task to improve your skills'}
                        </Text>
                        
                        {/* Task Action Buttons */}
                        <View style={styles.taskActionButtons}>
                          <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => openEditTaskModal(task)}
                          >
                            <Icon name="create-outline" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => confirmDeleteTask(task.id)}
                          >
                            <Icon name="trash-outline" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="calendar-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyStateText}>No tasks scheduled yet</Text>
                  <TouchableOpacity 
                    style={styles.addTaskButton}
                    onPress={() => setTaskModalVisible(true)}
                  >
                    <Text style={styles.addTaskButtonText}>Add a Task</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        </ScrollView>
      )}
      
      {/* Add Task Button */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => setTaskModalVisible(true)}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
      
      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarVisible(false);
              }}
              markedDates={markedDates}
              theme={{
                todayTextColor: '#8a6eff',
                selectedDayBackgroundColor: '#8a6eff',
                dotColor: '#8a6eff',
                arrowColor: '#8a6eff',
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
      
      {/* Task Type Selection Modal */}
      <Modal
        visible={taskModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <Text style={styles.modalSubtitle}>Choose task type</Text>
            
            <TouchableOpacity 
              style={styles.taskTypeButton}
              onPress={openSuggestedTaskModal}
            >
              <Icon name="bulb-outline" size={24} color="#8a6eff" />
              <Text style={styles.taskTypeButtonText}>Suggested Learning Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.taskTypeButton}
              onPress={() => {
                setTaskModalVisible(false);
                setTimeout(() => setCustomTaskModalVisible(true), 300);
              }}
            >
              <Icon name="create-outline" size={24} color="#8a6eff" />
              <Text style={styles.taskTypeButtonText}>Custom Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setTaskModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Suggested Task Selection Modal */}
      <Modal
        visible={suggestedTasksOpen}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Suggested Tasks</Text>
            <Text style={styles.modalSubtitle}>Select a language learning task</Text>
            
            <ScrollView style={styles.suggestedTasksList}>
              {suggestedTasks.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.suggestedTaskItem}
                  onPress={() => handleSuggestedTaskSelect(item)}
                >
                  <View style={styles.suggestedTaskIcon}>
                    {item.icon()}
                  </View>
                  <Text style={styles.suggestedTaskText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSuggestedTasksOpen(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Custom Task Modal */}
      <Modal
        visible={customTaskModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedSuggestedTask ? 'Configure Task' : 'Custom Task'}
            </Text>
            
            {!selectedSuggestedTask && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Task Title</Text>
                <TextInput
                  style={styles.input}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholder="Enter task title"
                />
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, {height: 80}]}
                value={taskDescription}
                onChangeText={setTaskDescription}
                placeholder="Enter task description"
                multiline
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setCalendarVisible(true)}
              >
                <Text>
                  {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>
                  {taskTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showTimePicker && (
              <DateTimePicker
                value={taskTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTaskTime(selectedTime);
                }}
              />
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reminder (minutes before)</Text>
              <View style={styles.reminderOptions}>
                {[5, 15, 30, 60].map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.reminderOption,
                      reminderTime === time && styles.reminderOptionSelected
                    ]}
                    onPress={() => setReminderTime(time)}
                  >
                    <Text 
                      style={[
                        styles.reminderOptionText,
                        reminderTime === time && styles.reminderOptionTextSelected
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setCustomTaskModalVisible(false);
                  resetFormFields();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => addTask(!!selectedSuggestedTask)}
                disabled={!taskTitle}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Edit Task Modal */}
      <Modal
        visible={editTaskModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Task Title</Text>
              <TextInput
                style={styles.input}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="Enter task title"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, {height: 80}]}
                value={taskDescription}
                onChangeText={setTaskDescription}
                placeholder="Enter task description"
                multiline
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setCalendarVisible(true)}
              >
                <Text>
                  {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>
                  {taskTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showTimePicker && (
              <DateTimePicker
                value={taskTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTaskTime(selectedTime);
                }}
              />
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reminder (minutes before)</Text>
              <View style={styles.reminderOptions}>
                {[5, 15, 30, 60].map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.reminderOption,
                      reminderTime === time && styles.reminderOptionSelected
                    ]}
                    onPress={() => setReminderTime(time)}
                  >
                    <Text 
                      style={[
                        styles.reminderOptionText,
                        reminderTime === time && styles.reminderOptionTextSelected
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setEditTaskModalVisible(false);
                  setEditingTask(null);
                  resetFormFields();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={updateTask}
                disabled={!taskTitle}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Updating...' : 'Update Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Confirm Delete</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this task?
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setDeleteConfirmModalVisible(false);
                  setTaskToDelete(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteConfirmButton}
                onPress={() => taskToDelete && deleteTask(taskToDelete)}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


  // Styles
 // Consolidated styles for Task Manager App
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
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8a6eff',
  },
  userButton: {
    backgroundColor: '#8a6eff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  userButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Calendar section styles
  calendarSection: {
    padding: 20,
  },
  calendarButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8a6eff',
  },
  calendarButtonText: {
    color: '#8a6eff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currentDateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  
  // Schedule list styles
  scheduleList: {
    padding: 15,
  },
  scheduleItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleDate: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  
  // Task styles
  scheduleTask: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9f7ff',
    borderRadius: 8,
  },
  scheduleTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTime: {
    backgroundColor: '#8a6eff',
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    marginRight: 10,
  },
  scheduleTaskTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#444',
  },
  taskDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  
  // Status badge styles
  taskActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Task action buttons
  taskActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#8a6eff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  // Empty state and task addition
  noTasksText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginBottom: 15,
  },
  addTaskButton: {
    backgroundColor: '#8a6eff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  addTaskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  
  // Floating action button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#8a6eff',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
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
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    flex: 1,
  },
  
  // Form input styles
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    height: 100,
    textAlignVertical: 'top',
  },
  timeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: '#8a6eff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f7ff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  taskOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  
  // Dropdown styles
  dropdown: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  dropdownContainer: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  
  // Loading and state indicators
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  
  // Confirmation modal
  confirmModalContent: {
    maxHeight: 'auto',
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#ff6b6b',
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#eee',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: 'bold',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Error and sync indicators
  errorContainer: {
    backgroundColor: '#ffebeb',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    flex: 1,
  },
  retryText: {
    color: '#8a6eff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    padding: 8,
  },
  syncText: {
    color: '#8a6eff',
    marginLeft: 8,
    fontSize: 12,
  },
  
  // Calendar modal specific styles
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
  selectedDateText: {
    fontSize: 16,
    color: '#8a6eff',
    marginBottom: 20,
    fontWeight: '500',
  },
  
  // Button rows
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
  
  // Date picker
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


  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f1ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#8a6eff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  userButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  syncIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#f0f0f0',
  },
  syncText: {
    marginLeft: 8,
    color: '#8a6eff',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    flex: 1,
  },
  retryText: {
    color: '#8a6eff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#8a6eff',
  },
  calendarSection: {
    padding: 15,
  },
  calendarButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  calendarButtonText: {
    color: '#8a6eff',
    fontWeight: '500',
  },
  currentDateText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  scheduleList: {
    padding: 15,
  },
  scheduleItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  scheduleDate: {
    color: '#666',
    marginBottom: 10,
  },
  scheduleTask: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  scheduleTask: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  scheduleTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scheduleTaskLeft: {
    flex: 1,
  },
  scheduleTime: {
    color: '#8a6eff',
    fontWeight: '500',
  },
  scheduleTaskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  taskDescription: {
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
  },
  taskActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  taskActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#8a6eff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyStateText: {
    marginTop: 15,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  addTaskButton: {
    backgroundColor: '#8a6eff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addTaskButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8a6eff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  confirmModalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f1ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  taskTypeButtonText: {
    marginLeft: 15,
    color: '#333',
    fontWeight: '500',
  },
  suggestedTasksList: {
    maxHeight: 300,
  },
  suggestedTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestedTaskIcon: {
    width: 40,
    alignItems: 'center',
  },
  suggestedTaskText: {
    marginLeft: 10,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  reminderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 3,
    borderRadius: 5,
  },
  reminderOptionSelected: {
    backgroundColor: '#8a6eff',
    borderColor: '#8a6eff',
  },
  reminderOptionText: {
    color: '#666',
  },
  reminderOptionTextSelected: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#8a6eff',
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#8a6eff',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  deleteConfirmButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
  },
  deleteConfirmButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmText: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});


  
  export default App;