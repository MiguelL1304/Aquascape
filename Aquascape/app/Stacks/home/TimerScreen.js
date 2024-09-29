import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Circle } from 'react-native-progress';

const TimerScreen = () => {
  const [secondsLeft, setSecondsLeft] = useState(1500); // Default to 25 minutes (1500 seconds)
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState('25'); // default set to 25 mins

  useEffect(() => {
    let interval = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      clearInterval(interval);
      alert('Session complete!');
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    const timeInSeconds = parseInt(customTime) * 60;
    setSecondsLeft(timeInSeconds);
  };

  const percentage = (secondsLeft / (parseInt(customTime) * 60)) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <View style={styles.container}>
      <View style={styles.circleWrapper}>
        <Circle
          size={250}
          progress={1 - percentage / 100} // progress has to be between 0 and 1
          showsText={false}
          thickness={20}
          color="#FFF"
          borderWidth={0}
          unfilledColor="rgba(255, 255, 255, 0.3)"
        />

        {/* Timer or Set Timer Input centered in the circle */}
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
            maxLength={3} // 999 mins max session time
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.customButton} onPress={toggleTimer}>
          <Text style={styles.buttonText}>{isActive ? 'Pause' : 'Start'}</Text>
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
    backgroundColor: '#3498db',
  },
  circleWrapper: {
    position: 'relative', // Allows absolute positioning of the text inside the circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerTextContainer: {
    position: 'absolute', // Centers the text within the circle
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 50, // Increased size for better visibility
    color: '#FFFFFF', 
    fontWeight: 'bold',
    textAlign: 'center',
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
    backgroundColor: '#2980b9',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    width: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TimerScreen;
