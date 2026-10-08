import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// On Android emulator, localhost = the emulator itself, not the host machine.
// Use 10.0.2.2 to reach the host machine from an Android emulator.
const BASE_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${BASE_HOST}:5000/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach access token ───────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('[ApiClient] Failed to load accessToken from SecureStore', error);
  }
  return config;
});

// ─── Response interceptor — handle 401 ───────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clean up local storage
      try {
        await SecureStore.deleteItemAsync('accessToken');
      } catch (cleanError) {
        console.warn('[ApiClient] Failed to delete accessToken on 401', cleanError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
