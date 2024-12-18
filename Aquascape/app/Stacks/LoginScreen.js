import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Keyboard, Image, Platform,
  TouchableOpacity, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Dimensions  
} from 'react-native';
import Elements from '../../constants/Elements';
import Colors from '../../constants/Colors';

import { auth } from "../../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const screenHeight = Dimensions.get('window').height;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.replace('Drawer');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password).catch((error) =>
      alert(error.message)
    );
  };

  const handleSignup = () => {
    navigation.replace('Signup');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgetPassword');
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
            <Text style={Elements.title}>Aquascape</Text>

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

            <Text style={[Elements.header, styles.header]}>Password</Text>

            <TextInput
              style={Elements.textField}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Forgot Password Button */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forget Password?</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>

              {/* Main Button */}
              <TouchableOpacity style={[Elements.mainButton, styles.button]} onPress={handleLogin}>
                <Text style={Elements.mainButtonText}>Login</Text>
              </TouchableOpacity>

              {/* Secondary Button */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Dont have an account?    </Text>
                <TouchableOpacity onPress={handleSignup}>
                  <Text style={[styles.signupText, { fontWeight: 'bold' }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
              
                

            </View>

            

            
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
    marginBottom: 15,
    alignItems: 'center',
  },

  signupContainer: {
    width: '70%',
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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

  signupText: {
    color: Colors.textSecondary,
    fontSize: 16,
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