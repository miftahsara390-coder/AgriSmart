import apiClient from '../client';
import { WeatherResponse } from './types';

export const weatherApi = {
  get: async (city?: string): Promise<WeatherResponse> => {
    const response = await apiClient.get<WeatherResponse>('/weather', {
      params: city ? { city } : undefined,
    });
    return response.data;
  },
};

export default weatherApi;
