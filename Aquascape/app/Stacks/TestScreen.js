import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Elements from '../../constants/Elements';
import Colors from '../../constants/Colors';
import { CalendarList, Calendar } from 'react-native-calendars';
import { format, addDays } from 'date-fns';

import { auth, firestoreDB } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const TestScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Mock task data
    const tasks = {
        '2024-09-29': [{ id: '1', task: 'Study' }, { id: '2', task: 'Working' }],
        '2024-09-30': [{ id: '3', task: 'Exercise' }, { id: '4', task: 'Stretch' }],
        '2024-10-01': [{ id: '5', task: 'Meeting' }],
    };

    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
    };

    // Create the marked dates object with dots
    const markedDates = {
        '2024-09-29': { marked: true, dots: [{ key: 'study', color: 'blue' }, { key: 'working', color: 'green' }] },
        '2024-09-30': { marked: true, dots: [{ key: 'exercise', color: 'orange' }, { key: 'stretch', color: 'purple' }] },
        '2024-10-01': { marked: true, dots: [{ key: 'meeting', color: 'red' }] },
        [selectedDate]: { selected: true, selectedColor: 'blue' },
    };

    const renderTaskItem = ({ item }) => (
        <View style={styles.taskContainer}>
        <Text style={styles.taskText}>{item.task}</Text>
        </View>
    );

    const handleCancel = () => {
        navigation.replace('Drawer');
    };

    return (
        <View style={styles.container}>
            {/* Calendar at the top */}
            <CalendarList
                horizontal
                pagingEnabled
                onDayPress={onDayPress}
                pastScrollRange={12}
                futureScrollRange={12}
                markedDates={markedDates}
                markingType={'multi-dot'} // Allows multiple dots under a date
                theme={{
                    calendarBackground: '#1E1E1E',
                    dayTextColor: '#fff',
                    textSectionTitleColor: '#fff',
                    selectedDayBackgroundColor: '#fff',
                    selectedDayTextColor: '#1E1E1E',
                    todayTextColor: '#ff6347',
                    monthTextColor: '#fff',
                }}
            />

            {/* Task list based on selected day */}
            <View style={styles.taskListContainer}>
                <Text style={styles.heading}>Tasks for {selectedDate}</Text>
                <FlatList
                data={tasks[selectedDate] || []}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.noTaskText}>No tasks for this day</Text>}
                />
            </View>

            {/* Secondary Button */}
            <TouchableOpacity style={[Elements.mainButton, styles.button]} onPress={handleCancel}>
                <Text style={Elements.mainButtonText}>Cancel screen</Text>
            </TouchableOpacity>
        </View>
    );
};
  
export default TestScreen;

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
},
taskListContainer: {
    marginTop: 10,
},
taskContainer: {
    backgroundColor: '#3A3A3C',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
},
taskText: {
    color: '#fff',
    fontSize: 16,
},
heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
},
noTaskText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
},
});