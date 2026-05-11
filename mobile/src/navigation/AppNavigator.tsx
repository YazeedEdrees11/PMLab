import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Animated } from 'react-native';
import { DefaultTheme } from '@react-navigation/native';

const PMLabTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0c111d', // App background color to prevent white flashes
    card: '#0c111d',
  },
};

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ResultsScreen from '../screens/ResultsScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewBookingScreen from '../screens/NewBookingScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import BranchesScreen from '../screens/BranchesScreen';
import MedicalFileScreen from '../screens/MedicalFileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { useAuthStore } from '../store/useAuthStore';
import CustomTabBar from '../components/CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: { backgroundColor: '#0c111d' },
      }}
    >
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'حسابي' }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen} 
        options={{ tabBarLabel: 'المواعيد' }}
      />
      <Tab.Screen 
        name="NewBookingTab" 
        component={View} // Dummy component, handled by custom tab bar
        options={{ tabBarLabel: '' }}
      />
      <Tab.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ tabBarLabel: 'النتائج' }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarLabel: 'الرئيسية' }}
      />
    </Tab.Navigator>
  );
}

import SplashScreen from '../screens/SplashScreen';

export default function AppNavigator() {
  const { isAuthenticated, loadStoredAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Small delay to let splash animation play beautifully
      const start = Date.now();
      await loadStoredAuth();
      const elapsed = Date.now() - start;
      const minDelay = 2500; // Match splash progress bar
      
      if (elapsed < minDelay) {
        setTimeout(() => setIsReady(true), minDelay - elapsed);
      } else {
        setIsReady(true);
      }
    };
    initAuth();
  }, [loadStoredAuth]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isReady) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isReady]);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <NavigationContainer theme={PMLabTheme}>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right', 
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: '#0c111d' }, // Ensure background is dark
          }}
        >
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="NewBooking" component={NewBookingScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Branches" component={BranchesScreen} />
              <Stack.Screen name="MedicalFile" component={MedicalFileScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
}
