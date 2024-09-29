import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import of screens
import LoginScreen from './Stacks/LoginScreen';
import SignupScreen from './Stacks/SignupScreen';
import HomeTabs from './Stacks/home/HomeTabs';
import SettingsScreen from './Stacks/SettingsScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerNavigation() {
  return (
    <Drawer.Navigator initialRouteName="HomeTabs">
      <Drawer.Screen 
        name="HomeTabs" 
        component={HomeTabs} 
        options={{ 
          headerShown: false, 
          title: 'Home'
        }} 
      />
      <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={({ navigation }) => ({
            headerTransparent: true, // Make the header transparent
            // Add the drawer button on the settings screen
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <Icon name="menu" size={30} style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            ),
          })}
        />
    </Drawer.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Drawer"
          component={DrawerNavigation} // Wrap HomeTabs and Settings in the Drawer
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}