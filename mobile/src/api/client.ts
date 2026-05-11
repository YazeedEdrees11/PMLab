import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// PMLab API Client Configuration
// ============================================
import { Platform } from 'react-native';

// Change this to your backend IP address.
// For Android Emulator use: 10.0.2.2
// For physical device: use your local network IP (e.g. 192.168.1.182)
// Use Expo Environment Variables
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web'
  ? 'http://localhost:3001/api'
  : 'http://192.168.1.182:3001/api');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
