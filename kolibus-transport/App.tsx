/* KoliBus Transport — Navigation racine */
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { APP } from './src/lib/config';
import LoginScreen from './src/screens/LoginScreen';
import MissionsScreen from './src/screens/MissionsScreen';
import ParcelDetailScreen from './src/screens/ParcelDetailScreen';
import GpsScreen from './src/screens/GpsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: APP.colors.cream, primary: APP.colors.green },
};

export type RootStackParamList = {
  Login: undefined;
  Missions: undefined;
  ParcelDetail: { parcelId: string };
  Gps: undefined;
  History: undefined;
  Profile: undefined;
};

export default function App() {
  return (
    <NavigationContainer theme={Theme}>
      <StatusBar style="light" backgroundColor={APP.colors.green} />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: APP.colors.green },
          headerTintColor: APP.colors.white,
          headerTitleStyle: { fontWeight: '900' },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Missions" component={MissionsScreen} options={{ title: 'Missions' }} />
        <Stack.Screen name="ParcelDetail" component={ParcelDetailScreen} options={{ title: 'Colis' }} />
        <Stack.Screen name="Gps" component={GpsScreen} options={{ title: 'Suivi GPS' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
