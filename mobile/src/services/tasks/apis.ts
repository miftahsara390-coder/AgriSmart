import apiClient from '../client';
import {
  CalendarTasksResponse,
  CreateTaskInput,
  Task,
  TaskQueryParams,
  TaskRecommendationResponse,
  UpdateTaskInput,
} from './types';

export const tasksApi = {
  getAll: async (params?: TaskQueryParams): Promise<{ tasks: Task[] }> => {
    const response = await apiClient.get<{ tasks: Task[] }>('/tasks', {
      params,
    });
    return response.data;
  },

  getCalendar: async (date: string): Promise<CalendarTasksResponse> => {
    const response = await apiClient.get<CalendarTasksResponse>('/tasks/calendar', {
      params: { date },
    });
    return response.data;
  },

  getRecommendation: async (): Promise<TaskRecommendationResponse> => {
    const response = await apiClient.get<TaskRecommendationResponse>('/tasks/recommendation');
    return response.data;
  },

  getById: async (id: string | number): Promise<{ task: Task }> => {
    const response = await apiClient.get<{ task: Task }>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskInput): Promise<{ message: string; task: Task }> => {
    const response = await apiClient.post<{ message: string; task: Task }>('/tasks', data);
    return response.data;
  },

  update: async (
    id: string | number,
    data: UpdateTaskInput
  ): Promise<{ message: string; task: Task }> => {
    const response = await apiClient.put<{ message: string; task: Task }>(`/tasks/${id}`, data);
    return response.data;
  },

  complete: async (id: string | number): Promise<{ message: string; task: Task }> => {
    const response = await apiClient.put<{ message: string; task: Task }>(`/tasks/${id}`, {
      completed: true,
      status: 'completed',
    });
    return response.data;
  },

  delete: async (id: string | number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },
};

export default tasksApi;
