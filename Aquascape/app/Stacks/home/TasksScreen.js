import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, 
  TouchableOpacity, ScrollView, Platform, Keyboard } from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import { CheckBox } from 'react-native-elements';
import AddTaskScreen from '../AddTaskScreen';
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFocusEffect } from '@react-navigation/native';

import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
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
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return localDate.toISOString().split('T')[0];
  });
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const bottomSheetRef = useRef(null);
  const sheetRef = useRef(null);
  const [selectedTasks, setSelectedTasks] = useState({});
  const { minDate, maxDate } = getMinMaxDates();

  useEffect(() => {
    console.log('Initial selectedDate:', selectedDate);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const initializeScreen = async () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // Months are 0-indexed in JavaScript
  
        try {
          // Ensure tasks for the current and next month exist
          await createTasksForMonthAndNext(currentYear, currentMonth);
  
          // Fetch tasks for the current and next month to populate the calendar
          await fetchTasksForCurrentAndNextMonth();
        } catch (error) {
          console.error("Error initializing screen:", error);
        }
      };
  
      initializeScreen();
    }, [])
  );

  const markedDates = useMemo(() => {
    const marked = {
      [selectedDate]: { selected: true, selectedColor: Colors.primary }, // Mark the selected date
    };
  
    // Loop through all tasks and mark their dates
    Object.keys(tasks).forEach((date) => {
      if (!marked[date]) {
        marked[date] = { marked: true, dotColor: 'black' }; // Mark the date with a dot
      }
    });
  
    return marked;
  }, [selectedDate, tasks]);

  const handleDateChange = useCallback((date) => {
    console.log('Date changed to:', date);
    setSelectedDate(date);
  }, []);

  //Firebase

  const fetchTasksForCurrentAndNextMonth = async () => {
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
  
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1; // Months are 0-indexed in JavaScript
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

      const uid = user.uid;
  
      // Helper function to format month keys
      const formatMonthKey = (year, month) => `${year}-${String(month).padStart(2, "0")}`;
  
      // Fetch tasks for a specific month
      const fetchTasksByMonth = async (year, month) => {
        const monthKey = formatMonthKey(year, month);
        const tasksDocRef = doc(firestoreDB, "profile", uid, "tasks", monthKey);
        const tasksSnap = await getDoc(tasksDocRef);
  
        if (tasksSnap.exists()) {
          return tasksSnap.data();
        } else {
          console.log(`No tasks found for the month ${monthKey}.`);
          return {};
        }
      };
  
      // Fetch tasks for current and next month
      const currentMonthTasks = await fetchTasksByMonth(currentYear, currentMonth);
      const nextMonthTasks = await fetchTasksByMonth(nextYear, nextMonth);
  
      // Combine and process tasks
      const allTasks = {};

      Object.entries(currentMonthTasks).forEach(([weekTag, tasks]) => {
        allTasks[weekTag] = [...(allTasks[weekTag] || []), ...tasks];
      });

      Object.entries(nextMonthTasks).forEach(([weekTag, tasks]) => {
        allTasks[weekTag] = [...(allTasks[weekTag] || []), ...tasks];
      });

      // Log the merged tasks for debugging
      //console.log("Merged allTasks:", JSON.stringify(allTasks, null, 2));
  
      setTasks(() => {
        const updatedTasks = {};
      
        for (const weekTag in allTasks) {
          const weekTasks = allTasks[weekTag]; // Array of tasks for the current weekTag
      
          // Iterate over each task in the current week's array
          for (const task of weekTasks) {
            const taskDate = task.date;
      
            if (!updatedTasks[taskDate]) {
              updatedTasks[taskDate] = [];
            }
      
            const isDuplicate = updatedTasks[taskDate].some(
              (existingTask) => existingTask.id === task.id
            );
            if (!isDuplicate) {
              updatedTasks[taskDate].push(task);
            }
          }
        }

        console.log("Updated Tasks:", updatedTasks);
      
        return updatedTasks;
      });
      
  
        
      
  
      console.log("Fetched and updated tasks successfully.");
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  
  
  

  const uploadTasks = async (monthKey, weekTag, tasksToUpload) => {
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
  
    try {
      const uid = user.uid;
      const tasksDocRef = doc(firestoreDB, "profile", uid, "tasks", monthKey);
  
      // Add tasks to the specific week array in Firestore
      await updateDoc(tasksDocRef, {
        [weekTag]: arrayUnion(...tasksToUpload),
      });
  
      console.log(`Tasks for week ${weekTag} uploaded successfully.`);
    } catch (error) {
      console.error("Error uploading tasks:", error);
      throw new Error("Could not upload tasks.");
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
    await checkMonth(year, month);

    // Calculate the next month and year
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    // Check and create the next month
    await checkMonth(nextYear, nextMonth);
  };


  //
  //
  /// Creating Task
  //
  //

  const daysOfWeek = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
  ];
  
  const addTask = async (newTask) => {
    if (!newTask) return;
  
    console.log(newTask.recurrence);
  
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
  
    if (newTask.recurrence == "None" || !newTask.recurrence.length) {
      // Handle non-recurring tasks
      const updatedTasks = {
        ...tasks,
        [selectedDate]: [...(tasks[selectedDate] || []), newTask],
      };
  
      setTasks(updatedTasks); // Update local tasks state
      console.log("Added task for:", selectedDate, newTask);
      console.log(tasks);
  
      const day = parseInt(newTask.date.split("-")[2], 10);
      const weekTag =
        day <= 7
          ? "1-7"
          : day <= 14
          ? "8-14"
          : day <= 21
          ? "15-21"
          : day <= 28
          ? "22-28"
          : "29-end";
  
      const monthKey = newTask.date.substring(0, 7);
  
      const tasksToUpload = Array.isArray(newTask) ? newTask : [newTask];
  
      try {
        await uploadTasks(monthKey, weekTag, tasksToUpload);
        console.log(`Task uploaded successfully for date: ${newTask.date}`);
      } catch (error) {
        console.error("Error uploading task:", error);
      }
    } else {
      // Handle recurring tasks
      const recurrenceDays = newTask.recurrence.map((day) =>
        daysOfWeek.find((d) => d.label === day)?.value
      );
  
      const recurrenceDate = new Date(); 
      const startDate = new Date(recurrenceDate.getFullYear(), recurrenceDate.getMonth(), recurrenceDate.getDate());
        
      let endDate;
      if (startDate.getMonth() === 11) {
        // If December, set endDate to the last day of January of the next year
        endDate = new Date(new Date().getFullYear() + 1, 0, 31);// January 31st of next year
      } else {
        // Otherwise, set endDate to the last day of next month
        const nextMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 2, 0);
        endDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0); // End of next month
      }
  
      console.log("Task Range:", { startDate, endDate });
  
      // Generate recurring dates
      const recurringDates = [];
      for (
        let currentDate = new Date(startDate);
        currentDate <= endDate;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        const currentDay = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
        });
        if (recurrenceDays.includes(currentDay)) {
          recurringDates.push(
            new Date(currentDate).toISOString().split("T")[0]
          );
        }
      }
  
      console.log("Recurring Dates:", recurringDates);
  
      // Update the local tasks state for the calendar view
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
  
        recurringDates.forEach((date) => {
          if (!updatedTasks[date]) updatedTasks[date] = [];
          updatedTasks[date].push(newTask);
        });
  
        return updatedTasks;
      });
      
      // Group and upload tasks by month and week
      const tasksByMonthAndWeek = recurringDates.reduce((acc, date) => {
        const [year, month, day] = date.split("-");
        const monthKey = `${year}-${month}`;
        const weekTag =
          parseInt(day, 10) <= 7
            ? "1-7"
            : parseInt(day, 10) <= 14
            ? "8-14"
            : parseInt(day, 10) <= 21
            ? "15-21"
            : parseInt(day, 10) <= 28
            ? "22-28"
            : "29-end";
  
        if (!acc[monthKey]) acc[monthKey] = {};
        if (!acc[monthKey][weekTag]) acc[monthKey][weekTag] = [];
  
        acc[monthKey][weekTag].push({ ...newTask, date });
  
        return acc;
      }, {});
  
      try {
        for (const [monthKey, weeks] of Object.entries(tasksByMonthAndWeek)) {
          for (const [weekTag, tasksForWeek] of Object.entries(weeks)) {
            await uploadTasks(monthKey, weekTag, tasksForWeek);
            console.log(
              `Recurring tasks uploaded successfully for month: ${monthKey}, week: ${weekTag}`
            );
          }
        }
      } catch (error) {
        console.error("Error uploading recurring tasks:", error);
      }
    }
  
    closeBottomSheet(); // Close the bottom sheet after adding the task
  };
  
  

  const closeBottomSheet = () => {
    bottomSheetRef.current?.dismiss()
  };

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
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
    <BottomSheetModalProvider>
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
          firstDay={1}
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
            onPress={openBottomSheet}
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
              // windowSize={5}
              // initialNumToRender={5}
              // maxToRenderPerBatch={5}
              showsVerticalScrollIndicator={true} // Enables the scroll indicator
              nestedScrollEnabled={true}
              scrollEnabled={true}
            />
          ) : (
            <Text style={styles.emptyTasksMsg}>
              No tasks for this day.
            </Text>
          )}
          
        </View>

          {/* Bottom Sheet for Adding Tasks */}
          <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={["75%"]}
            backgroundStyle={{ backgroundColor: Colors.background }}
            onDismiss={closeBottomSheet}
          >
            <ScrollView>
              <AddTaskScreen
                selectedDate={selectedDate}
                addTaskCallback={addTask}
                closeBottomSheet={closeBottomSheet}
              />
            </ScrollView>
          </BottomSheetModal>
        </View>
      </CalendarProvider>
      </BottomSheetModalProvider>
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
    flex: 1,
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
