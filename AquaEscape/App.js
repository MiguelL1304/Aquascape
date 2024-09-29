import React from 'react';
import AppNavigation from './app/AppNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from './app/Stacks/SplashScreen';
import LoginScreen from './app/Stacks/LoginScreen';

const Stack = createStackNavigator();

const App = ()  => {
  return  (
    <NavigationContainer>
      <Stack.Navigator
        // headerMode="none"
        screenOptions={{
          headerShown: false,
        }}
        >

          <Stack.Screen name = "SplashScreen" component={SplashScreen}/>
          <Stack.Screen name = "Login" component={LoginScreen} />

        </Stack.Navigator>
    </NavigationContainer>
  )
}
export default App;
// export default function App() {
//   return <AppNavigation />;
// }