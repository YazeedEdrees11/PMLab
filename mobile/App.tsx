import 'react-native-gesture-handler'; // Recommended for React Navigation
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Ignore Expo Go specific warning about push notifications
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from './src/utils/pushNotifications';

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: '#0c111d' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </View>
  );
}
