import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CheckBox } from 'react-native-elements';

const TasksScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(null);  // State to track the selected date
  const [tasks, setTasks] = useState({});  // Store tasks for different dates
  const [newTask, setNewTask] = useState('');  // Store the new task input

  // Handler to add a task to the selected date
  const addTask = () => {
    if (!newTask.trim()) return;  // Ignore empty tasks
    const updatedTasks = {
      ...tasks,
      [selectedDate]: [
        ...(tasks[selectedDate] || []),
        { title: newTask, completed: false }
      ]
    };
    setTasks(updatedTasks);
    setNewTask('');  // Reset the input field
  };

  // Toggle task completion
  const toggleTaskCompletion = (index) => {
    const updatedTasks = tasks[selectedDate].map((task, idx) =>
      idx === index ? { ...task, completed: !task.completed } : task
    );
    setTasks({ ...tasks, [selectedDate]: updatedTasks });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TasksScreen</Text>

      {/* Calendar widget */}
      <Calendar
        minDate={'2024-08-01'}
        maxDate={'2024-12-31'}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: 'blue' }
        }}
      />

      {/* Display to-do list when a date is selected */}
      {selectedDate && (
        <View style={styles.todoContainer}>
          <Text style={styles.todoTitle}>Tasks for {selectedDate}:</Text>

          {/* Task input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newTask}
              onChangeText={setNewTask}
              placeholder="Enter a new task"
            />
            <Button title="Add Task" onPress={addTask} />
          </View>

          {/* Display list of tasks for the selected date */}
          {tasks[selectedDate] ? (
            <FlatList
              data={tasks[selectedDate]}
              renderItem={({ item, index }) => (
                <View style={styles.taskItemContainer}>
                  <CheckBox
                    checked={item.completed}
                    onPress={() => toggleTaskCompletion(index)}
                    checkedColor="green" // Color for checked state
                    uncheckedColor="gray" // Color for unchecked state
                    containerStyle={{ margin: 0, padding: 0 }} // Remove extra padding/margin
                  />
                  <Text style={[styles.taskItem, item.completed && styles.taskCompleted]}>
                    {item.title}
                  </Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <Text>No tasks for this day.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  todoContainer: {
    marginTop: 20,
  },
  todoTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 10,
    borderRadius: 5,
  },
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskItem: {
    fontSize: 16,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',  // Strike-through text if completed
    color: 'gray',
  },
});

export default TasksScreen;
