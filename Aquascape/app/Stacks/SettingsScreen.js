import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Keyboard, Image, Dimensions,
  TouchableOpacity, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback 
} from 'react-native';
import Elements from '../../constants/Elements';
import Colors from '../../constants/Colors';

import { auth } from '../../firebase/firebase';
import { signOut } from "firebase/auth";

const giftImage = require('../../assets/Fisherman.gif');

const screenWidth = Dimensions.get('window').width;

const SettingsScreen = ({ navigation }) => {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);  
    }
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  };

  const handleTest = () => {
    navigation.navigate("Store");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        
        {/* Testing fisherman animation */}
        <Image source={giftImage} style={styles.giftImage} />

        {/* Title */}
        <Text style={Elements.title}>Aquascape</Text>

        <Text>User UID: {uid ? uid : 'No user logged in'}</Text>
        
        <View style={styles.buttonContainer}>

          {/* Main Button */}
          <TouchableOpacity style={[Elements.secondaryButton, styles.button]} onPress={handleLogout}>
            <Text style={Elements.secondaryButtonText}>Log Out</Text>
          </TouchableOpacity>
          
          {/* Secondary Button */}
          <TouchableOpacity style={[Elements.mainButton, styles.button]} onPress={handleTest}>
            <Text style={Elements.mainButtonText}>Test screen</Text>
          </TouchableOpacity>

        </View>

        

        
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
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

  giftImage: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    marginVertical: 20,
  },
});