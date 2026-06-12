import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSync } from './src/hooks/useSync'

import HomeScreen from './src/screens/HomeScreen'
import FocusSessionScreen from './src/screens/FocusSession/FocusSessionScreen'
import SyllabusScreen from './src/screens/Syllabus/SyllabusScreen'
import ChapterScreen from './src/screens/Syllabus/ChapterScreen'
import DevPanelScreen from './src/screens/DevPanel/DevPanelScreen'

const Stack = createNativeStackNavigator()

function AppNavigator() {
  useSync()
  return (
    <Stack.Navigator initialRouteName='Home'>
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='FocusSession' component={FocusSessionScreen} />
      <Stack.Screen name='Syllabus' component={SyllabusScreen} />
      <Stack.Screen name='Chapter' component={ChapterScreen} />
      <Stack.Screen name='DevPanel' component={DevPanelScreen} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  )
}