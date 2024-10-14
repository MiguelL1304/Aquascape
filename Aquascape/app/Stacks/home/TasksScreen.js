import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CheckBox } from 'react-native-elements';
import CalendarStrip from 'react-native-calendar-strip';
import AddTaskScreen from '../AddTaskScreen';

//Styling
import Elements from '../../../constants/Elements';
import Colors from '../../../constants/Colors';
import Icon from 'react-native-vector-icons/Ionicons';

// Category colors
const categoryColors = {
  Work: '#f08080',
  Personal: '#ffb6c1',
  Lifestyle: '#90ee90',
  Others: '#d8bfd8',
};

// Calculation of visible weeks
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

  const twoWeeksBefore = new Date(currentDate);
  twoWeeksBefore.setDate(currentDate.getDate() - 14);
  const minDate = getStartOfWeek(twoWeeksBefore);

  const oneMonthAfter = new Date(currentDate);
  oneMonthAfter.setMonth(currentDate.getMonth() + 1);
  const maxDate = getEndOfWeek(oneMonthAfter);

  return {
    minDate: minDate.toISOString().split('T')[0],
    maxDate: maxDate.toISOString().split('T')[0],
  };
};

const TasksScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const categories = ['Work', 'Personal', 'Lifestyle', 'Others']; // Categories
  const [selectedTasks, setSelectedTasks] = useState({}); // Track selected tasks

  const { minDate, maxDate } = getMinMaxDates();

  // Handler to add a task with the selected category
  const addTask = (newTask) => {
    const updatedTasks = {
      ...tasks,
      [selectedDate]: [
        ...(tasks[selectedDate] || []),
        newTask,
      ],
    };
    setTasks(updatedTasks);
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks[selectedDate].map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks({ ...tasks, [selectedDate]: updatedTasks });
  };

   // Handle task selection
  const toggleSelectTask = (taskId) => {
    setSelectedTasks((prevSelectedTasks) => ({
      ...prevSelectedTasks,
      [taskId]: !prevSelectedTasks[taskId], // Toggle selection
    }));
  };

   // Delete selected tasks
  const deleteSelectedTasks = () => {
    const updatedTasks = tasks[selectedDate].filter((task) => !selectedTasks[task.id]);
    setTasks({ ...tasks, [selectedDate]: updatedTasks });
    setSelectedTasks({}); // Reset selected tasks
  };

  // Toggle calendar view
  const toggleCalendarView = () => {
    setIsExpanded(!isExpanded);
  };

  // Group tasks by category
  const groupTasksByCategory = (tasksForDate) => {
    const grouped = {};
    tasksForDate.forEach(task => {
      if (!grouped[task.category]) {
        grouped[task.category] = [];
      }
      grouped[task.category].push(task);
    });
    return grouped;
  };

  const hasSelectedTasks = Object.keys(selectedTasks).some(taskId => selectedTasks[taskId]);

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
          onDateSelected={(date) => setSelectedDate(new Date(date).toISOString().split('T')[0])}
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

            {/* Button to navigate to the AddTaskScreen */}
           <TouchableOpacity style={[Elements.mainButton, styles.addButton]} 
            onPress={() => navigation.navigate('AddTaskScreen', { selectedDate, addTaskCallback: addTask })}
            >
              <Text style={Elements.mainButtonText}>Create New Task</Text>
            </TouchableOpacity>

            {/* Button to delete selected tasks */}
            <TouchableOpacity style={[Elements.secondaryButton, styles.deleteButton, !hasSelectedTasks && styles.disabledButton]} 
            onPress={hasSelectedTasks ? deleteSelectedTasks: null} // Disable onPress when no tasks are selected
            >
              <Text style={[styles.deleteButtonText, !hasSelectedTasks && styles.disabledButtonText]}>Clear Completed Tasks</Text>
            </TouchableOpacity>

          {/* Display grouped tasks */}
          {tasks[selectedDate] ? (
            <FlatList
              data={Object.entries(groupTasksByCategory(tasks[selectedDate]))}
              renderItem={({ item }) => {
                const [category, tasksForCategory] = item;
                const categoryColor = categoryColors[category]; 
                return (
                  <View>
                    <Text style={[styles.categoryTitle, {color: categoryColor }]}>{category}</Text>
                    {tasksForCategory.map((task) => (
                      <View key={task.id} style={[styles.taskItemContainer,
                        { backgroundColor: categoryColors[task.category] }
                      ]}
                      >
                        <CheckBox
                          checked={selectedTasks[task.id]} // Check if the task is selected
                          onPress={() => toggleSelectTask(task.id)} // Toggle selection on press
                          checkedColor="lightgray"
                          uncheckedColor="white"
                          containerStyle={{ margin: 0, padding: 0 }}
                        />
                        <View style={styles.taskTextContainer}>
                        <Text style={[styles.taskItem, (task.completed || selectedTasks[task.id]) && styles.taskCompleted]}>
                          {task.title}
                        </Text>
                        {/* Display task recurrence */}
                        <Text style={styles.taskRecurrence}>
                          {task.recurrence !== 'None' ? task.recurrence : ''}
                        </Text>
                      </View>
                      </View>
                    ))}
                  </View>
                );
              }}
              keyExtractor={(item) => item[0]} // Use the category as the key for the section
              contentContainerStyle={{ paddingBottom: 100 }}
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
  todoContainer: {
    marginTop: 5,
  },
  todoTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  addButton: {
    padding: 10,
  },
  deleteButton: {
    marginTop: 20,
    marginStart: 185,
    width: '50%',
  },
  deleteButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  disabledButton: {
    borderColor: 'lightgray',
    backgroundColor: 'lightgray',
  },
  disabledButtonText: {
    color: 'white',
  },
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  taskTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'center',
  },
  taskItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: 'lightgray',
  },
  taskRecurrence: {
    fontSize: 12,
    color: 'white',
    fontStyle: 'italic',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
});

export default TasksScreen;
