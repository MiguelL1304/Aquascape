import React, { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, Button, FlatList } from 'react-native';
import { Circle } from 'react-native-progress';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';

import shell from '../../../assets/shell.png';
import fisherman from '../../../assets/Fisherman.gif';
import Colors from '../../../constants/Colors';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
  
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      clearInterval(interval);
  
      // Accrue full session shells
      const timeInMinutes = parseInt(customTime, 10);
      const bonusShells = 10;
      const totalSessionShells = timeInMinutes + bonusShells;
  
      setShells((prevShells) => prevShells + totalSessionShells);
  
      Alert.alert(
        'Session Complete!',
        `You have accrued ${totalSessionShells} shells.`,
        [{ text: 'OK' }]
      );
  
      resetTimerStates();
    }
  
    return () => clearInterval(interval);
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
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Stop Timer',
          onPress: () => {
            const minutesPassed = Math.floor((totalTimeInSeconds - secondsLeft) / 60);
  
            setShells((prevShells) => prevShells + minutesPassed);
  
            Alert.alert(
              'Timer Stopped',
              `You have accrued ${minutesPassed} shells.`,
              [{ text: 'OK' }]
            );
  
            resetTimerStates();
          },
          style: 'destructive',
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

/////////////////////////BADGE STUFF /////////////////////////

//   const [earnedBadges, setEarnedBadges] = useState(['Sea Shell']);
//   const [totalStudyMinutes, setTotalStudyMinutes] = useState(0); 

//   const loadTotalStudyMinutes = async () => {
//     try {
//       const userId = auth.currentUser?.uid;
//       if (!userId) {
//           console.error('User is not authenticated');
//           return;
//       }      
//         const badgeDocRef = doc(db, 'profile', userId, 'badges', 'badgeData');
//         const badgeDoc = await getDoc(badgeDocRef);

//         if (badgeDoc.exists()) {
//             const data = badgeDoc.data();
//             setTotalStudyMinutes(data.totalMinutes || 0);
//             setEarnedBadges(data.earnedBadges || ['Sea Shell']); // Load badges from Firestore
//             console.log(`Loaded from Firestore: ${data.totalMinutes} minutes and badges: ${data.earnedBadges}`);
//         } else {
//           console.log('No badge data found. Initializing Firestore document...');
//           await setDoc(badgeDocRef, { totalMinutes: 0, earnedBadges: ['Sea Shell'] }, { merge: true });          
//         }
//     } catch (error) {
//         console.error('Error loading from Firestore:', error);
//     }
// };

// useEffect(() => {
//     loadTotalStudyMinutes();
// }, []);


// const saveTotalStudyMinutes = async (newMinutes, newBadges) => {
//   try {
//     const userId = auth.currentUser?.uid;
//     if (!userId) {
//         console.error('User is not authenticated');
//         return;
//     }    
//       const badgeDocRef = doc(db, 'profile', userId, 'badges', 'badgeData');

//       await updateDoc(badgeDocRef, {
//           totalMinutes: newMinutes,
//           earnedBadges: newBadges,
//       });
//       console.log(`Saved to Firestore: ${newMinutes} minutes and badges: ${newBadges}`);
//   } catch (error) {
//       console.error('Error saving to Firestore:', error);
//   }
// };

// const handleBadgeAward = async () => {
//   const sessionMinutes = Math.floor((parseInt(customTime) * 60 - secondsLeft) / 60);
//   const updatedTotalMinutes = totalStudyMinutes + sessionMinutes;

//   setTotalStudyMinutes(updatedTotalMinutes);

//   let newBadges = [...earnedBadges];

//   // Award badges based on cumulative total minutes
//   if (updatedTotalMinutes >=60 && !earnedBadges.includes('Conch Shell')) {
//       newBadges.push('Conch Shell');
//       Alert.alert('Congratulations!', 'You earned the Conch Shell badge!');
//   }
//   if (updatedTotalMinutes >= 300 && !earnedBadges.includes('Starfish')) {
//       newBadges.push('Starfish');
//       Alert.alert('Congratulations!', 'You earned the Starfish badge!');
//   }
//   if (updatedTotalMinutes >= 1440 && !earnedBadges.includes('Mermaid')) {
//       newBadges.push('Mermaid');
//       Alert.alert('Congratulations!', 'You earned the Mermaid badge!');
//   }

//   // Save updated minutes and badges to Firestore
//   await saveTotalStudyMinutes(updatedTotalMinutes, newBadges);

//   // Update state and navigate to Achievements
//   if (newBadges.length > earnedBadges.length) {
//       setEarnedBadges(newBadges);
//       navigation.navigate('Achievements', { earnedBadges: newBadges });
//   } else {
//       Alert.alert('Session complete!');
//       navigation.navigate('Achievements', { earnedBadges });
//   }

//   resetTimerStates();

// };

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

      <Image source={shell} style={styles.shell} />
      <Text style={styles.taskTitle}>{taskTitle}</Text>

      {/* Display Total Shells */}
      <Text style={styles.shellCount}>Total Shells: {shells}</Text>

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
  shell: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 50,
    height: 50,
    marginTop: 10,
  },
  fisherman: {
    position: 'absolute',
    width: 220,
    height: 220,
    left: 50,
    top: 5,
    resizeMode: 'contain',
  },
  shellCount: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
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
});

export default TimerScreen;
