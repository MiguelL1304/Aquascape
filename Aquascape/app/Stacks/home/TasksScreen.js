import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, 
  TouchableOpacity, ScrollView, Platform, Keyboard } from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import { CheckBox } from 'react-native-elements';
import AddTaskScreen from '../AddTaskScreen';
import BottomSheet from '@gorhom/bottom-sheet';

import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestoreDB } from "../../../firebase/firebase";

//Styling
import Elements from '../../../constants/Elements';
import Colors from '../../../constants/Colors';

// Category colors
const categoryColors = {
  Work: '#f08080',
  Personal: '#ffb6c1',
  Fitness: '#d8bfd8',
  Study: '#90ee90',
  Leisure: '#a7c7e7',
  Other: '#a9a9a9',
};

// Calculate min and max dates
const getMinMaxDates = () => {
  const minDate = new Date(2024, 11, 1);
  const maxDate = new Date(2024, 12, 31);

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
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const sheetRef = useRef(null);
  const [selectedTasks, setSelectedTasks] = useState({});
  const { minDate, maxDate } = getMinMaxDates();

  const markedDates = useMemo(() => {
    const marked = {
      [selectedDate]: { selected: true, selectedColor: Colors.primary }
    };

    // Loop through tasks to mark recurring ones
    Object.keys(tasks).forEach((date) => {
      tasks[date].forEach((task) => {
        if (task.recurrence !== 'None') {
          marked[date] = { ...marked[date], marked: true, dotColor: 'black' };
        }
      });
    });

    return marked;
  }, [selectedDate, tasks]);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  //Firebase

  const fetchTasks = async (month) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const uid = user.uid;
        const tasksDocRef = doc(firestoreDB, "profile", uid, "tasks", month);
        const tasksSnap = await getDoc(tasksDocRef);

        if (tasksSnap.exists()) {
          const tasksData = tasksSnap.data();
          return tasksData; // Tasks grouped by weeks
        } else {
          console.log(`No tasks found for the month ${month}.`);
          return {};
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        throw new Error("Could not fetch tasks.");
      }
    } else {
      throw new Error("User not authenticated.");
    }
  };

  const uploadTasks = async (month, tasksByWeek) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const uid = user.uid;
        const tasksDocRef = doc(firestoreDB, "profile", uid, "tasks", month);

        // Update the tasks in Firestore
        await updateDoc(tasksDocRef, tasksByWeek);

        console.log(`Tasks for ${month} uploaded successfully.`);
      } catch (error) {
        console.error("Error uploading tasks:", error);
        throw new Error("Could not upload tasks.");
      }
    } else {
      throw new Error("User not authenticated.");
    }
  };

  const createTasksForMonthAndNext = async (year, month) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated.");
    }

    const uid = user.uid;

    const formatMonthKey = (year, month) => {
      return `${year}-${String(month).padStart(2, "0")}`; // Format as "YYYY-MM"
    };

    const checkMonth = async (year, month) => {
      const monthKey = formatMonthKey(year, month);
      const monthTasksRef = doc(firestoreDB, "profile", uid, "tasks", monthKey);

      // Check if the document exists
      const monthSnap = await getDoc(monthTasksRef);

      if (!monthSnap.exists()) {
        // Predefined week keys
        const weeksData = {
          "1-7": [],
          "8-14": [],
          "15-21": [],
          "22-28": [],
          "29-end": [],
        };

        // Create the document for the month
        await setDoc(monthTasksRef, weeksData);
        console.log(`Created tasks document for ${monthKey}`);
      } else {
        console.log(`Tasks document for ${monthKey} already exists.`);
      }
    };

    // Check and create the current month
    await checkAndCreateMonth(year, month);

    // Calculate the next month and year
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    // Check and create the next month
    await checkAndCreateMonth(nextYear, nextMonth);
  };





  const addTask = (newTask) => {
    if (!newTask) return;

    const recurrenceDate = new Date(selectedDate);

    if (newTask.recurrence === 'Daily') {
    const dailyDates = [];
    for (let i = 0; i < 60; i++) { // Add tasks for the next 60 days
      const dailyDate = new Date(recurrenceDate);
      dailyDate.setDate(dailyDate.getDate() + i);
      dailyDates.push(dailyDate.toISOString().split('T')[0]);
    }
    dailyDates.forEach((date) => {
      setTasks((prevTasks) => {
        const updatedTasks = {
          ...prevTasks,
          [date]: [...(prevTasks[date] || []), newTask],
        };
        return updatedTasks;
      });
    });
  } 
  else if (newTask.recurrence === 'Weekly') {
    const weeklyDates = [];
    for (let i = 0; i < 5; i++) { // Add tasks for the next 5 weeks
      const weeklyDate = new Date(recurrenceDate);
      weeklyDate.setDate(weeklyDate.getDate() + i * 7);
      weeklyDates.push(weeklyDate.toISOString().split('T')[0]);
    }
    weeklyDates.forEach((date) => {
      setTasks((prevTasks) => {
        const updatedTasks = {
          ...prevTasks,
          [date]: [...(prevTasks[date] || []), newTask],
        };
        return updatedTasks;
      });
    });
  } 
  else if (newTask.recurrence === 'Monthly') {
    const monthlyDates = [];
    for (let i = 0; i < 2; i++) { // Add tasks for the next 2 months
      const nextMonth = new Date(recurrenceDate);
      nextMonth.setMonth(nextMonth.getMonth() + i);
      monthlyDates.push(nextMonth.toISOString().split('T')[0]);
    }
    monthlyDates.forEach((date) => {
      setTasks((prevTasks) => {
        const updatedTasks = {
          ...prevTasks,
          [date]: [...(prevTasks[date] || []), newTask],
        };
        return updatedTasks;
      });
    });
  } 
  else if (newTask.recurrence === 'Custom' && Object.keys(newTask.selectedDates).length > 0) {
    // Custom recurrence
    Object.keys(newTask.selectedDates).forEach((date) => {
      setTasks((prevTasks) => {
        // If the date already has tasks, append the new task, otherwise initialize with an array
        const updatedTasks = {
          ...prevTasks,
          [date]: [...(prevTasks[date] || []), newTask],
        };
        return updatedTasks;
      });
    });
  } 
  else {
    // If no recurrence, add the task to the selected date
    setTasks((prevTasks) => {
      const updatedTasks = {
        ...prevTasks,
        [selectedDate]: [...(prevTasks[selectedDate] || []), newTask],
      };
      return updatedTasks;
    });
  }

  closeBottomSheet(); // Close the bottom sheet after adding the task
};

  const closeBottomSheet = () => {
    if(sheetRef.current) {
      sheetRef.current.close(); // Close the bottom sheet using the ref
    }
    setBottomSheetVisible(false);
  };

  const toggleTaskCompletion = async (taskId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
  
    const taskToUpdate = tasks[selectedDate].find((task) => task.id === taskId);
  
    if (taskToUpdate) {
      const isCompleted = !taskToUpdate.completed; // Toggle completion
  
      // Update tasks locally
      setTasks((prevTasks) => {
        const updatedTasksForDate = prevTasks[selectedDate].map((task) =>
          task.id === taskId ? { ...task, completed: isCompleted } : task
        );
        return { ...prevTasks, [selectedDate]: updatedTasksForDate };
      });
  
      // Update completed tasks count in Firestore
      if (isCompleted) {
        const userProfileRef = doc(firestoreDB, 'profile', userId);
        const userProfileSnap = await getDoc(userProfileRef);
  
        const currentCompletedTasks = userProfileSnap.data()?.completedTasks || 0;
        await updateDoc(userProfileRef, {
          completedTasks: currentCompletedTasks + 1,
        });
      }
    }
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
    <CalendarProvider
      date={selectedDate}
      minDate={minDate}
      maxDate={maxDate}
      onDateChanged={handleDateChange}
    >
    <View style={styles.container}>
      {/* Calendar Container */}
      <View style={styles.calendarContainer}>
        <ExpandableCalendar
          style={styles.calendar}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          disableWeekScroll={true}
          allowSelectionOutOfRange={false}
          pastScrollRange={1}
          futureScrollRange={1}
          theme={{
            todayTextColor: Colors.primary,
            selectedDayBackgroundColor: Colors.primary,
          }}
      />
      </View>

      {/* Tasks List */}
        <View style={styles.todoContainer}>
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
                        key={`${category}-${task.id}`}
                        style={[styles.taskItemContainer, { backgroundColor: categoryColors[task.category] }]}
                        onPress={() => navigation.navigate('TimerScreen', { 
                          taskTitle: task.title, 
                          taskCategory: task.category,
                          taskDuration: task.duration,
                          fromTasks: true })}
                      >
                        <CheckBox
                          checked={selectedTasks[task.id]}
                          onPress={() => toggleSelectTask(task.id)}
                          checkedColor="black"
                          uncheckedColor="white"
                          containerStyle={{ margin: 5, padding: 0 }}
                        />
                        <View style={styles.taskTextContainer}>
                          <Text
                            style={[
                              styles.taskItem,
                              (task.completed || selectedTasks[task.id]) && styles.taskCompleted
                            ]}
                          >
                            {task.title}{' '} 
                            {task.duration ? (
                              <Text style={[
                                styles.taskDuration,
                                (task.completed || selectedTasks[task.id]) && styles.taskDurationSelected
                              ]}
                              >
                              ({task.duration} mins)
                            </Text>
                            ) : (
                              ''
                            )}
                          </Text>
                          <Text style={styles.taskRecurrence}>
                            {task.recurrence !== 'None' && task.recurrence !== 'Never' ? task.recurrence : ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              }}
              keyExtractor={(item) => item[0]}
              contentContainerStyle={{ paddingBottom: 100 }}
              windowSize={5}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
            />
          ) : (
            <Text style={styles.emptyTasksMsg}>
              No tasks for this day.
            </Text>
          )}
        </View>

        {/* Bottom Sheet for AddTaskScreen */}
          <BottomSheet
          ref={sheetRef}
          snapPoints={['1%', '20%', '95%']}
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
      </CalendarProvider>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  calendarContainer: {
    flexDirection: 'column',
    marginTop: 40,
    marginBottom: 30,
    ...(Platform.OS === 'ios' && { marginTop: 80 }),
  },
  calendar: {
    width: '110%',
    alignSelf: 'center',
  },
  todoContainer: {
    marginTop: 5,
    ...(Platform.OS === 'ios' && { marginTop: -10 }),
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
  emptyTasksMsg: {
    textAlign: 'center',
    marginTop: 56,
    fontSize: 48,
    color: 'lightgray', 
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
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: 'black',
  },
  taskRecurrence: {
    fontSize: 12,
    color: 'white',
    fontStyle: 'italic',
  },
  taskDuration: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'white',
  },
  taskDurationSelected: {
    color: 'black',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
});

export default TasksScreen;
