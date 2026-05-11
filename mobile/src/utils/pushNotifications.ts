import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    }).catch(() => {}); // Catch error if in Expo Go
  }

  // Expo Go on SDK 53+ does not support push notifications and throws an error
  if (Constants.appOwnership === 'expo') {
    console.log('Running in Expo Go. Skipping push notifications setup as it is not supported in SDK 53+.');
    return null;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        
      if (!projectId) {
        console.log('Project ID not found (EAS not configured). Skipping push token registration.');
        return null;
      }
      
      // Get the Expo push token
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      // Send token to backend to be saved
      await api.post('/users/push-token', { pushToken: token });
      console.log('Push token successfully registered:', token);
    } catch (e) {
      console.log('Error fetching/sending push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
