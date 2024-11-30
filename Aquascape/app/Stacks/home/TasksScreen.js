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
  Lifestyle: '#90ee90',
  Others: '#d8bfd8',
};

//Calculation of visible weeks
// const getStartOfWeek = (date) => {
//   const d = new Date(date);
//   const day = d.getDay();
//   const diff = d.getDate() - day;
//   return new Date(d.setDate(diff));
// };

// const getEndOfWeek = (date) => {
//   const d = new Date(date);
//   const day = d.getDay();
//   const diff = 6 - day;
//   return new Date(d.setDate(d.getDate() + diff));
// };

// Calculate min and max dates
const getMinMaxDates = () => {
  const minDate = new Date(2024, 9, 1);
  const maxDate = new Date(2024, 11, 31);
  // const currentDate = new Date();
  // const twoWeeksBefore = new Date(currentDate);
  // twoWeeksBefore.setDate(currentDate.getDate() - 14);
  // const minDate = getStartOfWeek(twoWeeksBefore);
  // const oneMonthAfter = new Date(currentDate);
  // oneMonthAfter.setMonth(currentDate.getMonth() + 1);
  // const maxDate = getEndOfWeek(oneMonthAfter);

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
  const categories = ['Work', 'Personal', 'Lifestyle', 'Others'];
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const sheetRef = useRef(null);
  const [selectedTasks, setSelectedTasks] = useState({});
  const { minDate, maxDate } = getMinMaxDates();

  const markedDates = useMemo(() => {
    return {
      [selectedDate]: { selected: true, selectedColor: Colors.primary }
    };
  }, [selectedDate]);

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
    setTasks((prevTasks) => {
      const updatedTasks = {
        ...prevTasks,
        [selectedDate]: [...(prevTasks[selectedDate] || []), newTask],
      };
      return updatedTasks;
    });
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
    setTasks((prevTasks) => {
      const updatedTasksForDate = prevTasks[selectedDate].map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    return { ...prevTasks, [selectedDate]: updatedTasksForDate };
  });
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
          minDate={minDate}
          maxDate={maxDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          disableWeekScroll={true}
          allowSelectionOutOfRange={false}
          pastScrollRange={2}
          futureScrollRange={2}
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
                        onPress={() => navigation.navigate('TimerScreen', { taskTitle: task.title, fromTasks: true })}
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
                            {task.title}
                          </Text>
                          <Text style={styles.taskRecurrence}>
                            {task.recurrence !== 'None' ? task.recurrence : ''}
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
            <Text>No tasks for this day.</Text>
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
    marginBottom: 20,
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
    color: 'black',
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
