import apiClient from '../client';
import { HomeDashboardResponse } from './types';

export const homeApi = {
  getDashboard: async (): Promise<HomeDashboardResponse> => {
    const response = await apiClient.get<HomeDashboardResponse>('/home');
    return response.data;
  },
};

export default homeApi;
