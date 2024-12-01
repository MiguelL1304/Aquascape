import React, { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, Button, FlatList } from 'react-native';
import { Circle } from 'react-native-progress';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';

import shell from '../../../assets/shell.png';
import fisherman from '../../../assets/Fisherman.gif';
import Colors from '../../../constants/Colors';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { firestoreDB as db, auth } from '../../../firebase/firebase';

const TimerScreen = ({ route }) => {
  const { taskTitle, fromTasks } = route.params || {};
  const navigation = useNavigation();

  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState('25');
  const [shells, setShells] = useState(0);
  const [totalTimeInSeconds, setTotalTimeInSeconds] = useState(1500);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('other');

  const categories = ['Work', 'Personal', 'Fitness', 'Study', 'Leisure', 'Other'];

  useEffect(() => {
    let interval = null;
  
    const fetchShellsRealtime = () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error('User not authenticated.');
        }
  
        const profileDocRef = doc(db, 'profile', userId);
        const unsubscribe = onSnapshot(profileDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setShells(data.seashells || 0);
          }
        });
  
        return unsubscribe; 
      } catch (error) {
        console.error('Error fetching seashells in real-time:', error);
      }
    };
  
    const unsubscribe = fetchShellsRealtime();
  
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      clearInterval(interval);
  
      const timeInMinutes = parseInt(customTime, 10);
      const bonusShells = 10;
      const totalSessionShells = timeInMinutes + bonusShells;
  
      handleTimerComplete(totalSessionShells);
  
      Alert.alert('Session Complete!', `You have accrued ${totalSessionShells} shells.`, [
        { text: 'OK' },
      ]);
  
      resetTimerStates();
    }
  
    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe(); 
    };
  }, [isActive, secondsLeft]);
  
  

  const startTimer = () => {
    const timeInMinutes = parseInt(customTime, 10) || 25;
    const timeInSeconds = timeInMinutes * 60;

    setTotalTimeInSeconds(timeInSeconds);
    setSecondsLeft(timeInSeconds);
    setIsActive(true);
  };

  const stopTimer = () => {
    Alert.alert(
      'Are you sure you want to stop?',
      'If you stop the timer now, you will miss out on the bonus 10 shells :(',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Timer',
          style: 'destructive',
          onPress: () => {
            const minutesPassed = Math.floor((totalTimeInSeconds - secondsLeft) / 60);
  
            const updatedShellCount = shells + minutesPassed;
            setShells(updatedShellCount); // Update local state
            updateSeashells(minutesPassed); // Persist changes to Firestore
  
            resetTimerStates();
          },
        },
      ],
      { cancelable: false }
    );
  };
  
  

  const resetTimerStates = () => {
    setIsActive(false);
    setSecondsLeft(1500);
    setCustomTime('25');
    setTotalTimeInSeconds(1500);
  };

  const safeCustomTime = parseInt(customTime, 10) || 25;
  const totalSeconds = safeCustomTime * 60;
  const percentage = secondsLeft > 0 ? secondsLeft / totalSeconds : 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // Calculate minutes passed during the session
  const minutesPassed = isActive
    ? Math.floor((totalTimeInSeconds - secondsLeft) / 60)
    : 0;

  // Calculate total shells including shells earned during current session
  const totalShells = shells + minutesPassed;

  async function updateSeashells(earnedShells) {
    try {
      const currentUser = auth.currentUser;
  
      if (!currentUser) {
        console.error("No user is currently signed in.");
        return;
      }
  
      const userId = currentUser.uid;
      const profileDocRef = doc(db, "profile", userId);
      const profileDoc = await getDoc(profileDocRef);
  
      if (profileDoc.exists()) {
        const currentSeashells = profileDoc.data().seashells || 0;
  
        await updateDoc(profileDocRef, {
          seashells: currentSeashells + earnedShells,
        });
      } else {
        await setDoc(profileDocRef, { seashells: earnedShells });
      }
  
      console.log(`Successfully updated seashells by ${earnedShells}`);
    } catch (error) {
      console.error("Error updating seashells:", error);
    }
  }  


  // sync timer to badges
  async function updateAchievements(totalMinutes) {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const badgeDocRef = doc(db, "profile", userId, "badges", "badgeData");
        const badgeDocSnap = await getDoc(badgeDocRef);

        let earnedBadges = badgeDocSnap.exists() ? badgeDocSnap.data()?.earnedBadges || [] : [];

        // Determine which badges to unlock
        const newBadges = [];
        if (totalMinutes >= 10 && !earnedBadges.includes("Coral")) {
            newBadges.push("Coral");
        }
        if (totalMinutes >= 15 && !earnedBadges.includes("Conch Shell")) {
            newBadges.push("Conch Shell");
        }
        if (totalMinutes >= 18 && !earnedBadges.includes("Starfish")) {
            newBadges.push("Starfish");
        }

        if (newBadges.length > 0) {
            earnedBadges = [...earnedBadges, ...newBadges];
            console.log("Updated earnedBadges:", earnedBadges);

            // Update Firestore
            await updateDoc(badgeDocRef, { earnedBadges });
        }
    } catch (error) {
        console.error("Error updating achievements:", error);
    }
}


