import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {setupDatabase, addLocation, getAllLocation, searchLocationByName} from './database';
import HomeScreen from './screen/HomeScreen';
import GameScreen from './screen/GameScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    setupDatabase();
  }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }}
          component={HomeScreen}
        />
        <Stack.Screen
          name="Game"
          options={{ headerShown: false }}
          component={GameScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
