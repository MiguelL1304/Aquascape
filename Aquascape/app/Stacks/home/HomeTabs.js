import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure this import is correct
import AquariumScreen from '../home/AquariumScreen';
import TimerScreen from '../home/TimerScreen';
import TasksScreen from '../home/TasksScreen';

const Tab = createBottomTabNavigator();

export default function HomeTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Aquarium') {
            iconName = focused ? 'water' : 'water-outline';
          } else if (route.name === 'Timer') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e74c3',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
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