import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        // Try to verify token by fetching current user
        const res = await authAPI.me();
        set({ user: res.data.user, token, isAuthenticated: true });
      }
    } catch {
      // Token invalid or backend unreachable — clear & continue as guest
      await SecureStore.deleteItemAsync('accessToken');
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user, token } = res.data;

    await SecureStore.setItemAsync('accessToken', token);
    set({ user, token, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { user, token } = res.data;

    await SecureStore.setItemAsync('accessToken', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
