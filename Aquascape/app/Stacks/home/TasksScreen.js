import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, 
  TouchableOpacity, ScrollView, Platform, Keyboard } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CheckBox } from 'react-native-elements';
import CalendarStrip from 'react-native-calendar-strip';
import AddTaskScreen from '../AddTaskScreen';
import BottomSheet from '@gorhom/bottom-sheet';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

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
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = 6 - day;
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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const categories = ['Work', 'Personal', 'Lifestyle', 'Others'];
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const sheetRef = useRef(null);
  const calendarOpacity = useSharedValue(0);
  const stripOpacity = useSharedValue(1); // Strip calendar starts visible
  const stripTranslateY = useSharedValue(0);
  const contentTranslateY = useSharedValue(0);
  const [selectedTasks, setSelectedTasks] = useState({});
  const { minDate, maxDate } = getMinMaxDates();

  const addTask = (newTask) => {
    const updatedTasks = {
      ...tasks,
      [selectedDate]: [...(tasks[selectedDate] || []), newTask],
    };
    setTasks(updatedTasks);

    // Close the bottom sheet after adding the task
    closeBottomSheet();
  };

  const closeBottomSheet = () => {
    if(sheetRef.current) {
      sheetRef.current.close(); // Close the bottom sheet using the ref
    }
    setBottomSheetVisible(false);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks[selectedDate].map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks({ ...tasks, [selectedDate]: updatedTasks });
  };

  const toggleSelectTask = (taskId) => {
    setSelectedTasks((prevSelectedTasks) => ({
      ...prevSelectedTasks,
      [taskId]: !prevSelectedTasks[taskId],
    }));
  };

  const deleteSelectedTasks = () => {
    const updatedTasks = tasks[selectedDate].filter(
      (task) => !selectedTasks[task.id]
    );
    setTasks({ ...tasks, [selectedDate]: updatedTasks });
    setSelectedTasks({});
  };

  useEffect(() => {
    stripOpacity.value = withTiming(1, { duration: 300 });
    stripTranslateY.value = withTiming(-350, { duration: 300 });
    contentTranslateY.value = withTiming(-300, { duration: 300 });
  }, []);

  const toggleCalendarView = () => {
    const nextValue = !isExpanded;
    setIsExpanded(nextValue);

    if (nextValue) {
      // Expand full calendar and hide strip
      calendarOpacity.value = withTiming(1, {duration: 300 });
      stripOpacity.value = withTiming(0, {duration: 300 });
      contentTranslateY.value = withTiming(0, { duration: 300 });
    } else {
      // Collapse full calendar and show strip
      calendarOpacity.value = withTiming(0, { duration: 300 });
      stripOpacity.value = withTiming(1, { duration: 300 });
      stripTranslateY.value = withTiming(-350, { duration: 300 });
      contentTranslateY.value = withTiming(-300, { duration: 300 });
    }
  };

  const calendarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: calendarOpacity.value,
  }));

  const stripAnimatedStyle = useAnimatedStyle(() => ({
    opacity: stripOpacity.value,
    transform: [{ translateY: stripTranslateY.value }], 
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const groupTasksByCategory = (tasksForDate) => {
    const grouped = {};
    tasksForDate.forEach((task) => {
      if (!grouped[task.category]) grouped[task.category] = [];
      grouped[task.category].push(task);
    });
    return grouped;
  };

  const hasSelectedTasks = Object.keys(selectedTasks).some(
    (taskId) => selectedTasks[taskId]
  );

  return (
    <View style={styles.container}>
      {/* Calendar Container */}
      <View style={styles.calendarContainer}>
        {/* Full Calendar */}
      <Animated.View style={[styles.fullCalendar, calendarAnimatedStyle]}>
        <Calendar
          style={styles.calendar}
          minDate={minDate}
          maxDate={maxDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: Colors.primary } }}
        />
      </Animated.View>

      {/* Calendar Strip */}
      <Animated.View style={[styles.calendarStrip, stripAnimatedStyle]}>
        <CalendarStrip
          style={styles.calendarStrip}
          selectedDate={selectedDate}
          onDateSelected={(date) => setSelectedDate(new Date(date).toISOString().split('T')[0])}
          scrollable
          minDate={minDate}
          maxDate={maxDate}
          markedDates={[
            {
              date: selectedDate,
              dots: [{ color: Colors.primary, selectedColor: Colors.primary }]
            }
          ]}
          daySelectionAnimation={{
            type: 'background',
            duration: 200,
            highlightColor: Colors.primary,
          }}
        />
      </Animated.View>
      </View>

      {/* Tasks List */}
        <Animated.View style={[styles.todoContainer, contentAnimatedStyle]}>
      
          <TouchableOpacity
            onPress={toggleCalendarView}
            style={styles.toggleButton}
          > 
            <Icon
              name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={24}
          />
        </TouchableOpacity>

          <TouchableOpacity
            style={[Elements.mainButton, styles.addButton]}
            onPress={() => sheetRef.current?.expand()}
          >
            <Text style={Elements.mainButtonText}>Create New Task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              Elements.secondaryButton,
              styles.deleteButton,
              !hasSelectedTasks && styles.disabledButton
            ]}
            onPress={hasSelectedTasks ? deleteSelectedTasks : null}
          >
            <Text
              style={[
                styles.deleteButtonText,
                !hasSelectedTasks && styles.disabledButtonText
              ]}
            >
              Clear Completed Tasks
            </Text>
          </TouchableOpacity>

          <Text style={styles.todoTitle}>Tasks for {selectedDate}:</Text>

          {/* Task Categories */}
          {tasks[selectedDate] && tasks[selectedDate].length > 0 ? (
            <FlatList
              data={Object.entries(groupTasksByCategory(tasks[selectedDate]))}
              renderItem={({ item }) => {
                const [category, tasksForCategory] = item;
                const categoryColor = categoryColors[category];
                return (
                  <View>
                    <Text
                      style={[styles.categoryTitle, { color: categoryColor }]}
                    >
                      {category}
                    </Text>
                    {tasksForCategory.map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        style={[
                          styles.taskItemContainer,
                          { backgroundColor: categoryColors[task.category] }
                        ]}
                        onPress={() =>
                          navigation.navigate('TimerScreen', {
                            taskTitle: task.title,
                            fromTasks: true
                          })
                        }
                      >
                        <CheckBox
                          checked={selectedTasks[task.id]}
                          onPress={() => toggleSelectTask(task.id)}
                          checkedColor="lightgray"
                          uncheckedColor="white"
                          containerStyle={{ margin: 0, padding: 0 }}
                        />
                        <View style={styles.taskTextContainer}>
                          <Text
                            style={[
                              styles.taskItem,
                              (task.completed ||
                                selectedTasks[task.id]) &&
                                styles.taskCompleted
                            ]}
                          >
                            {task.title}
                          </Text>
                          <Text style={styles.taskRecurrence}>
                            {task.recurrence !== 'None'
                              ? task.recurrence
                              : ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              }}
              keyExtractor={(item) => item[0]}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          ) : (
            <Text>No tasks for this day.</Text>
          )}
        </Animated.View>

        {/* Bottom Sheet for AddTaskScreen */}
          <BottomSheet
          ref={sheetRef}
          snapPoints={['1%', '50%', '95%']}
          enablePanDownToClose
          onClose={() => {
            Keyboard.dismiss(); // Hide keyboard when bottom sheet closes by dragging
            setBottomSheetVisible(false);
          }}
        >
          <ScrollView>
          <AddTaskScreen
            selectedDate={selectedDate}
            addTaskCallback={addTask}
            closeBottomSheet={closeBottomSheet} // Use closeBottomSheet to close the sheet and dismiss keyboard
            />
            </ScrollView>
          </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  calendarContainer: {
    height: 310, 
    position: 'relative',
    marginBottom: 30,
    ...(Platform.OS === 'ios' && { marginTop: 30 }),
  },
  fullCalendar: {
    paddingBottom: 10,
    marginTop: 30,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'ios' && { marginTop: 50 }),
  },
  calendarStrip: {
    height: 100,
    paddingBottom: 10,
    ...(Platform.OS === 'ios' && { marginTop: 5 }),
  },
  toggleButton: {
    alignSelf: 'baseline',
    marginTop: 50,
    marginBottom: 10,
    ...(Platform.OS === 'ios' && { marginTop: 40 }),
  },
  todoContainer: {
    marginTop: 5,
    ...(Platform.OS === 'ios' && { marginTop: 30 }),
  },
  todoTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  addButton: {
    padding: 10,
  },
  deleteButton: {
    marginTop: 10,
    marginStart: 185,
    width: '50%',
    ...(Platform.OS === 'ios' && { marginStart: 175, width: '55%' }),
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
