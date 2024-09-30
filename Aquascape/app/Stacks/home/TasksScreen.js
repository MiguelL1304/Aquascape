import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CheckBox } from 'react-native-elements';
import CalendarStrip from 'react-native-calendar-strip';

//Styling
import Elements from '../../../constants/Elements';
import Colors from '../../../constants/Colors';
import Icon from 'react-native-vector-icons/Ionicons';

//Calculation of visable weeks
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;  // Subtract the current day to get back to Sunday
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = 6 - day;  // Calculate days to Saturday
  return new Date(d.setDate(d.getDate() + diff));
};

// Calculate min and max dates
const getMinMaxDates = () => {
  const currentDate = new Date();

  // Calculate 2 weeks before the current day
  const twoWeeksBefore = new Date(currentDate);
  twoWeeksBefore.setDate(currentDate.getDate() - 14);
  const minDate = getStartOfWeek(twoWeeksBefore);  // Start of the week for 2 weeks before

  // Calculate 1 month after the current day
  const oneMonthAfter = new Date(currentDate);
  oneMonthAfter.setMonth(currentDate.getMonth() + 1);
  const maxDate = getEndOfWeek(oneMonthAfter);  // End of the week for 1 month after

  // Return the dates as formatted strings
  return {
    minDate: minDate.toISOString().split('T')[0],
    maxDate: maxDate.toISOString().split('T')[0],
  };
};

const TasksScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState({});  // Store tasks for different dates
  const [newTask, setNewTask] = useState('');  // Store the new task input
  const [isExpanded, setIsExpanded] = useState(false);

  const { minDate, maxDate } = getMinMaxDates();

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

  // Toggle the calendar view
  const toggleCalendarView = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>

      {/* Conditionally Render CalendarStrip or Calendar */}
      {isExpanded ? (
        <Calendar
          style={{ paddingBottom: 10, marginTop: 30 }}
          minDate={minDate}
          maxDate={maxDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: Colors.primary }
          }}
        />
      ) : (
        <CalendarStrip
          style={{ height: 100, paddingTop: 20, paddingBottom: 10 }}
          selectedDate={selectedDate}
          onDateSelected={(date) => setSelectedDate(new Date(date).toISOString().split('T')[0])}  // Format selected date correctly
          scrollable
          minDate={minDate}
          maxDate={maxDate}
          markedDates={[
            {
              date: selectedDate,
              dots: [{ color: Colors.primary, selectedColor: Colors.primary }],
            },
          ]}
          daySelectionAnimation={{
            type: 'background',
            duration: 200,
            highlightColor: Colors.primary,
          }}
        />
      )}

      {/* Toggle Button to Expand/Collapse Calendar */}
      <TouchableOpacity onPress={toggleCalendarView} style={styles.toggleButton}>
        <Icon name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} />
      </TouchableOpacity>  

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
            <TouchableOpacity style={[Elements.mainButton, styles.button]} onPress={addTask}>
                <Text style={Elements.mainButtonText}>Add Task</Text>
            </TouchableOpacity>
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
    marginTop: 10,
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
