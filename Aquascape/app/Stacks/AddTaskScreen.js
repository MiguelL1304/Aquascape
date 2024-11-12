// AddTaskScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ActionSheetIOS } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';

//Styling
import Colors from '../../constants/Colors';
import Elements from '../../constants/Elements';

const categories = ['Work', 'Personal', 'Lifestyle', 'Others']; // Categories

const AddTaskScreen = ({ selectedDate, addTaskCallback, closeBottomSheet }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // Default to the first category
  const [shouldReoccur, setShouldReoccur] = useState(null); // Whether the task should reoccur
  const [recurrence, setRecurrence] = useState(null); // Default recurrence
  const [calendarVisible, setCalendarVisible] = useState(false); // State to control calendar visibility
  const [selectedDates, setSelectedDates] = useState({}); // Store selected dates

  const handleAddTask = () => {
    if (!taskTitle.trim()) return; // Prevent empty titles or duration
    const newTask = {
      id: new Date().getTime(), // Unique ID for the task
      title: taskTitle,
      completed: false,
      category: selectedCategory,
      recurrence: shouldReoccur === 'Yes' ? recurrence : 'None',
      selectedDates: shouldReoccur === 'Yes' && recurrence === 'Custom' ? selectedDates : [], // Save selected dates if recurrence is Custom
    };
    addTaskCallback(newTask); // Call the callback to add the task

    // Resets the input fields and pickers
    setTaskTitle('');
    setSelectedCategory(null);
    setShouldReoccur(null);
    setRecurrence(null);
    setSelectedDates({});

    closeBottomSheet(); // Close the bottom sheet 
  };

  const handleCancel = () => {
    // Reset input fields and pickers
    setTaskTitle('');
    setSelectedCategory(null);
    setShouldReoccur(null);
    setRecurrence(null);
    setSelectedDates({});

    closeBottomSheet(); // Close the bottom sheet when cancelled
  };

  const showActionSheet = (options, onSelect) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...options, "Cancel"],
        cancelButtonIndex: options.length,
      },
      (buttonIndex) => {
        if (buttonIndex < options.length) {
          onSelect(options[buttonIndex]);
        }
      }
    );
  };

  // Function to handle date selection
  const handleDayPress = (day) => {
    const newSelectedDates = { ...selectedDates };
    newSelectedDates[day.dateString] = { selected: !newSelectedDates[day.dateString]?.selected, selectedColor: Colors.primary };
    setSelectedDates(newSelectedDates);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={taskTitle}
        onChangeText={setTaskTitle}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Category:</Text>
        {Platform.OS === 'ios' ? (
          <TouchableOpacity
            onPress={() => showActionSheet(categories, setSelectedCategory)}
            style={styles.popupButton}
          >
            <Text>{selectedCategory || "Select a Category..."}</Text>
          </TouchableOpacity>
        ) : (
      <Picker
        style={styles.picker}
        selectedValue={selectedCategory}
        onValueChange={setSelectedCategory}
      >
        <Picker.Item label="Select a Category..." value={null} />
        {categories.map((category) => (
          <Picker.Item key={category} label={category} value={category} />
        ))}
      </Picker>
    )}
  </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Reoccur ?</Text>
        {Platform.OS === 'ios' ? (
          <TouchableOpacity
            onPress={() => showActionSheet(['Never', 'Yes'], setShouldReoccur)}
            style={styles.popupButton}
          >
            <Text>{shouldReoccur || "Never"}</Text>
          </TouchableOpacity>
        ) : (
        <Picker
          style={styles.picker}
          selectedValue={shouldReoccur}
          onValueChange={setShouldReoccur}
          >
            <Picker.Item label='Never' value='Never' />
            <Picker.Item label='Yes' value='Yes' />
          </Picker>
        )}
      </View>

      {shouldReoccur === 'Yes' && (
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Recurrence:</Text>
        {Platform.OS === 'ios' ? (
            <TouchableOpacity
              onPress={() => showActionSheet(['Daily', 'Weekly', 'Monthly', 'Custom'], setRecurrence)}
              style={styles.popupButton}
            >
              <Text>{recurrence || "Select Recurrence..."}</Text>
            </TouchableOpacity>
          ) : (
      <Picker
        style={styles.picker}
        selectedValue={recurrence}
        onValueChange={setRecurrence}
      >
        <Picker.Item label="Select Recurrence..." value={null} />
        <Picker.Item label="Daily" value="Daily" />
        <Picker.Item label="Weekly" value="Weekly" />
        <Picker.Item label="Monthly" value="Monthly" />
        <Picker.Item label="Custom" value="Custom" />
      </Picker>
      )}
    </View>
    )}

      {/* Display Calendar for Custom Recurrence */}
      {recurrence === 'Custom' && shouldReoccur === 'Yes' && (
        <View style={styles.calendarContainer}>
          <Text style={styles.label}>Select Dates:</Text>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={selectedDates}
          />
        </View>
      )}

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
    fontSize: 22,
    marginBottom: 10,
    marginTop: -20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...(Platform.OS === 'ios' && { marginTop: 20 }),
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  picker: {
    flex: 2,
  },
  popupButton: {
    flex: 2,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  calendarContainer: {
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 100,
  },
});

export default AddTaskScreen;
