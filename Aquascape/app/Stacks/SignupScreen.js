import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform,
  Image, TouchableWithoutFeedback, Keyboard, Dimensions, ScrollView, KeyboardAvoidingView 
} from 'react-native';
import Elements from '../../constants/Elements';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

import { auth, firestoreDB } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const screenHeight = Dimensions.get('window').height;

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');


  const [firstName, setFirstName] = useState('');
  //const [lastName, setLastName] = useState("");

  //Password visibility buttons
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  const handleUserStateChange = async (user, firstName) => {
    if (user) {
      try {
        const uid = user.uid;

        //Creates profile doc
        const userProfileRef = doc(firestoreDB, "profile", uid);
        await setDoc(userProfileRef, {
          email: user.email, // Use `user.email` from the Firebase `user` object
          firstName: firstName, // Pass firstName from the captured value
          createdAt: new Date(),
          seashells: 0,
        });

        //Creates aquarium data in the subcollection
        const aquariumDocRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
        await setDoc(aquariumDocRef, {
          fish: [
            { name: "Shark", fileName: "Shark.gif" },
            { name: "Pufferfish", fileName: "Pufferfish.gif" }
          ],
          decorations: [],
        });

        //Creates achievements doc in the subcollection
        const achievementsDocRef = doc(firestoreDB, "profile", uid, "achievements", "data");
        await setDoc(achievementsDocRef, {
          achievements: [
            { name: "First Fish", description: "Bought your first fish!", unlockedAt: null },
            { name: "Decorator", description: "Added your first decoration!", unlockedAt: null },
          ],
        });

        // Function to create tasks for a given month
        const createTasksForMonth = async (year, month) => {
          const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`; // Format as "YYYY-MM"
          const monthTasksRef = doc(firestoreDB, "profile", uid, "tasks", monthKey);

          // Predefined week keys
          const weeksData = {
            "1-7": [],
            "8-14": [],
            "15-21": [],
            "22-28": [],
            "29-end": [],
          };

          // Write the document for the month
          await setDoc(monthTasksRef, weeksData);
        };

        // Get the current date
        const now = new Date();

        // Create tasks for the current month
        await createTasksForMonth(now.getFullYear(), now.getMonth());

        // Create tasks for the next month
        const nextMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1; // Handle December -> January
        const nextMonthYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
        await createTasksForMonth(nextMonthYear, nextMonth);


        signOut(auth).then(() => navigation.replace("Login"));
      } catch (error) {
        console.error("Error saving user profile: ", error);
        Alert.alert("Error", "An error occurred while saving the user profile.");
      }
    }
  };

  const handleSignup = async () => {
    if (!firstName || !email || !password || !passwordConfirm) {
      let missingFields = [];
      if (!firstName) missingFields.push('First Name');
      if (!email) missingFields.push('Email');
      if (!password) missingFields.push('Password');
      if (!passwordConfirm) missingFields.push('Confirm Password');
  
      Alert.alert('Opps, you missed something', `Please fill out the following fields: ${missingFields.join(', ')}`);
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('Opps', 'Passwords do not match.');
      return;
    }

    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = credentials.user;

      // Pass the firstName directly to the profile save function
      await handleUserStateChange(user, firstName);

      Alert.alert("Account Created", "Please sign in with your new credentials.");
    } catch (e) {
      Alert.alert("Oops", "Please try again.");
      console.log(e);
    }
  };

  const handleCancel = () => {
    navigation.replace("Login");
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: Colors.lightBlue}}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
    <ScrollView style={styles.scrollContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.containerBackground}>
          
          <View  style={styles.container}>
            {/* Banner Image */}
            <Image 
              source={require('../../assets/banner2.png')}
              style={styles.banner}
              resizeMode="contain"
            />

            {/* Title */}
            <Text style={Elements.title}>Sign-Up</Text>

            
            {/* Text Fields */}

            <Text style={[Elements.header, styles.header]}>Name</Text>

            <TextInput
              style={Elements.textField}
              placeholder="Your Name"
              placeholderTextColor={Colors.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[Elements.header, styles.header]}>Email</Text>

            <TextInput
              style={Elements.textField}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            {/* Password with eye button */}
            <Text style={[Elements.header, styles.header]}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[Elements.textField, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Ionicons 
                  name={passwordVisible ? "eye" : "eye-off"} 
                  size={24} 
                  color={Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password with eye button */}
            <Text style={[Elements.header, styles.header]}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[Elements.textField, { flex: 1 }]}
                placeholder="Re-Enter Password"
                placeholderTextColor={Colors.textSecondary}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry={!passwordConfirmVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setPasswordConfirmVisible(!passwordConfirmVisible)}>
                <Ionicons 
                  name={passwordConfirmVisible ? "eye" : "eye-off"} 
                  size={24} 
                  color={Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>


            <View style={styles.buttonContainer}>

              {/* Main Button */}
              <TouchableOpacity style={[Elements.mainButton, styles.button]} onPress={handleSignup}>
                <Text style={Elements.mainButtonText}>Create Account</Text>
              </TouchableOpacity>

              {/* Secondary Button */}
              <TouchableOpacity style={[Elements.secondaryButton, styles.buttonSecondary]} onPress={handleCancel}>
              <Text style={Elements.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

            </View>
            

          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.lightBlue,
  },

  containerBackground: {
    flex: 1,
    backgroundColor: Colors.lightBlue,
  },

  container: {         
    width: '100%',
    height: screenHeight * 0.7,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    borderRadius: 15,
    marginTop: screenHeight * 0.25,
  },

  button: {
    width: '70%',
    marginBottom: 5,
    alignItems: 'center',
  },

  buttonSecondary: {
    width: '50%',
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 0,
  },

  buttonContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '90%'
  },

  header: {
    marginLeft: 10,
    marginBottom: 0,
  },

  banner: {
    position: 'absolute',  
    top: '-38%',
    width: '100%',       
    height: '40%',        
    resizeMode: 'contain', 
  },
});