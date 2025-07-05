// App.js - Finalized Language Learning Task Manager
import React, { useState, useEffect, useRef } from 'react';
import { 
  Platform,
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
  
  Switch
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// JSON file paths
const TASKS_FILE_PATH = FileSystem.documentDirectory + 'tasks.json';
const USER_PROFILE_FILE_PATH = FileSystem.documentDirectory + 'userProfile.json';
const SETTINGS_FILE_PATH = FileSystem.documentDirectory + 'settings.json';
const SUGGESTED_TASKS_FILE_PATH = FileSystem.documentDirectory + 'suggestedTasks.json';

// Default data structures
const DEFAULT_USER_PROFILE = {
  id: 1,
  name: 'Language Learner',
  progress: {
    Lessontaskcompleted : 65,
    grammarProgress: 78,
    listeningProgress: 42,
    speakingProgress: 51,
    readingProgress: 70,
    overallProgress: 61
  },
  recommendations: [
    'Listening exercises would help improve your comprehension',
    'Regular speaking practice is recommended to improve fluency'
  ]
};

const DEFAULT_SUGGESTED_TASKS = [
  { 
    id: 'vocab_food', 
    title: 'Vocabulary Practice: Food', 
    type: 'vocabulary',
    description: 'Learn 10 new food-related vocabulary words'
  },
  { 
    id: 'grammar_past', 
    title: 'Grammar: Past Tense', 
    type: 'grammar',
    description: 'Practice using past tense in sentences'
  },
  { 
    id: 'listening', 
    title: 'Listening Exercise: Conversations', 
    type: 'listening',
    description: 'Listen to 5-minute conversation and answer questions'
  },
  { 
    id: 'speaking', 
    title: 'Speaking Practice: Introductions', 
    type: 'speaking',
    description: 'Practice introducing yourself in different contexts'
  },
  { 
    id: 'reading', 
    title: 'Reading: Short Stories', 
    type: 'reading',
    description: 'Read a short story and summarize key points'
  }
];

const DEFAULT_SETTINGS = {
  notifications: {
    enabled: true,
    defaultReminderTime: 15,
    sound: true,
    vibration: true,
    multipleReminders: false,
    secondReminderTime: 60
  },
  theme: 'light',
  language: 'en'
};

// JSON File Manager Class
class JSONFileManager {
  static async fileExists(filePath) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  static async readJSONFile(filePath, defaultData = null) {
    try {
      const exists = await this.fileExists(filePath);
      if (!exists) {
        if (defaultData) {
          await this.writeJSONFile(filePath, defaultData);
          return defaultData;
        }
        return null;
      }
      
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error);
      return defaultData;
    }
  }

  static async writeJSONFile(filePath, data) {
    try {
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing JSON file ${filePath}:`, error);
      return false;
    }
  }

  static async updateJSONFile(filePath, updateFunction, defaultData = {}) {
    try {
      const currentData = await this.readJSONFile(filePath, defaultData);
      const updatedData = updateFunction(currentData);
      await this.writeJSONFile(filePath, updatedData);
      return updatedData;
    } catch (error) {
      console.error(`Error updating JSON file ${filePath}:`, error);
      return null;
    }
  }
}

// Task Manager Class
class TaskManager {
  static async getAllTasks() {
    return await JSONFileManager.readJSONFile(TASKS_FILE_PATH, []);
  }

  static async addTask(taskData) {
    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = await JSONFileManager.updateJSONFile(
      TASKS_FILE_PATH,
      (tasks) => [...tasks, newTask],
      []
    );

    return newTask;
  }

  static async updateTask(taskId, updates) {
    const updatedTasks = await JSONFileManager.updateJSONFile(
      TASKS_FILE_PATH,
      (tasks) => tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
      []
    );

    return updatedTasks.find(task => task.id === taskId);
  }

  static async deleteTask(taskId) {
    const updatedTasks = await JSONFileManager.updateJSONFile(
      TASKS_FILE_PATH,
      (tasks) => tasks.filter(task => task.id !== taskId),
      []
    );

    return true;
  }

  static async getTasksByDate(date) {
    const allTasks = await this.getAllTasks();
    return allTasks.filter(task => task.date === date);
  }

  static async getUpcomingTasks(limit = 10) {
    const allTasks = await this.getAllTasks();
    const today = new Date().toISOString().split('T')[0];
    
    return allTasks
      .filter(task => task.date >= today)
      .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
      .slice(0, limit);
  }
}

// Export all data function
const exportAllData = async () => {
  try {
    const allTasks = await TaskManager.getAllTasks();
    const userProfile = await UserProfileManager.getUserProfile();
    const settings = await SettingsManager.getSettings();
    const suggestedTasks = await SuggestedTasksManager.getSuggestedTasks();
    
    const exportData = {
      tasks: allTasks,
      userProfile: userProfile,
      settings: settings,
      suggestedTasks: suggestedTasks,
      exportDate: new Date().toISOString()
    };
    
    const exportPath = FileSystem.documentDirectory + 'language_learning_backup.json';
    await FileSystem.writeAsStringAsync(exportPath, JSON.stringify(exportData, null, 2));
    
    return exportPath;
  } catch (error) {
    console.error('Error exporting data:', error);
    Alert.alert('Export Error', 'Failed to export data');
    return null;
  }
};

// Clear all data function
const clearAllData = async () => {
  Alert.alert(
    'Clear All Data',
    'Are you sure you want to delete all your tasks, progress, and settings? This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          try {
            await FileSystem.deleteAsync(TASKS_FILE_PATH, { idempotent: true });
            await FileSystem.deleteAsync(USER_PROFILE_FILE_PATH, { idempotent: true });
            await FileSystem.deleteAsync(SETTINGS_FILE_PATH, { idempotent: true });
            await FileSystem.deleteAsync(SUGGESTED_TASKS_FILE_PATH, { idempotent: true });
            
            // Reset state
            setTasks([]);
            setUserProfile(null);
            
            // Reload default data
            await loadAllData();
            
            Alert.alert('Success', 'All data has been cleared');
          } catch (error) {
            console.error('Error clearing data:', error);
            Alert.alert('Error', 'Failed to clear all data');
          }
        }
      }
    ]
  );
};

// User Profile Manager
class UserProfileManager {
  static async getUserProfile() {
    return await JSONFileManager.readJSONFile(USER_PROFILE_FILE_PATH, DEFAULT_USER_PROFILE);
  }

  static async updateUserProfile(updates) {
    return await JSONFileManager.updateJSONFile(
      USER_PROFILE_FILE_PATH,
      (profile) => ({ ...profile, ...updates }),
      DEFAULT_USER_PROFILE
    );
  }

  static async updateProgress(progressData) {
    return await JSONFileManager.updateJSONFile(
      USER_PROFILE_FILE_PATH,
      (profile) => ({
        ...profile,
        progress: { ...profile.progress, ...progressData }
      }),
      DEFAULT_USER_PROFILE
    );
  }
}

// Settings Manager
class SettingsManager {
  static async getSettings() {
    return await JSONFileManager.readJSONFile(SETTINGS_FILE_PATH, DEFAULT_SETTINGS);
  }

  static async updateSettings(updates) {
    return await JSONFileManager.updateJSONFile(
      SETTINGS_FILE_PATH,
      (settings) => ({ ...settings, ...updates }),
      DEFAULT_SETTINGS
    );
  }

  static async updateNotificationSettings(notificationUpdates) {
    return await JSONFileManager.updateJSONFile(
      SETTINGS_FILE_PATH,
      (settings) => ({
        ...settings,
        notifications: { ...settings.notifications, ...notificationUpdates }
      }),
      DEFAULT_SETTINGS
    );
  }
}

// Suggested Tasks Manager
class SuggestedTasksManager {
  static async getSuggestedTasks() {
    return await JSONFileManager.readJSONFile(SUGGESTED_TASKS_FILE_PATH, DEFAULT_SUGGESTED_TASKS);
  }

  static async addSuggestedTask(taskData) {
    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...taskData
    };

    await JSONFileManager.updateJSONFile(
      SUGGESTED_TASKS_FILE_PATH,
      (tasks) => [...tasks, newTask],
      DEFAULT_SUGGESTED_TASKS
    );

    return newTask;
  }
}

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
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [suggestedTasksOpen, setSuggestedTasksOpen] = useState(false);
  const [selectedSuggestedTask, setSelectedSuggestedTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskTime, setTaskTime] = useState(new Date());
  const [reminderTime, setReminderTime] = useState(15);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [customReminderTime, setCustomReminderTime] = useState('');
  const [showCustomReminderInput, setShowCustomReminderInput] = useState(false);
  const [multipleReminders, setMultipleReminders] = useState(false);
  const [secondReminderTime, setSecondReminderTime] = useState(60);
  const [notificationSettings, setNotificationSettings] = useState({
    sound: true,
    vibration: true,
  });
  const [notificationsSettingsModal, setNotificationsSettingsModal] = useState(false);
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

  // Load all data from JSON files
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tasks
      const allTasks = await TaskManager.getAllTasks();
      setTasks(allTasks);

      // Load user profile
      const profile = await UserProfileManager.getUserProfile();
      setUserProfile(profile);

      // Load settings
      const settings = await SettingsManager.getSettings();
      setEnableNotifications(settings.notifications.enabled);
      setReminderTime(settings.notifications.defaultReminderTime);
      setNotificationSettings({
        sound: settings.notifications.sound,
        vibration: settings.notifications.vibration,
      });
      setMultipleReminders(settings.notifications.multipleReminders);
      setSecondReminderTime(settings.notifications.secondReminderTime);

      // Load suggested tasks
      const suggested = await SuggestedTasksManager.getSuggestedTasks();
      const formattedTasks = suggested.map(task => ({
        label: task.title,
        value: task.id,
        type: task.type,
        description: task.description
      }));
      setSuggestedTasks(formattedTasks);

      // Schedule notifications for all tasks if enabled
      if (settings.notifications.enabled) {
        for (const task of allTasks) {
          if (new Date(task.date) >= new Date()) {
            if (task.notificationId) {
              await Notifications.cancelScheduledNotificationAsync(task.notificationId);
            }
            if (task.secondNotificationId) {
              await Notifications.cancelScheduledNotificationAsync(task.secondNotificationId);
            }
            
            const notificationIds = await scheduleTaskNotifications(task);
            
            if (notificationIds.primary || notificationIds.secondary) {
              await TaskManager.updateTask(task.id, {
                notificationId: notificationIds.primary,
                secondNotificationId: notificationIds.secondary
              });
            }
          }
        }
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data from storage.');
    } finally {
      setLoading(false);
    }
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    try {
      await SettingsManager.updateNotificationSettings({
        enabled: enableNotifications,
        defaultReminderTime: reminderTime,
        sound: notificationSettings.sound,
        vibration: notificationSettings.vibration,
        multipleReminders: multipleReminders,
        secondReminderTime: secondReminderTime
      });
    } catch (err) {
      console.error('Error saving notification settings:', err);
    }
  };

  // Schedule notifications for a task
  const scheduleTaskNotifications = async (task) => {
    if (!enableNotifications) return { primary: null, secondary: null };
    
    try {
      const hasPermission = await registerForPushNotifications();
      if (!hasPermission) return { primary: null, secondary: null };
      
      const taskDate = new Date(task.date);
      const timeParts = task.time.split(':');
      
      taskDate.setHours(
        parseInt(timeParts[0]),
        parseInt(timeParts[1]),
        0
      );
      
      const reminderMinutes = task.reminderMinutes || reminderTime;
      const primaryReminderDate = new Date(taskDate.getTime() - (reminderMinutes * 60000));
      
      const result = { primary: null, secondary: null };
      
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
      
      if (multipleReminders && task.useMultipleReminders !== false) {
        const secondReminderMins = task.secondReminderMinutes || secondReminderTime;
        if (secondReminderMins > reminderMinutes) {
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

  // Helper function to get icon for task type
  const getIconForTaskType = (type) => {
    switch (type) {
      case 'vocabulary': return 'text-outline';
      case 'grammar': return 'book-outline';
      case 'listening': return 'headset-outline';
      case 'speaking': return 'mic-outline';
      case 'reading': return 'newspaper-outline';
      default: return 'document-outline';
    }
  };

  // Initial data loading
  useEffect(() => {
    loadAllData();
    registerForPushNotifications();
    
    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { taskId } = response.notification.request.content.data;
      if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          setSelectedDate(task.date);
        }
      }
    });
    
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Save notification settings when they change
  useEffect(() => {
    if (userProfile) {
      saveNotificationSettings();
    }
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
  }, [tasks, selectedDate]);

  // Handle custom reminder time input
  const handleCustomReminderChange = (text) => {
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
      
      const formattedTime = taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        .replace(/\s/g, '')
        .replace(/[APap][Mm]$/i, '');
      
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
      
      const newTask = await TaskManager.addTask(taskData);
      
      if (enableNotifications) {
        const notificationIds = await scheduleTaskNotifications(newTask);
        if (notificationIds.primary || notificationIds.secondary) {
          await TaskManager.updateTask(newTask.id, {
            notificationId: notificationIds.primary,
            secondNotificationId: notificationIds.secondary
          });
          newTask.notificationId = notificationIds.primary;
          newTask.secondNotificationId = notificationIds.secondary;
        }
      }
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      setTaskModalVisible(false);
      setCustomTaskModalVisible(false);
      setSuggestedTasksOpen(false);
      
      Alert.alert('Success', 'Task added successfully' + (enableNotifications ? ' and reminder set!' : '!'));
      
    } catch (err) {
      console.error('Error adding task:', err);
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
      
      const formattedTime = taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        .replace(/\s/g, '')
        .replace(/[APap][Mm]$/i, '');
      
      const updatedTaskData = {
        title: taskTitle,
        description: taskDescription,
        time: formattedTime,
        date: selectedDate || editingTask.date,
        reminderMinutes: reminderTime,
        useMultipleReminders: multipleReminders,
        secondReminderMinutes: secondReminderTime
      };
      
      await cancelTaskNotifications(editingTask);
      
      if (enableNotifications) {
        const notificationIds = await scheduleTaskNotifications({...editingTask, ...updatedTaskData});
        if (notificationIds.primary) {
          updatedTaskData.notificationId = notificationIds.primary;
        }
        if (notificationIds.secondary) {
          updatedTaskData.secondNotificationId = notificationIds.secondary;
        }
      } else {
        updatedTaskData.notificationId = null;
        updatedTaskData.secondNotificationId = null;
      }
      
      const updatedTask = await TaskManager.updateTask(editingTask.id, updatedTaskData);
      
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));
      
      Alert.alert('Success', 'Task updated successfully' + (enableNotifications ? ' and reminder reset!' : '!'));
      
    } catch (err) {
      console.error('Error updating task:', err);
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
      const taskToRemove = tasks.find(task => task.id === taskId);
      if (!taskToRemove) return;
      
      await cancelTaskNotifications(taskToRemove);
      await TaskManager.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      Alert.alert('Success', 'Task deleted successfully');
      
    } catch (err) {
      console.error('Error deleting task:', err);
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
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;
      
      let newProgress;
      switch (taskToUpdate.progress) {
        case 'Not Started': newProgress = 'In Progress'; break;
        case 'In Progress': newProgress = 'Completed'; break;
        case 'Completed': newProgress = 'Not Started'; break;
        default: newProgress = 'Not Started';
      }
      
      await TaskManager.updateTask(taskId, { progress: newProgress });
      
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, progress: newProgress };
        }
        return task;
      }));
      
    } catch (err) {
      console.error('Error updating task progress:', err);
      Alert.alert('Error', 'Failed to update task progress. Please try again.');
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
    
    return {
      vocabularyProgress: 65,
      grammarProgress: 78,
      listeningProgress: 42,
      speakingProgress: 51,
      readingProgress: 70,
      overallProgress: 61
    };
  };

  // Select suggested task
  const selectSuggestedTask = (task) => {
    setSelectedSuggestedTask(task.value);
    setTaskTitle(task.label);
    setTaskDescription(task.description || '');
    setSuggestedTasksOpen(false);
    setCustomTaskModalVisible(true);
  };

  // Render task item
  const renderTaskItem = (task) => {
    const getProgressColor = (progress) => {
      switch (progress) {
        case 'Completed': return '#4CAF50';
        case 'In Progress': return '#FF9800';
        default: return '#757575';
      }
    };

    const getProgressIcon = (progress) => {
      switch (progress) {
        case 'Completed': return 'checkmark-circle';
        case 'In Progress': return 'play-circle';
        default: return 'ellipse-outline';
      }
    };

    return (
      <View key={task.id} style={styles.taskItem}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.taskActions}>
            <TouchableOpacity
              onPress={() => openEditTaskModal(task)}
              style={styles.actionButton}
            >
              <Icon name="create-outline" size={20} color="#8676D1" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTaskToDelete(task.id);
                setDeleteConfirmModalVisible(true);
              }}
              style={styles.actionButton}
            >
              <Icon name="trash-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>
        
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}
        
        <View style={styles.taskFooter}>
          <Text style={styles.taskTime}>{task.time}</Text>
          <TouchableOpacity
            onPress={() => updateTaskProgress(task.id)}
            style={[styles.progressButton, { backgroundColor: getProgressColor(task.progress) }]}
          >
            <Icon 
              name={getProgressIcon(task.progress)} 
              size={16} 
              color="white" 
              style={styles.progressIcon}
            />
            <Text style={styles.progressText}>{task.progress}</Text>
          </TouchableOpacity>
        </View>
        
        {task.reminderMinutes && (
          <Text style={styles.reminderText}>
            Reminder: {task.reminderMinutes} min before
          </Text>
        )}
      </View>
    );
  };

  // Render learning progress
  const renderLearningProgress = () => {
    const progress = getLearningProgress();
    
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Learning Progress</Text>
        {Object.entries(progress).map(([key, value]) => {
          if (key === 'overallProgress') return null;
          const skillName = key.replace('Progress', '').charAt(0).toUpperCase() + 
                           key.replace('Progress', '').slice(1);
          
          return (
            <View key={key} style={styles.progressItem}>
              <Text style={styles.skillName}>{skillName}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${value}%` }]} 
                />
              </View>
              <Text style={styles.progressPercent}>{value}%</Text>
            </View>
          );
        })}
        
        <View style={styles.overallProgress}>
          <Text style={styles.overallProgressText}>
            Overall Progress: {progress.overallProgress}%
          </Text>
        </View>
      </View>
    );
  };

  // Handle time picker change
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || taskTime;
    setShowTimePicker(Platform.OS === 'ios');
    setTaskTime(currentTime);
  };

  // Handle date selection from calendar
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setCalendarVisible(false);
  };

  // Confirm task deletion
  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
    }
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#8676D1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Language Learning Tasks</Text>
        <TouchableOpacity
          onPress={() => setNotificationsSettingsModal(true)}
          style={styles.settingsButton}
        >
          <Icon name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8676D1" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadAllData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Learning Progress Section */}
        {userProfile && renderLearningProgress()}

        {/* Recommendations */}
        {userProfile?.recommendations && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
            {userProfile.recommendations.map((rec, index) => (
              <Text key={index} style={styles.recommendationText}>• {rec}</Text>
            ))}
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.dateSection}>
          <TouchableOpacity
            onPress={() => setCalendarVisible(true)}
            style={styles.dateButton}
          >
            <Icon name="calendar-outline" size={20} color="#8676D1" />
            <Text style={styles.dateButtonText}>
              {selectedDate || 'Select Date'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tasks for Selected Date */}
        {selectedDate && (
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>
              Tasks for {selectedDate}
            </Text>
            {getTasksForDate(selectedDate).length === 0 ? (
              <Text style={styles.noTasksText}>No tasks for this date</Text>
            ) : (
              getTasksForDate(selectedDate).map(renderTaskItem)
            )}
          </View>
        )}

        {/* All Upcoming Tasks */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          {tasks
            .filter(task => new Date(task.date) >= new Date())
            .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
            .slice(0, 5)
            .map(renderTaskItem)}
        </View>
      </ScrollView>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setTaskModalVisible(true)}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setCalendarVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#8676D1" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: '#8676D1',
                todayTextColor: '#8676D1',
                arrowColor: '#8676D1',
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Task Type Selection Modal */}
      <Modal
        visible={taskModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.taskModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TouchableOpacity
                onPress={() => {
                  setTaskModalVisible(false);
                  resetFormFields();
                }}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#8676D1" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.taskTypeButtons}>
              <TouchableOpacity
                style={styles.taskTypeButton}
                onPress={() => {
                  setTaskModalVisible(false);
                  setCustomTaskModalVisible(true);
                }}
              >
                <Icon name="create-outline" size={24} color="#8676D1" />
                <Text style={styles.taskTypeButtonText}>Custom Task</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.taskTypeButton}
                onPress={() => {
                  setTaskModalVisible(false);
                  setSuggestedTasksOpen(true);
                }}
              >
                <Icon name="bulb-outline" size={24} color="#8676D1" />
                <Text style={styles.taskTypeButtonText}>Suggested Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      

      {/* Custom Task Modal */}
      <Modal
        visible={customTaskModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.taskModal}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Custom Task</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCustomTaskModalVisible(false);
                    resetFormFields();
                  }}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#8676D1" />
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Task Title *</Text>
                <TextInput
                  style={styles.input}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholder="Enter task title"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  placeholder="Enter task description"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  onPress={() => setCalendarVisible(true)}
                  style={styles.input}
                >
                  <Text style={selectedDate ? styles.selectedText : styles.placeholderText}>
                    {selectedDate || 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={styles.input}
                >
                  <Text style={styles.selectedText}>
                    {taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Notification Settings */}
              <View style={styles.formSection}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.label}>Notifications</Text>
                  <Switch
                    value={enableNotifications}
                    onValueChange={setEnableNotifications}
                    trackColor={{ false: '#767577', true: '#8676D1' }}
                    thumbColor={enableNotifications ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>
                
                {enableNotifications && (
                  <>
                    <Text style={styles.sublabel}>Reminder Time (minutes before)</Text>
                    <View style={styles.reminderOptions}>
                      {[5, 15, 30, 60].map((minutes) => (
                        <TouchableOpacity
                          key={minutes}
                          style={[
                            styles.reminderOption,
                            reminderTime === minutes && styles.selectedReminderOption
                          ]}
                          onPress={() => setReminderTime(minutes)}
                        >
                          <Text style={[
                            styles.reminderOptionText,
                            reminderTime === minutes && styles.selectedReminderOptionText
                          ]}>
                            {minutes}m
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[
                          styles.reminderOption,
                          showCustomReminderInput && styles.selectedReminderOption
                        ]}
                        onPress={() => setShowCustomReminderInput(!showCustomReminderInput)}
                      >
                        <Text style={[
                          styles.reminderOptionText,
                          showCustomReminderInput && styles.selectedReminderOptionText
                        ]}>
                          Custom
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    {showCustomReminderInput && (
                      <View style={styles.customReminderContainer}>
                        <TextInput
                          style={styles.customReminderInput}
                          value={customReminderTime}
                          onChangeText={handleCustomReminderChange}
                          placeholder="Enter minutes"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                        />
                        <TouchableOpacity
                          onPress={saveCustomReminderTime}
                          style={styles.saveCustomButton}
                        >
                          <Text style={styles.saveCustomButtonText}>Set</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    <View style={styles.multipleRemindersContainer}>
                      <Text style={styles.sublabel}>Multiple Reminders</Text>
                      <Switch
                        value={multipleReminders}
                        onValueChange={setMultipleReminders}
                        trackColor={{ false: '#767577', true: '#8676D1' }}
                        thumbColor={multipleReminders ? '#f5dd4b' : '#f4f3f4'}
                      />
                    </View>
                    
                    {multipleReminders && (
                      <View style={styles.formSection}>
                        <Text style={styles.sublabel}>Second Reminder (minutes before)</Text>
                        <View style={styles.reminderOptions}>
                          {[30, 60, 120, 240].map((minutes) => (
                            <TouchableOpacity
                              key={minutes}
                              style={[
                                styles.reminderOption,
                                secondReminderTime === minutes && styles.selectedReminderOption
                              ]}
                              onPress={() => setSecondReminderTime(minutes)}
                            >
                              <Text style={[
                                styles.reminderOptionText,
                                secondReminderTime === minutes && styles.selectedReminderOptionText
                              ]}>
                                {minutes}m
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[styles.addTaskButton, (!taskTitle || !selectedDate) && styles.disabledButton]}
                onPress={() => addTask(false)}
                disabled={!taskTitle || !selectedDate || loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.addTaskButtonText}>Add Task</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={editTaskModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.taskModal}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Task</Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditTaskModalVisible(false);
                    setEditingTask(null);
                    resetFormFields();
                  }}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#8676D1" />
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Task Title *</Text>
                <TextInput
                  style={styles.input}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholder="Enter task title"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  placeholder="Enter task description"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  onPress={() => setCalendarVisible(true)}
                  style={styles.input}
                >
                  <Text style={selectedDate ? styles.selectedText : styles.placeholderText}>
                    {selectedDate || editingTask?.date || 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={styles.input}
                >
                  <Text style={styles.selectedText}>
                    {taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Notification Settings */}
              <View style={styles.formSection}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.label}>Notifications</Text>
                  <Switch
                    value={enableNotifications}
                    onValueChange={setEnableNotifications}
                    trackColor={{ false: '#767577', true: '#8676D1' }}
                    thumbColor={enableNotifications ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>
                
                {enableNotifications && (
                  <>
                    <Text style={styles.sublabel}>Reminder Time (minutes before)</Text>
                    <View style={styles.reminderOptions}>
                      {[5, 15, 30, 60].map((minutes) => (
                        <TouchableOpacity
                          key={minutes}
                          style={[
                            styles.reminderOption,
                            reminderTime === minutes && styles.selectedReminderOption
                          ]}
                          onPress={() => setReminderTime(minutes)}
                        >
                          <Text style={[
                            styles.reminderOptionText,
                            reminderTime === minutes && styles.selectedReminderOptionText
                          ]}>
                            {minutes}m
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    <View style={styles.multipleRemindersContainer}>
                      <Text style={styles.sublabel}>Multiple Reminders</Text>
                      <Switch
                        value={multipleReminders}
                        onValueChange={setMultipleReminders}
                        trackColor={{ false: '#767577', true: '#8676D1' }}
                        thumbColor={multipleReminders ? '#f5dd4b' : '#f4f3f4'}
                      />
                    </View>
                    
                    {multipleReminders && (
                      <View style={styles.formSection}>
                        <Text style={styles.sublabel}>Second Reminder (minutes before)</Text>
                        <View style={styles.reminderOptions}>
                          {[30, 60, 120, 240].map((minutes) => (
                            <TouchableOpacity
                              key={minutes}
                              style={[
                                styles.reminderOption,
                                secondReminderTime === minutes && styles.selectedReminderOption
                              ]}
                              onPress={() => setSecondReminderTime(minutes)}
                            >
                              <Text style={[
                                styles.reminderOptionText,
                                secondReminderTime === minutes && styles.selectedReminderOptionText
                              ]}>
                                {minutes}m
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[styles.addTaskButton, (!taskTitle || !selectedDate) && styles.disabledButton]}
                onPress={updateTask}
                disabled={!taskTitle || !selectedDate || loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.addTaskButtonText}>Update Task</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Suggested Tasks Dropdown Modal */}
      <Modal
        visible={suggestedTasksOpen}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.suggestedTaskModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Suggested Task</Text>
              <TouchableOpacity
                onPress={() => setSuggestedTasksOpen(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#8676D1" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.suggestedTasksList}>
              {suggestedTasks.map((suggestedTask) => (
                <TouchableOpacity
                  key={suggestedTask.value}
                  style={styles.suggestedTaskItem}
                  onPress={() => selectSuggestedTask(suggestedTask)}
                >
                  <View style={styles.taskTypeIcon}>
                    <Icon 
                      name={getIconForTaskType(suggestedTask.type)} 
                      size={24} 
                      color="#8676D1" 
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.suggestedTaskTitle}>{suggestedTask.label}</Text>
                    <Text style={styles.suggestedTaskType}>
                      {suggestedTask.type.charAt(0).toUpperCase() + suggestedTask.type.slice(1)}
                    </Text>
                    {suggestedTask.description && (
                      <Text style={styles.suggestedTaskDescription}>
                        {suggestedTask.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Task</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete this task? This action cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteConfirmModalVisible(false);
                  setTaskToDelete(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={confirmDeleteTask}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notifications Settings Modal */}
      <Modal
        visible={notificationsSettingsModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity
                onPress={() => setNotificationsSettingsModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#8676D1" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.settingsContent}>
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Notifications</Text>
                
                <View style={styles.settingsItem}>
                  <Text style={styles.settingsItemLabel}>Enable Notifications</Text>
                  <Switch
                    value={enableNotifications}
                    onValueChange={setEnableNotifications}
                    trackColor={{ false: '#767577', true: '#8676D1' }}
                    thumbColor={enableNotifications ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>
                
                {enableNotifications && (
                  <>
                    <View style={styles.settingsItem}>
                      <Text style={styles.settingsItemLabel}>Notification Sound</Text>
                      <Switch
                        value={notificationSettings.sound}
                        onValueChange={(value) => setNotificationSettings({...notificationSettings, sound: value})}
                        trackColor={{ false: '#767577', true: '#8676D1' }}
                        thumbColor={notificationSettings.sound ? '#f5dd4b' : '#f4f3f4'}
                      />
                    </View>
                    
                    <View style={styles.settingsItem}>
                      <Text style={styles.settingsItemLabel}>Vibration</Text>
                      <Switch
                        value={notificationSettings.vibration}
                        onValueChange={(value) => setNotificationSettings({...notificationSettings, vibration: value})}
                        trackColor={{ false: '#767577', true: '#8676D1' }}
                        thumbColor={notificationSettings.vibration ? '#f5dd4b' : '#f4f3f4'}
                      />
                    </View>
                  </>
                )}
              </View>
              
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Data Management</Text>
                
                <TouchableOpacity
                  style={styles.dataManagementButton}
                  onPress={async () => {
                    const backupPath = await exportAllData();
                    if (backupPath) {
                      Alert.alert(
                        'Export Successful', 
                        `Data exported to: ${backupPath}`,
                        [{ text: 'OK' }]
                      );
                    }
                  }}
                >
                  <Icon name="download-outline" size={20} color="#8676D1" />
                  <Text style={styles.dataManagementButtonText}>Export Data</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.dataManagementButton, styles.dangerButton]}
                  onPress={clearAllData}
                >
                  <Icon name="trash-outline" size={20} color="#f44336" />
                  <Text style={[styles.dataManagementButtonText, styles.dangerButtonText]}>
                    Clear All Data
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={taskTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f1ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#8676D1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#8676D1',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    margin: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    flex: 1,
  },
  retryButton: {
    marginLeft: 10,
  },
  retryText: {
    color: '#8676D1',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillName: {
    width: 100,
    color: '#555',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8676D1',
  },
  progressPercent: {
    width: 40,
    textAlign: 'right',
    color: '#555',
  },
  overallProgress: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  overallProgressText: {
    fontWeight: 'bold',
    color: '#8676D1',
    textAlign: 'center',
  },
  recommendationsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recommendationText: {
    color: '#555',
    marginBottom: 5,
  },
  dateSection: {
    marginBottom: 15,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  dateButtonText: {
    marginLeft: 10,
    color: '#8676D1',
    fontWeight: '500',
  },
  tasksSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noTasksText: {
    textAlign: 'center',
    color: '#888',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
  },
  taskItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  taskActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
  },
  taskDescription: {
    color: '#666',
    marginBottom: 10,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    color: '#8676D1',
    fontWeight: '500',
  },
  progressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  progressIcon: {
    marginRight: 5,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  reminderText: {
    marginTop: 5,
    fontSize: 12,
    color: '#888',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8676D1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  taskModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  suggestedTaskModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  settingsModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
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
  closeButton: {
    padding: 5,
  },
  taskTypeButtons: {
    marginTop: 10,
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
  formSection: {
    marginBottom: 15,
  },
  label: {
    color: '#555',
    marginBottom: 5,
    fontWeight: '500',
  },
  sublabel: {
    color: '#777',
    marginBottom: 5,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectedText: {
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reminderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  selectedReminderOption: {
    backgroundColor: '#8676D1',
    borderColor: '#8676D1',
  },
  reminderOptionText: {
    color: '#666',
  },
  selectedReminderOptionText: {
    color: 'white',
  },
  customReminderContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  customReminderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  saveCustomButton: {
    backgroundColor: '#8676D1',
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveCustomButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  multipleRemindersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addTaskButton: {
    backgroundColor: '#8676D1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addTaskButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  suggestedTasksList: {
    maxHeight: 400,
  },
  suggestedTaskItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskTypeIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  suggestedTaskTitle: {
    fontWeight: '500',
    color: '#333',
  },
  suggestedTaskType: {
    fontSize: 12,
    color: '#888',
    marginVertical: 3,
  },
  suggestedTaskDescription: {
    fontSize: 13,
    color: '#666',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmMessage: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#eee',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  settingsContent: {
    flex: 1,
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingsItemLabel: {
    color: '#555',
  },
  dataManagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f4f1ff',
    borderRadius: 8,
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: '#ffebee',
  },
  dataManagementButtonText: {
    marginLeft: 10,
    color: '#333',
  },
  dangerButtonText: {
    color: '#f44336',
  },
});

export default App;