import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Modal, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';

// Styling
import Colors from '../../constants/Colors';
import Elements from '../../constants/Elements';

const categories = ['Work', 'Personal', 'Fitness', 'Study', 'Leisure', 'Other'];
const durationOptions = Array.from({ length: 24 }, (_, i) => (i + 1) * 5);

const daysOfWeek = [
  { label: 'Sunday', value: 'Sunday' },
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' },
  { label: 'Saturday', value: 'Saturday' },
  { label: 'None', value: 'None' },
];

const AddTaskScreen = ({ selectedDate, addTaskCallback, closeBottomSheet }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recurrence, setRecurrence] = useState([]);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});
  const [duration, setDuration] = useState(null);
  const [recurrenceModalVisible, setRecurrenceModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [durationModalVisible, setDurationModalVisible] = useState(false);

  const handleAddTask = () => {

    if (!taskTitle.trim()) {
      Alert.alert('Missing Input', 'Please enter a title for the task.');
      return;
    }
  
    if (!selectedCategory) {
      Alert.alert('Missing Input', 'Please select a category for the task.');
      return;
    }
  
    if (!duration) {
      Alert.alert('Missing Input', 'Please select a duration for the task.');
      return;
    }
  
    if (recurrence.length === 0) {
      Alert.alert('Missing Input', 'Please select a recurrence for the task.');
      return;
    }

    // const localDate = new Date(selectedDate);
    // const adjustedDate = new Date(
    //   localDate.getFullYear(),
    //   localDate.getMonth(),
    //   localDate.getDate()
    // );
    // const formattedDate = adjustedDate.toISOString().split('T')[0];

    const newTask = {
      id: new Date().getTime(),
      title: taskTitle,
      completed: false,
      category: selectedCategory,
      recurrence: recurrence,
      date: selectedDate,
      duration: duration,
    };

    addTaskCallback(newTask);

    // Reset fields
    setTaskTitle('');
    setSelectedCategory(null);
    setRecurrence([]);
    setSelectedDates({});
    setDuration(null);

    closeBottomSheet();
  };

  const handleCancel = () => {
    setTaskTitle('');
    setSelectedCategory(null);
    setRecurrence([]);
    setSelectedDates({});
    setDuration(null);

    closeBottomSheet();
  };

  const toggleDaySelection = (day) => {
    if (day === 'None') {
      // If "None" is selected, clear all other options and only select "None"
      setRecurrence(['None']);
    } else {
      // If a day other than "None" is selected
      if (recurrence.includes('None')) {
        // Remove "None" if it was previously selected
        setRecurrence([day]);
      } else if (recurrence.includes(day)) {
        // Toggle off the selected day
        setRecurrence(recurrence.filter((d) => d !== day));
      } else {
        // Add the selected day
        setRecurrence([...recurrence, day]);
      }
    }
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
        <TouchableOpacity
          onPress={() => setCategoryModalVisible(true)} // Opens the category modal
          style={styles.popupButton}
        >
          <Text>{selectedCategory || 'Select a Category'}</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Recurrence:</Text>
        <TouchableOpacity
          onPress={() => setRecurrenceModalVisible(true)}
          style={styles.popupButton}
        >
          <Text>{recurrence.length > 0 ? recurrence.join(', ') : 'Select Recurrence Days'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Duration:</Text>
        <TouchableOpacity
          onPress={() => setDurationModalVisible(true)}
          style={styles.popupButton}
        >
          <Text>{duration === null ? 'Select Duration' : `${duration} minutes`}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={Elements.mainButton} onPress={handleAddTask}>
          <Text style={Elements.mainButtonText}>Add Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={Elements.secondaryButton} onPress={handleCancel}>
          <Text style={Elements.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Recurrence Selection */}
      <Modal visible={recurrenceModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Recurrence Days</Text>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day.value}
                style={[
                  styles.dayButton,
                  recurrence.includes(day.value) && styles.selectedDayButton,
                ]}
                onPress={() => toggleDaySelection(day.value)}
              >
                <Text
                  style={[
                    styles.dayText,
                    recurrence.includes(day.value) && styles.selectedDayText,
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={Elements.mainButton}
              onPress={() => setRecurrenceModalVisible(false)}
            >
              <Text style={Elements.mainButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Category Selection */}
      <Modal visible={categoryModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select a Category</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.dayButton,
                  selectedCategory === category && styles.selectedDayButton,
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                }}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedCategory === category && styles.selectedDayText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={Elements.mainButton}
              onPress={() => setCategoryModalVisible(false)} // Close category modal
            >
              <Text style={Elements.mainButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Duration Selection */}
      <Modal visible={durationModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Duration</Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {durationOptions.map((durationValue) => (
                <TouchableOpacity
                  key={durationValue}
                  style={[
                    styles.dayButton, // Reusing styles.dayButton to ensure consistency
                    duration === durationValue && styles.selectedDayButton,
                  ]}
                  onPress={() => setDuration(durationValue)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      duration === durationValue && styles.selectedDayText,
                    ]}
                  >
                    {`${durationValue} minutes`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={Elements.mainButton}
              onPress={() => setDurationModalVisible(false)}
            >
              <Text style={Elements.mainButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>





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
    marginTop: 20,
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
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dayButton: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedDayButton: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  scrollContent: {
    alignItems: 'center',
  },
  optionButton: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedOptionButton: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
});

export default AddTaskScreen;
