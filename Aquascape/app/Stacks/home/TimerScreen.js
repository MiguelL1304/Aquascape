import React, { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Circle } from 'react-native-progress';
import Icon from 'react-native-vector-icons/Ionicons';

const TimerScreen = () => {
  const route = useRoute();
  const { taskTitle, fromTasks } = route.params || {};
  const navigation = useNavigation();

  const [secondsLeft, setSecondsLeft] = useState(1500); // Default to 25 mins
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState('25'); // Default set to 25 mins

  useEffect(() => {
    let interval = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    } else if (secondsLeft === 0) {
      clearInterval(interval);
      alert('Session complete!');
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const toggleTimer = () => setIsActive(!isActive);

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
      {/* Back Button */}
      {fromTasks && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <View style={styles.backContainer}>
            <Icon name="arrow-back" size={24} color="#fff"style={{marginRight: 10}}/>
            <Text style={styles.backButtonText}>Back</Text>
          </View>
          
        </TouchableOpacity>
      )}

      <Text style={styles.taskTitle}>{taskTitle}</Text>

      <View style={styles.circleWrapper}>
        <Circle
          size={250}
          progress={1 - percentage / 100}
          thickness={20}
          color="#FFF"
          unfilledColor="rgba(255, 255, 255, 0.3)"
        />
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
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.customButton} onPress={toggleTimer}>
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
  }
});

export default TimerScreen;
