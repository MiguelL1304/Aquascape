import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestoreDB } from '../../../firebase/firebase';
import Colors from '../../../constants/Colors';

const categoryColors = {
  Work: '#f08080',
  Personal: '#ffb6c1',
  Fitness: '#d8bfd8',
  Study: '#90ee90',
  Leisure: '#a7c7e7',
  Other: '#a9a9a9',
};

const RecurrenceList = ({ closeBottomSheet, openEditRecurrenceBottomSheet, setSelectedRecurrence  }) => {
  const [recurrenceData, setRecurrenceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the recurrence document from Firestore
  useEffect(() => {
    const fetchRecurrenceData = async () => {
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
          setRecurrenceData(data.tasks || []);
          console.log('Recurrence data fetched:', data.tasks);
        } else {
          console.log('No recurrence data found in Firestore.');
        }
      } catch (error) {
        console.error('Error fetching recurrence data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecurrenceData();
  }, []);

  // Group recurrence data by category
  const groupRecurrenceByCategory = (data) => {
    const grouped = {};
    data.forEach((task) => {
      if (!grouped[task.category]) grouped[task.category] = [];
      grouped[task.category].push(task);
    });
    return Object.entries(grouped); // Converts the grouped object to an array of [category, tasks]
  };

  const groupedData = groupRecurrenceByCategory(recurrenceData);

  const handleEditTask = (task) => {
    setSelectedRecurrence(task); // Pass the selected task to the parent
    closeBottomSheet(); // Close the RecurrenceList bottom sheet
    openEditRecurrenceBottomSheet(); // Open the EditTaskRecurrence bottom sheet
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {groupedData.map(([category, tasks]) => (
        <View key={category}>
          <Text style={[styles.categoryTitle, { color: categoryColors[category] }]}>
            {category}
          </Text>
          {tasks.map((task) => (
            <View key={task.recurrenceID} style={styles.taskRow}>
              <TouchableOpacity
                style={[
                  styles.taskItemContainer,
                  { backgroundColor: categoryColors[task.category] },
                ]}
                onPress={() => handleEditTask(task)}
              >
                <View style={styles.taskTextContainer}>
                  <Text style={styles.taskItem}>{task.title}</Text>
                  <Text style={styles.taskDuration}>
                    {`${task.duration} mins`}
                  </Text>
                  <Text style={styles.taskRecurrence}>
                    {task.recurrence.join(', ')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.background,
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
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    height: 60,
  },
  taskItemContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
    borderRadius: 5,
    height: '100%',
  },
  taskTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  taskItem: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  taskDuration: {
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
  },
  taskRecurrence: {
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
  },
});

export default RecurrenceList;
