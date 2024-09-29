import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import of screens
import LoginScreen from './Stacks/LoginScreen';
import HomeTabs from './Stacks/home/HomeTabs';
import SplashScreen from './Stacks/SplashScreen';

const Stack = createStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} 
            options={{ headerShown: false }} 
        />

        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{
            headerShown: false,
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}