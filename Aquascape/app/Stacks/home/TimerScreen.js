import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';
import { Circle } from 'react-native-progress';

const TimerScreen = () => {
  const [secondsLeft, setSecondsLeft] = useState(1500);
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
      <Circle
        size={200}
        progress={1 - percentage / 100} // progress has to be between 0 and 1
        showsText={false}
        thickness={20}
        color="#FFF"
        borderWidth={0}
        unfilledColor="rgba(255, 255, 255, 0.3)"
      />

      <View style={styles.timerTextContainer}>
        <Text style={styles.timerText}>
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </Text>
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
        <Button title={isActive ? 'Pause' : 'Start'} onPress={toggleTimer} />
        <Button title="Reset" onPress={resetTimer} />
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
  timerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 40,
    color: '#FFFFFF', 
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 30,
    width: '50%',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
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
});

export default TimerScreen;
