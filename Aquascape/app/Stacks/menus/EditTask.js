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
import Colors from '../../../constants/Colors';
import Elements from '../../../constants/Elements';

// Categories and duration options
const categories = ['Work', 'Personal', 'Fitness', 'Study', 'Leisure', 'Other'];
const durationOptions = Array.from({ length: 24 }, (_, i) => (i + 1) * 5);

const EditTask = ({ taskId, tasks, closeBottomSheet, saveUpdatedTask }) => {
  const [taskDetails, setTaskDetails] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [durationModalVisible, setDurationModalVisible] = useState(false);

  // Fetch task details when component mounts or taskId changes
  useEffect(() => {
    if (taskId && tasks) {
      const task = Object.values(tasks).flat().find((t) => t.id === taskId);
      if (task) {
        setTaskDetails(task);
      }
    }
  }, [taskId, tasks]);

  // Update task details in state
  const handleInputChange = (field, value) => {
    setTaskDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (taskDetails) {
      saveUpdatedTask(taskDetails);
      closeBottomSheet();
    }
  };

  if (!taskDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Task</Text>

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
            {taskDetails.duration ? `${taskDetails.duration} minutes` : 'Select Duration'}
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
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {durationOptions.map((durationValue) => (
                <TouchableOpacity
                  key={durationValue}
                  style={[
                    styles.dayButton,
                    taskDetails.duration === durationValue && styles.selectedDayButton,
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
  saveButton: {
    marginTop: 20, // Adjust the margin as needed
  },
});

export default EditTask;
