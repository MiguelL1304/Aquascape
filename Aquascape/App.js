import React from 'react';
import AppNavigation from './app/AppNavigation';
import { LogBox } from 'react-native';

export default function App() {
  return <AppNavigation />;
}

LogBox.ignoreLogs([
  'ExpandableCalendar: Support for defaultProps will be removed',
]);