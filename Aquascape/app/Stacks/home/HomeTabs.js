import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AquariumScreen from '../home/AquariumScreen';
import TimerScreen from '../home/TimerScreen';
import TasksScreen from '../home/TasksScreen';

const Tab = createBottomTabNavigator();

export default function HomeTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerTransparent: true,
        headerTitle: '',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={30} style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Aquarium" component={AquariumScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
    </Tab.Navigator>
  );
}