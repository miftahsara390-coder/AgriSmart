import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// On Android emulator, localhost = the emulator itself, not the host machine.
// Use 10.0.2.2 to reach the host machine from an Android emulator.
const BASE_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${BASE_HOST}:5000/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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
      // Token expired or invalid — clean up local storage
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
  profile: () => api.get('/auth/profile'),
};

// ─── Home Dashboard ───────────────────────────────────────────────────────────
export const homeAPI = {
  getDashboard: () => api.get('/home'),
};

// ─── Weather ─────────────────────────────────────────────────────────────────
export const weatherAPI = {
  get: (city?: string) => api.get('/weather', { params: city ? { city } : undefined }),
};

// ─── Crops ───────────────────────────────────────────────────────────────────
export const cropsAPI = {
  getAll: () => api.get('/crops'),
  getById: (id: string) => api.get(`/crops/${id}`),
  create: (data: any) => api.post('/crops', data),
  update: (id: string, data: any) => api.put(`/crops/${id}`, data),
  delete: (id: string) => api.delete(`/crops/${id}`),
  getTelemetry: () => api.get('/crops/telemetry'),
  // Observations
  addObservation: (cropId: string, data: { note: string; imageUrl?: string }) =>
    api.post(`/crops/${cropId}/observations`, data),
  getObservations: (cropId: string) => api.get(`/crops/${cropId}/observations`),
  // Sensor history
  getSensorHistory: (cropId: string) => api.get(`/crops/${cropId}/sensors`),
  // Intelligence
  getIntelligence: (cropId: string) => api.get(`/crops/${cropId}/intelligence`),
  // AI Advice
  getAiAdvice: (cropId: string, question?: string) =>
    api.post(`/crops/${cropId}/ai-advice`, { question }),
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll: (params?: { status?: string; cropId?: string; from?: string; to?: string }) =>
    api.get('/tasks', { params }),
  getCalendar: (date: string) => api.get('/tasks/calendar', { params: { date } }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  complete: (id: string) => api.put(`/tasks/${id}`, { completed: true }),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// ─── Scan ─────────────────────────────────────────────────────────────────────
export const scanAPI = {
  scan: (imageUri: string, cropId?: string) => {
    const form = new FormData();
    form.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    } as any);
    if (cropId) form.append('cropId', cropId);
    return api.post('/scans', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getHistory: () => api.get('/scans'),
};

// ─── Agent ───────────────────────────────────────────────────────────────────
export const agentAPI = {
  chat: (message: string, history?: Array<{ role: string; content: string }>) =>
    api.post('/agent/chat', { message, history: history ?? [] }),
  getHistory: () => api.get('/agent/history'),
};

export default api;
