import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Circle } from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import shell from '../../../assets/shell.png';
import fisherman from '../../../assets/Fisherman.gif';
import Colors from '../../../constants/Colors';

const TimerScreen = ({ route }) => {
  const { taskTitle, fromTasks } = route.params || {};
  const navigation = useNavigation();

  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState('25');
  const [earnedBadges, setEarnedBadges] = useState(['Sea Shell']); // Initialize with default badge
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0); // New state for cumulative minutes

  // Load cumulative minutes on component mount
  useEffect(() => {
    const loadTotalStudyMinutes = async () => {
      try {
        const savedMinutes = await AsyncStorage.getItem('totalStudyMinutes');
        if (savedMinutes !== null) {
          const parsedMinutes = parseInt(savedMinutes);
          setTotalStudyMinutes(isNaN(parsedMinutes) ? 0 : parsedMinutes);
          console.log(`Loaded cumulative study time: ${parsedMinutes} minutes`);
        } else {
          console.log('No previous cumulative time found, starting at 0.');
        }
      } catch (error) {
        console.error("Error loading cumulative time:", error);
      }
    };
    loadTotalStudyMinutes();
  }, []);

  // Save cumulative minutes each time it updates
  useEffect(() => {
    AsyncStorage.setItem('totalStudyMinutes', totalStudyMinutes.toString());
    console.log(`Saved cumulative study time: ${totalStudyMinutes} minutes`);
  }, [totalStudyMinutes]);

  useEffect(() => {
    let interval = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    } else if (secondsLeft === 0) {
      clearInterval(interval);
      handleBadgeAward(); // Award badge when session is complete
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleBadgeAward = () => {
    // Calculate minutes based on custom time to accurately capture session time
    const sessionMinutes = Math.floor((parseInt(customTime) * 60 - secondsLeft) / 60);
    const updatedTotalMinutes = totalStudyMinutes + sessionMinutes;

    setTotalStudyMinutes(updatedTotalMinutes);

    console.log(`Session completed: ${sessionMinutes} minutes`);
    console.log(`Updated cumulative study time after session: ${updatedTotalMinutes} minutes`);

    let newBadges = [...earnedBadges];

    // Badge awarding based on cumulative total minutes
    if (updatedTotalMinutes >= 60 && !earnedBadges.includes('Conch Shell')) {
      newBadges.push('Conch Shell');
      Alert.alert('Congratulations!', 'You earned the Conch Shell badge!');
    } 
    if (updatedTotalMinutes >= 300 && !earnedBadges.includes('Starfish')) {
      newBadges.push('Starfish');
      Alert.alert('Congratulations!', 'You earned the Starfish badge!');
    } 
    if (updatedTotalMinutes >= 1440 && !earnedBadges.includes('Mermaid')) {
      newBadges.push('Mermaid');
      Alert.alert('Congratulations!', 'You earned the Mermaid badge!');
    }

    if (newBadges.length > earnedBadges.length) {
      setEarnedBadges(newBadges);
      navigation.navigate('Achievements', { earnedBadges: newBadges });
    } else {
      Alert.alert('Session complete!');
      navigation.navigate('Achievements', { earnedBadges });
    }
  };

  const startTimer = () => {
    const timeInSeconds = parseInt(customTime) * 60;
    setSecondsLeft(timeInSeconds);
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    const timeInSeconds = parseInt(customTime) * 60;
    setSecondsLeft(timeInSeconds);
  };

  const safeCustomTime = parseInt(customTime) || 25;
  const totalSeconds = safeCustomTime * 60;
  const percentage = secondsLeft > 0 ? (secondsLeft / totalSeconds) : 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <View style={styles.container}>
      {fromTasks && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <View style={styles.backContainer}>
            <Icon name="arrow-back" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>
      )}

      <Image source={shell} style={styles.shell} />
      <Text style={styles.taskTitle}>{taskTitle}</Text>

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
        <Image source={fisherman} style={styles.fisherman} />
        <View style={styles.timerTextContainer}>
          <Text style={styles.timerText}>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </Text>
        </View>
      </View>

      {!isActive && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Set Timer (minutes):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={customTime}
            onChangeText={(value) => setCustomTime(value)}
            maxLength={3}
            placeholder='25'
            defaultValue='25'
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.customButton}
          onPress={isActive ? pauseTimer : startTimer}
        >
          <Text style={styles.buttonText}>
            {isActive ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.customButton} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
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
  label: {
    color: Colors.primary,
    fontSize: 18,
    marginBottom: 10,
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
  }
});

export default TimerScreen;
