import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AquariumScreen from '../home/AquariumScreen';
import TimerScreen from '../home/TimerScreen';
import TasksScreen from '../home/TasksScreen';
import SettingsScreen from '../home/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Aquarium" component={AquariumScreen} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen name="Timer" component={TimerScreen} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen name="Tasks" component={TasksScreen} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen name="Settings" component={SettingsScreen} 
        options={{ headerShown: false }} 
      />
    </Tab.Navigator>
  );
}