import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// On Android emulator, localhost = the emulator itself, not the host machine.
// Use 10.0.2.2 to reach the host machine from an Android emulator.
const BASE_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${BASE_HOST}:5000/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000, // 8s — fail fast so the app doesn't hang
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach access token ───────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — clean up local storage
      await SecureStore.deleteItemAsync('accessToken');
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── Crops ───────────────────────────────────────────────────────────────────
export const cropsAPI = {
  getAll: () => api.get('/crops'),
  getById: (id: string) => api.get(`/crops/${id}`),
  create: (data: any) => api.post('/crops', data),
  update: (id: string, data: any) => api.put(`/crops/${id}`, data),
  delete: (id: string) => api.delete(`/crops/${id}`),
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll: (params?: { status?: string; cropId?: string }) =>
    api.get('/tasks', { params }),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// ─── Scan ─────────────────────────────────────────────────────────────────────
export const scanAPI = {
  scan: (imageUri: string) => {
    const form = new FormData();
    form.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    } as any);
    return api.post('/scan', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Agent ───────────────────────────────────────────────────────────────────
export const agentAPI = {
  chat: (message: string, history?: Array<{ role: string; content: string }>) =>
    api.post('/agent/chat', { message, history: history ?? [] }),
};

export default api;
