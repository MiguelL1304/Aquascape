import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import Elements from '../../constants/Elements'; // Import the reusable component styles
import Colors from '../../constants/Colors';

import { auth, firestoreDB } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const handleUserStateChange = async (user) => {
      if (user) {
        try {
          const uid = user.uid; // Use the `user` object provided by Firebase
  
          const userProfileRef = doc(firestoreDB, "profile", uid);
          await setDoc(userProfileRef, {
            email: user.email, // Use `user.email` from the Firebase `user` object
            firstName: firstName,
            lastName: lastName,
            createdAt: new Date(),
          });
  
          signOut(auth)
            .then(() => navigation.replace("Login"))
        } catch (error) {
          console.error("Error saving user profile: ", error);
          Alert.alert("Error", "An error occurred while saving the user profile.");
        }
      }
    };
  
    const unsubscribe = auth.onAuthStateChanged((user) => {
      handleUserStateChange(user); // Call the async function inside the listener
    });
  
    return () => unsubscribe(); // Clean up the subscription
  }, [])

  const handleSignup = async () => {
    if (email === '' || password === '') {
        
        Alert.alert('Error', 'Please enter both email and password.');

      } else {
        try {
          const credentials = createUserWithEmailAndPassword(
            auth,  
            email,
            password
          );
            
           Alert.alert("Account Created", "Please sign in with your new credentials.");
        } catch (e) {
            Alert.alert("Opps", "Please try again")
            console.log(e);
        }
      }
  };

  const handleCancel = () => {
    navigation.replace("Login");
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