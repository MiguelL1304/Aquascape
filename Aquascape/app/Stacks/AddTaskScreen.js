// AddTaskScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Elements from '../../constants/Elements';

const categories = ['Work', 'Personal', 'Lifestyle', 'Others']; // Categories

const AddTaskScreen = ({ navigation, route }) => {
  const { selectedDate, addTaskCallback } = route.params; // Get date and callback from params
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // Default to the first category
  const [recurrence, setRecurrence] = useState(null); // Default recurrence

  const handleAddTask = () => {
    if (!taskTitle.trim()) return; // Prevent empty titles
    const newTask = {
      id: new Date().getTime(), // Unique ID for the task
      title: taskTitle,
      completed: false,
      category: selectedCategory,
      recurrence,
    };
    addTaskCallback(newTask); // Call the callback to add the task
    navigation.goBack(); // Navigate back to the TasksScreen
  };

  const handleCancel = () => {
    navigation.goBack(); // Navigate back to the TasksScreen without adding a new task
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={taskTitle}
        onChangeText={setTaskTitle}
      />
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        <Picker.Item label="Select a Category..." value={null} />
        {categories.map((category) => (
          <Picker.Item key={category} label={category} value={category} />
        ))}
      </Picker>
      <Picker
        selectedValue={recurrence}
        onValueChange={(itemValue) => setRecurrence(itemValue)}
      >
        <Picker.Item label="Select Recurrence..." value={null} />
        <Picker.Item label="None" value="None" />
        <Picker.Item label="Daily" value="Daily" />
        <Picker.Item label="Weekly" value="Weekly" />
        <Picker.Item label="Monthly" value="Monthly" />
      </Picker>
      <View style={styles.buttonContainer}>
      <TouchableOpacity style={Elements.mainButton} onPress={handleAddTask}>
        <Text style={Elements.mainButtonText}>Add Task</Text>
      </TouchableOpacity>
      <TouchableOpacity style={Elements.secondaryButton} onPress={handleCancel}>
        <Text style={Elements.secondaryButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 100,
  },
});

export default AddTaskScreen;
