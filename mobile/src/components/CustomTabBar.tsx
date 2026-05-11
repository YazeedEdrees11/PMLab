import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, FileText, Calendar, User, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Center Button (New Booking)
          if (route.name === 'NewBookingTab') {
            return (
              <View key={route.key} style={styles.centerButtonWrapper}>
                <TouchableOpacity
                  style={styles.centerButton}
                  onPress={() => navigation.navigate('NewBooking')}
                  activeOpacity={0.9}
                >
                  <View style={styles.centerButtonGlow} />
                  <Plus color="#ffffff" size={32} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            );
          }

          let Icon = Home;
          if (route.name === 'Profile') Icon = User;
          if (route.name === 'Appointments') Icon = Calendar;
          if (route.name === 'Results') Icon = FileText;
          if (route.name === 'Dashboard') Icon = Home;

          const color = isFocused ? '#ff4d4d' : '#94a3b8';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                <Icon color={color} size={24} strokeWidth={isFocused ? 2.5 : 2} />
                {isFocused && <View style={styles.glowDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    width: width - 40,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 20,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
  },
  glowDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ff4d4d',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  centerButtonWrapper: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40, // Floating effect
  },
  centerButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#0c111d',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 15,
  },
  centerButtonGlow: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(255, 77, 77, 0.3)',
  },
});
