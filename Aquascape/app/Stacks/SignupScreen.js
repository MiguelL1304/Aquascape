import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import Elements from '../../constants/Elements'; // Import the reusable component styles
import Colors from '../../constants/Colors';

import { auth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (email === '' || password === '') {
        
        Alert.alert('Error', 'Please enter both email and password.');

      } else {
        try {
            const credentials = await auth().createUserWithEmailAndPassword(
                email,
                password
            );

            if (credentials.user) {
                navigation.navigate('HomeTabs');
            }
        } catch (e) {
            Alert.alert("Opps", "Please try again")
        }
      }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={Elements.title}>Register</Text>

      {/* Text Fields */}
      <TextInput
        style={Elements.textField}
        placeholder="Email"
        placeholderTextColor={Colors.textSecondary}
        value={email}s
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={Elements.textField}
        placeholder="Password"
        placeholderTextColor={Colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <View style={styles.buttonContainer}>

        {/* Main Button */}
        <TouchableOpacity style={[Elements.mainButton, styles.button]} onPress={handleSignup}>
          <Text style={Elements.mainButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Secondary Button */}
        <TouchableOpacity style={[Elements.secondaryButton, styles.button]} onPress={handleCancel}>
         <Text style={Elements.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>

      </View>
      

    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  button: {
    width: '70%',
    marginBottom: 10,
    alignItems: 'center',
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 70, // Adjust this value to move buttons higher or lower
    width: '100%',
    alignItems: 'center',
  },
});