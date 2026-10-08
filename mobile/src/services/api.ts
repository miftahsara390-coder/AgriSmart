import apiClient from './client';

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  me: () => apiClient.get('/auth/me'),
  profile: () => apiClient.get('/auth/profile'),
};

export const homeAPI = {
  getDashboard: () => apiClient.get('/home'),
};

export const weatherAPI = {
  get: (city?: string) => apiClient.get('/weather', { params: city ? { city } : undefined }),
};

export const cropsAPI = {
  getAll: () => apiClient.get('/crops'),
  getById: (id: string | number) => apiClient.get(`/crops/${id}`),
  create: (data: any) => apiClient.post('/crops', data),
  update: (id: string | number, data: any) => apiClient.put(`/crops/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/crops/${id}`),
  getTelemetry: () => apiClient.get('/crops/telemetry'),
  addObservation: (cropId: string | number, data: { note: string; imageUrl?: string }) =>
    apiClient.post(`/crops/${cropId}/observations`, data),
  getObservations: (cropId: string | number) => apiClient.get(`/crops/${cropId}/observations`),
  getSensorHistory: (cropId: string | number) => apiClient.get(`/crops/${cropId}/sensors`),
  getIntelligence: (cropId: string | number) => apiClient.get(`/crops/${cropId}/intelligence`),
  getAiAdvice: (cropId: string | number, question?: string) =>
    apiClient.post(`/crops/${cropId}/ai-advice`, { question }),
};

export const tasksAPI = {
  getAll: (params?: { status?: string; cropId?: string; from?: string; to?: string }) =>
    apiClient.get('/tasks', { params }),
  getCalendar: (date: string) => apiClient.get('/tasks/calendar', { params: { date } }),
  getRecommendation: () => apiClient.get('/tasks/recommendation'),
  getById: (id: string | number) => apiClient.get(`/tasks/${id}`),
  create: (data: any) => apiClient.post('/tasks', data),
  update: (id: string | number, data: any) => apiClient.put(`/tasks/${id}`, data),
  complete: (id: string | number) => apiClient.put(`/tasks/${id}`, { completed: true, status: 'completed' }),
  delete: (id: string | number) => apiClient.delete(`/tasks/${id}`),
};

export const scanAPI = {
  scan: (imageUri: string, cropId?: string | number) => {
    const form = new FormData();
    form.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    } as any);
    if (cropId) form.append('cropId', String(cropId));
    return apiClient.post('/scans', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getHistory: () => apiClient.get('/scans'),
};

export const agentAPI = {
  chat: (
    message: string,
    history?: Array<{ role: string; content: string }>,
    image?: string,
    mimeType?: string
  ) =>
    apiClient.post('/agent/chat', {
      message,
      history: history ?? [],
      ...(image ? { image, mimeType: mimeType || 'image/jpeg' } : {}),
    }),
  getHistory: () => apiClient.get('/agent/history'),
  clearHistory: () => apiClient.delete('/agent/history'),
};

export const api = apiClient;
export default apiClient;
