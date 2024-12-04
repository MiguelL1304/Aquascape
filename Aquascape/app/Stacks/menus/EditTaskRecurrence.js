import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestoreDB } from '../../../firebase/firebase';
import Colors from '../../../constants/Colors';
import Elements from '../../../constants/Elements';

// Categories, duration, and recurrence options
const categories = ['Work', 'Personal', 'Fitness', 'Study', 'Leisure', 'Other'];
const durationOptions = Array.from({ length: 24 }, (_, i) => (i + 1) * 5);
const recurrenceOptions = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const EditTaskRecurrence = ({ recurrence, closeBottomSheet, initializeScreen }) => {
  const [taskDetails, setTaskDetails] = useState(recurrence || {});
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [recurrenceModalVisible, setRecurrenceModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (recurrence) {
      setTaskDetails(recurrence);
    }
  }, [recurrence]);

  // Update task details in state
  const handleInputChange = (field, value) => {
    setTaskDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  // Toggle recurrence selection
  const toggleRecurrenceSelection = (day) => {
    setTaskDetails((prevDetails) => {
      const currentRecurrence = prevDetails.recurrence || [];
      const isSelected = currentRecurrence.includes(day);

      return {
        ...prevDetails,
        recurrence: isSelected
          ? currentRecurrence.filter((d) => d !== day) // Remove day
          : [...currentRecurrence, day], // Add day
      };
    });
  };

  // Validate fields before saving
  const validateFields = () => {
    if (!taskDetails.title || taskDetails.title.trim() === '') {
      setErrorMessage('Task title cannot be empty.');
      return false;
    }

    if (!taskDetails.category) {
      setErrorMessage('Please select a category.');
      return false;
    }

    if (!taskDetails.duration) {
      setErrorMessage('Please select a duration.');
      return false;
    }

    if (!taskDetails.recurrence || taskDetails.recurrence.length === 0) {
      setErrorMessage('Please select at least one day for recurrence.');
      return false;
    }

    setErrorMessage(''); // Clear any existing error messages
    return true;
  };

  // Save the updated recurrence details to Firestore
  const handleSave = async () => {
    if (!validateFields()) return; // Validate fields before proceeding

    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated.');
      return;
    }

    try {
      const uid = user.uid;
      const recurrenceDocRef = doc(firestoreDB, 'profile', uid, 'tasks', 'recurrence');
      const recurrenceSnap = await getDoc(recurrenceDocRef);

      if (recurrenceSnap.exists()) {
        const data = recurrenceSnap.data();

        // Sanitize taskDetails to include only necessary fields
        const sanitizedTaskDetails = {
            category: taskDetails.category,
            duration: taskDetails.duration,
            recurrence: taskDetails.recurrence,
            recurrenceID: taskDetails.recurrenceID,
            title: taskDetails.title,
        };

        const updatedTasks = data.tasks.map((task) =>
            task.recurrenceID === sanitizedTaskDetails.recurrenceID ? sanitizedTaskDetails : task
        );

        await updateDoc(recurrenceDocRef, { tasks: updatedTasks });
        console.log("Recurrence updated successfully.");

        // Update all recurring tasks for the current and next month
        await updateAllRecurringTasks(taskDetails.recurrenceID, sanitizedTaskDetails);

        closeBottomSheet();
        await initializeScreen();
      }
    } catch (error) {
      console.error('Error updating recurrence:', error);
    }
  };

  // Delete the recurrence entry
  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated.');
      return;
    }

    try {
      const uid = user.uid;
      const recurrenceDocRef = doc(firestoreDB, 'profile', uid, 'tasks', 'recurrence');
      const recurrenceSnap = await getDoc(recurrenceDocRef);

      if (recurrenceSnap.exists()) {
        const data = recurrenceSnap.data();
        const updatedTasks = data.tasks.filter(
          (task) => task.recurrenceID !== taskDetails.recurrenceID
        );

        await updateDoc(recurrenceDocRef, { tasks: updatedTasks });
        console.log('Recurrence deleted successfully.');

        // Delete all recurring tasks for the current and next month
        await deleteAllRecurringTasks(taskDetails.recurrenceID);

        setDeleteModalVisible(false);
        closeBottomSheet();
        await initializeScreen();
      }
    } catch (error) {
      console.error('Error deleting recurrence:', error);
    }
  };

  const getMonthKeys = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
  
    const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    const nextMonthKey = currentMonth === 12
      ? `${currentYear + 1}-01`
      : `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  
    return [currentMonthKey, nextMonthKey];
  };

  const updateAllRecurringTasks = async (recurrenceID, updatedDetails) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
  
    try {
      const uid = user.uid;
      const [currentMonthKey, nextMonthKey] = getMonthKeys();
  
      for (const monthKey of [currentMonthKey, nextMonthKey]) {
        const tasksDocRef = doc(firestoreDB, "profile", uid, "tasks", monthKey);
        const tasksSnap = await getDoc(tasksDocRef);
  
        if (!tasksSnap.exists()) {
          console.log(`No tasks found for month ${monthKey}.`);
          continue;
        }
  
        const tasksData = tasksSnap.data();
        for (const [weekTag, tasks] of Object.entries(tasksData)) {
          const updatedTasks = tasks.map((task) =>
            task.recurrenceID === recurrenceID
              ? { ...task, ...updatedDetails } // Update matching tasks
              : task
          );
  
          // Update Firestore for the specific week
          await updateDoc(tasksDocRef, { [weekTag]: updatedTasks });
        }
      }
  
      console.log("Recurring tasks updated successfully for current and next month.");
    } catch (error) {
      console.error("Error updating recurring tasks:", error);
    }
  };

  const deleteAllRecurringTasks = async (recurrenceID) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
  
    try {
      const uid = user.uid;
      const [currentMonthKey, nextMonthKey] = getMonthKeys();
  
      for (const monthKey of [currentMonthKey, nextMonthKey]) {
        const tasksDocRef = doc(firestoreDB, "profile", uid, "tasks", monthKey);
        const tasksSnap = await getDoc(tasksDocRef);
  
        if (!tasksSnap.exists()) {
          console.log(`No tasks found for month ${monthKey}.`);
          continue;
        }
  
        const tasksData = tasksSnap.data();
        for (const [weekTag, tasks] of Object.entries(tasksData)) {
          const updatedTasks = tasks.filter(
            (task) => task.recurrenceID !== recurrenceID // Exclude matching tasks
          );
  
          // Update Firestore for the specific week
          await updateDoc(tasksDocRef, { [weekTag]: updatedTasks });
        }
      }
  
      console.log("Recurring tasks deleted successfully for current and next month.");
    } catch (error) {
      console.error("Error deleting recurring tasks:", error);
    }
  };
  
  
  
  

  if (!taskDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading recurrence details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Recurrence</Text>

      {/* Error Message */}
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

      {/* Title Input */}
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={taskDetails.title}
        onChangeText={(text) => handleInputChange('title', text)}
      />

      {/* Category Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Category:</Text>
        <TouchableOpacity
          onPress={() => setCategoryModalVisible(true)}
          style={styles.popupButton}
        >
          <Text>{taskDetails.category || 'Select a Category'}</Text>
        </TouchableOpacity>
      </View>

      {/* Duration Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Duration:</Text>
        <TouchableOpacity
          onPress={() => setDurationModalVisible(true)}
          style={styles.popupButton}
        >
          <Text>
            {taskDetails.duration
              ? `${taskDetails.duration} minutes`
              : 'Select Duration'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recurrence Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Recurrence:</Text>
        <TouchableOpacity
          onPress={() => setRecurrenceModalVisible(true)}
          style={styles.popupButton}
        >
          <Text>
            {taskDetails.recurrence && taskDetails.recurrence.length > 0
              ? taskDetails.recurrence.join(', ')
              : 'Select Recurrence Days'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[Elements.mainButton, styles.saveButton]}
        onPress={handleSave}
      >
        <Text style={Elements.mainButtonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity
        style={[Elements.secondaryButton, styles.deleteButton]}
        onPress={() => setDeleteModalVisible(true)}
      >
        <Text style={[Elements.secondaryButtonText, styles.deleteButtonText]}>Delete</Text>
      </TouchableOpacity>



    
      {/* Modals for Category, Duration, and Recurrence */}
      {/* Category Modal */}
      <Modal visible={categoryModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select a Category</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.dayButton,
                  taskDetails.category === category && styles.selectedDayButton,
                ]}
                onPress={() => {
                  handleInputChange('category', category);
                  setCategoryModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dayText,
                    taskDetails.category === category && styles.selectedDayText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={Elements.mainButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={Elements.mainButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Duration Modal */}
      <Modal visible={durationModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Duration</Text>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              {durationOptions.map((durationValue) => (
                <TouchableOpacity
                  key={durationValue}
                  style={[
                    styles.dayButton,
                    taskDetails.duration === durationValue &&
                      styles.selectedDayButton,
                  ]}
                  onPress={() => {
                    handleInputChange('duration', durationValue);
                    setDurationModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dayText,
                      taskDetails.duration === durationValue && styles.selectedDayText,
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

      {/* Recurrence Modal */}
      <Modal visible={recurrenceModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Recurrence Days</Text>
            {recurrenceOptions.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  taskDetails.recurrence?.includes(day) && styles.selectedDayButton,
                ]}
                onPress={() => toggleRecurrenceSelection(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    taskDetails.recurrence?.includes(day) && styles.selectedDayText,
                  ]}
                >
                  {day}
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
        

      {/* Delete Modal */}
      <Modal visible={deleteModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
                Are you sure you want to delete this recurrence?
            </Text>
            <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                style={[Elements.mainButton, styles.modalButton]}
                onPress={handleDelete}
                >
                <Text style={Elements.mainButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[Elements.secondaryButton, styles.modalButton]}
                onPress={() => setDeleteModalVisible(false)}
                >
                <Text style={Elements.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.background,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
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
  popupButton: {
    flex: 2,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  deleteButton: {
    marginTop: 5,
    borderWidth: 0,
  },
  deleteButtonText: {
    color: '#e8594f',
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
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
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
  saveButton: {
    marginTop: 20,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
  },
});

export default EditTaskRecurrence;
