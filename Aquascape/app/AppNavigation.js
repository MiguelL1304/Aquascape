import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import of screens
import LoginScreen from './Stacks/LoginScreen';
import SignupScreen from './Stacks/SignupScreen';
import HomeTabs from './Stacks/home/HomeTabs';

const Stack = createStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen name="Login" component={LoginScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen name="Signup" component={SignupScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen name="HomeTabs" component={HomeTabs} 
            options={{ headerShown: false }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}