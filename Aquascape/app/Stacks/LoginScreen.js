import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Keyboard,
  TouchableOpacity, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback 
} from 'react-native';
import Elements from '../../constants/Elements'; // Import the reusable component styles
import Colors from '../../constants/Colors';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Email:', email, 'Password:', password);
    navigation.navigate('HomeTabs');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
      
        {/* Title */}
        <Text style={Elements.title}>Aquascape</Text>

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
          <TouchableOpacity style={[Elements.mainButton, styles.button]} onPress={handleLogin}>
            <Text style={Elements.mainButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Secondary Button */}
          <TouchableOpacity style={[Elements.secondaryButton, styles.button]} onPress={handleSignup}>
            <Text style={Elements.secondaryButtonText}>Sign Up</Text>
          </TouchableOpacity>
            

        </View>

        

        
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

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