import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

// ============================================
// Auth Store - Zustand (PMLab Mobile)
// ============================================

interface User {
  id: string;
  email: string;
  role: string;
  name: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string, rememberMe: boolean = true) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      // Save to AsyncStorage only if rememberMe is checked
      if (rememberMe) {
        await AsyncStorage.setItem('access_token', access_token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      const message =
        err.response?.status === 401
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول. تأكد من اتصالك بالإنترنت.';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', data);
      const { access_token, user } = response.data;

      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب. تأكد من اتصالك بالإنترنت.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  loadStoredAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userJson = await AsyncStorage.getItem('user');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({ user, token, isAuthenticated: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  clearError: () => set({ error: null }),

  updateUser: async (updates: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));
