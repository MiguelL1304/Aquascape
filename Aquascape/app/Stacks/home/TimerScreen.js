import React, { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Circle } from 'react-native-progress';
import Icon from 'react-native-vector-icons/Ionicons';

import shell from '../../../assets/shell.png';
import fisherman from '../../../assets/Fisherman.gif';

const TimerScreen = () => {
  const route = useRoute();
  const { taskTitle, fromTasks } = route.params || {};
  const navigation = useNavigation();

  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState('25');
  const [shells, setShells] = useState(0);
  const [totalTimeInSeconds, setTotalTimeInSeconds] = useState(1500);

  useEffect(() => {
    let interval = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      clearInterval(interval);

      // Calculate total minutes passed
      const timeInMinutes = parseInt(customTime, 10) || 25;
      const minutesPassed = timeInMinutes;

      // Add bonus shells of +10 upon completion
      const bonusShells = 10;
      const totalSessionShells = minutesPassed + bonusShells;

      // Update total shells
      setShells((prevShells) => prevShells + totalSessionShells);

      // Alert user with accurate shell count
      Alert.alert(
        'Session Complete!',
        `You have accrued ${totalSessionShells} shells.`,
        [{ text: 'OK' }]
      );

      // Reset timer to default after completion
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

            // Update total shells
            setShells((prevShells) => prevShells + minutesPassed);

            // Alert user with accurate shell count
            Alert.alert(
              'Timer Stopped',
              `You have accrued ${minutesPassed} shells.`,
              [{ text: 'OK' }]
            );

            // Reset timer
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

  return (
    <View style={styles.container}>
      {/* Back Button */}
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
      <Text style={styles.shellCount}>Total Shells: {totalShells}</Text>

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
            placeholder="25"
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.customButton}
          onPress={isActive ? stopTimer : startTimer}
        >
          <Text style={styles.buttonText}>{isActive ? 'Stop' : 'Start'}</Text>
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
    backgroundColor: '#3498db',
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
    color: '#FFFFFF',
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
    backgroundColor: '#2980b9',
    padding: 10,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
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
});

export default TimerScreen;
