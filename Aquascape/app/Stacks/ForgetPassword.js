import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Keyboard, Image, Platform, Alert,
  TouchableOpacity, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Dimensions  
} from 'react-native';
import Elements from '../../constants/Elements';
import Colors from '../../constants/Colors';

import { auth } from "../../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const screenHeight = Dimensions.get('window').height;

const ForgetPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handlePasswordReset = async () => {
    await sendPasswordResetEmail(auth, email)
    .then(() => {
        Alert.alert(
            "Password Reset",
            "Check your email for instructions on how to reset your password!",
            [{
                text: "OK",
                onPress: () => navigation.goBack(),
            },
        ]);
    })
    .catch((error) => alert(error.message))
  };

  const handleCancel= () => {
    navigation.replace('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: Colors.lightBlue}}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
    <ScrollView style={styles.scrollContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.containerBackground}>
          {/* Banner Image */}
          <Image 
            source={require('../../assets/banner.png')} 
            style={styles.banner}
            resizeMode="contain"
          />
          <View style={styles.container}>
          
            {/* Title */}
            <Text style={Elements.title}>Password Resest</Text>

            <Text style={[Elements.header, styles.header]}>Email</Text>

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

            <View style={styles.buttonContainer}>

              {/* Main Button */}
              <TouchableOpacity style={[Elements.mainButton, styles.button]} onPress={handlePasswordReset}>
                <Text style={Elements.mainButtonText}>Send</Text>
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

export default ForgetPassword;

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
    height: screenHeight * 0.6,
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
    width: '70%',
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 0,
  },

  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',  
    bottom: 20,           
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginRight: 10,
    marginBottom: 20,
  },

  forgotPasswordText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  
  header: {
    marginLeft: 10,
    marginBottom: 0,
  },

  banner: {
    position: 'absolute', 
    right: 0,             
    top: 0,              
    width: '100%',       
    height: screenHeight * 0.32,       
    resizeMode: 'contain', 
  },
});