const handleTimerComplete = async (earnedShells) => {
  try {
      // console.log("handleTimerComplete called");
      // console.log("Earned shells:", earnedShells);

      // Update the seashell count in the local state and Firestore
      const updatedShellCount = shells + earnedShells;
      setShells(updatedShellCount);
      await updateSeashells(earnedShells);

      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const userId = currentUser.uid;

      // Update profile document
      const profileDocRef = doc(db, "profile", userId);
      const profileDocSnap = await getDoc(profileDocRef);

      let totalMinutes = profileDocSnap.exists() ? profileDocSnap.data()?.totalMinutes || 0 : 0;

      // Increment totalMinutes
      totalMinutes += parseInt(customTime, 10); // Add the timer duration
      console.log("Updated totalMinutes:", totalMinutes);

      // Update the profile document
      await updateDoc(profileDocRef, {
          seashells: updatedShellCount,
          totalMinutes,
      });

      // Update the badgeData document
      const badgeDocRef = doc(db, "profile", userId, "badges", "badgeData");
      const badgeDocSnap = await getDoc(badgeDocRef);

      let badgeTotalMinutes = badgeDocSnap.exists() ? badgeDocSnap.data()?.totalMinutes || 0 : 0;
      // console.log("Current totalMinutes in badgeData:", badgeTotalMinutes);

      // Increment totalMinutes for badges
      badgeTotalMinutes += parseInt(customTime, 10);

      // Update Firestore
      await updateDoc(badgeDocRef, { totalMinutes: badgeTotalMinutes });


      // Update achievements based on totalMinutes
      await updateAchievements(badgeTotalMinutes);
  } catch (error) {
      console.error("Error in handleTimerComplete:", error);
  }
};




  
  
  
  return (
    <View style={styles.container}>
      {fromTasks && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <View style={styles.backContainer}>
            <Icon
              name="arrow-back"
              size={24}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.shellContainer}>
        <Text style={styles.shellCount}>{shells}</Text>
        <Image source={shell} style={styles.shell} />
      </View>
      
      <Text style={styles.taskTitle}>{taskTitle}</Text>

      {/* Display Total Shells */}
      {/* <Text style={styles.shellCount}>Total Shells: {shells}</Text> */}

      <View style={styles.circleWrapper}>
        <Circle
          key={secondsLeft}
          size={250}
          progress={1 - Math.max(0, Math.min(percentage, 1))}
          showsText={false}
          thickness={20}
          color="#FFF"
          unfilledColor="rgba(255, 255, 255, 0.3)"
        />

        {/* Conditionally render the fisherman image */}
        {isActive && <Image source={fisherman} style={styles.fisherman} />}

        <View style={styles.timerTextContainer}>
          <Text style={styles.timerText}>
          {isActive
            ? `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
            : `${customTime}:00`}
          </Text>
        </View>
      </View>

      {/* Pick Category Button */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive) {
            setIsCategoryPickerVisible(true); 
          }
        }}
        style={[
          styles.categoryTextContainer,
          isActive && styles.disabledCategoryButton,
        ]}
        disabled={isActive}
      >
        <Text style={[styles.categoryButtonText, isActive && styles.disabledCategoryButtonText]}>
          {selectedCategory ? `Category: ${selectedCategory}` : 'Pick Category'}
        </Text>
      </TouchableOpacity>

      {/* Timer Button */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive && customTime === '25') {
            setIsPickerVisible(true);
          } else if (!isActive) {
            startTimer();
          } else {
            stopTimer();
          }
        }}
        style={styles.setTimerBtnContainer}
      >
        <Text style={styles.setTimerText}>
          {isActive
            ? 'Stop Timer'
            : customTime === '25'
            ? 'Set Timer'
            : 'Start Timer'}
        </Text>
      </TouchableOpacity>

      {/* Modal for Picker */}
      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.modalTitle}>Select Timer Duration</Text>
            <Picker
              selectedValue={customTime}
              onValueChange={(itemValue) => setCustomTime(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="2 minutes" value="2" /> 
              {/* 2 mins is purely for testing */}
              <Picker.Item label="5 minutes" value="5" />
              <Picker.Item label="10 minutes" value="10" />
              <Picker.Item label="15 minutes" value="15" />
              <Picker.Item label="20 minutes" value="20" />
              <Picker.Item label="25 minutes" value="25" />
              <Picker.Item label="30 minutes" value="30" />
              <Picker.Item label="45 minutes" value="45" />
              <Picker.Item label="60 minutes" value="60" />
              <Picker.Item label="90 minutes" value="60" />
            </Picker>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setIsPickerVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Category Picker */}
      <Modal
        visible={isCategoryPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCategoryPickerVisible(false)}
      >
        <View style={styles.categoryModalContainer}>
          <View style={styles.categoryPickerContainer}>
            <Text style={styles.categoryModalTitle}>Select a Category</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryModalButtons}
                  onPress={() => {
                    setSelectedCategory(item);
                    setIsCategoryPickerVisible(false);
                  }}
                >
                  <Text style={styles.categoryButtonText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>  
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.theme.blue,
  },
  circleWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 50,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 30,
    alignItems: 'center',
    width: '50%',
  },
  setTimerBtnContainer: {
    backgroundColor: Colors.theme.yellow, 
    borderColor: Colors.theme.orange,
    borderWidth: 2, 
    paddingVertical: 8, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '40%', 
    alignSelf: 'center',
  },
  setTimerText: {
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.theme.brown, 
    textAlign: 'center', 
  },
  input: {
    height: 50,
    width: 100,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 28,
  },
  buttonContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  customButton: {
    backgroundColor: Colors.theme.yellow,
    padding: 10,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
    borderColor: Colors.theme.orange,
    borderWidth: 3,
  },
  buttonText: {
    color: Colors.theme.brown,
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,
  },
  backContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  fisherman: {
    position: 'absolute',
    width: 220,
    height: 220,
    left: 50,
    top: 5,
    resizeMode: 'contain',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
  },
  timePickerContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    width: '100%',
    height: 150,
  },
  doneButton: {
    marginTop: 25,
    backgroundColor: Colors.theme.yellow,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    width: '50%',
    borderColor: Colors.theme.orange,
    borderWidth: 3,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.theme.brown,
  },
  categoryModalContainer: {
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center', 
  },
  categoryPickerContainer: {
    backgroundColor: Colors.theme.yellow, 
    borderColor: Colors.theme.orange,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    width: '80%', 
    alignSelf: 'center',
  },
  categoryModalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  categoryModalButtons: {
    backgroundColor: Colors.theme.yellow,
    padding: 10,
    borderRadius: 10,
    width: 150,
    alignItems: 'center',
    borderColor: Colors.theme.orange,
    borderWidth: 3,
    margin: 5,
  },
  categoryTextContainer: {
    backgroundColor: Colors.theme.yellow, 
    borderColor: Colors.theme.orange,
    borderWidth: 2, 
    paddingVertical: 8, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '60%',
    alignSelf: 'center', 
    margin: 20,
  },
  categoryButtonText: {
    color: Colors.theme.brown,
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneCategoryButton: {
    marginTop: 15,
    backgroundColor: '#FF9800',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  doneCategoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledCategoryButton: {
    backgroundColor: '#ccc',
    borderColor: '#999', 
  },
  disabledCategoryButtonText: {
    color: '#666',
  },
  shellContainer: {
    position: 'absolute',
    top: 40, 
    right: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  shell: {
    width: 50, 
    height: 50,
    marginLeft: 8,
  },
  shellCount: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  
});

export default TimerScreen;
