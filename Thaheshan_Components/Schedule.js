//import the specific keys for the reac native application
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Button, TextInput } from 'react-native-paper';
import notifee from '@notifee/react-native';


//create a local configration for store the datas as per storage system for the task schedule management feature component 
LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'],
  today: 'Today'
};
LocaleConfig.defaultLocale = 'en';

const TaskScheduler = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [tasks, setTasks] = useState({});
  const [taskDescription, setTaskDescription] = useState('');
  const [taskTime, setTaskTime] = useState('');

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  const scheduleNotification = async (task) => {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.displayNotification({
      title: 'Task Reminder',
      body: task.description,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
    });
  };

  const addTask = () => {
    if (!taskDescription || !taskTime) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const newTask = { description: taskDescription, time: taskTime };
    const updatedTasks = { ...tasks, [selectedDate]: [...(tasks[selectedDate] || []), newTask] };
    setTasks(updatedTasks);

    // Schedule notification
    const taskDateTime = new Date(`${selectedDate}T${taskTime}`);
    const reminderTime = new Date(taskDateTime.getTime() - 30 * 60000); // 30 minutes before
    scheduleNotification(newTask);

    setTaskDescription('');
    setTaskTime('');
  };

  return (
    <ScrollView>
      <Calendar
        onDayPress={handleDateSelect}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' }
        }}
      />
      {selectedDate && (
        <View style={{ padding: 20 }}>
          <TextInput
            label="Task Description"
            value={taskDescription}
            onChangeText={setTaskDescription}
            mode="outlined"
          />
          <TextInput
            label="Task Time (HH:MM)"
            value={taskTime}
            onChangeText={setTaskTime}
            mode="outlined"
            style={{ marginTop: 10 }}
          />
          <Button mode="contained" onPress={addTask} style={{ marginTop: 20 }}>
            Add Task
          </Button>
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Tasks for {selectedDate}:</Text>
            {tasks[selectedDate]?.map((task, index) => (
              <Text key={index}>{task.time} - {task.description}</Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default TaskScheduler;