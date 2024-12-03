import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../../constants/Colors';
import Elements from '../../../constants/Elements';

const EditTask = ({ taskId, tasks, closeBottomSheet, saveUpdatedTask }) => {
    const [taskDetails, setTaskDetails] = useState(null); // Task details state

    // Fetch task details when component mounts or taskId changes
    useEffect(() => {
        if (taskId && tasks) {
            // Find the task using taskId
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
            saveUpdatedTask(taskDetails); // Callback to save the task
            closeBottomSheet(); // Close the bottom sheet
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

            {/* Category Input */}
            <TextInput
                style={styles.input}
                placeholder="Category"
                value={taskDetails.category}
                onChangeText={(text) => handleInputChange('category', text)}
            />

            {/* Duration Input */}
            <TextInput
                style={styles.input}
                placeholder="Duration (mins)"
                keyboardType="numeric"
                value={taskDetails.duration?.toString()}
                onChangeText={(text) => handleInputChange('duration', text)}
            />

            {/* Save Button */}
            <TouchableOpacity style={Elements.mainButton} onPress={handleSave}>
                <Text style={Elements.mainButtonText}>Save Changes</Text>
            </TouchableOpacity>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: Colors.primary,
    },
});

export default EditTask;
