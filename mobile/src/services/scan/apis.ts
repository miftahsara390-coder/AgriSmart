import apiClient from '../client';
import { ScanHistoryResponse, ScanResponse } from './types';

export const scanApi = {
  scan: async (imageUri: string, cropId?: string | number): Promise<ScanResponse> => {
    const form = new FormData();
    form.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    } as any);

    if (cropId) {
      form.append('cropId', String(cropId));
    }

    const response = await apiClient.post<ScanResponse>('/scans', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getHistory: async (): Promise<ScanHistoryResponse> => {
    const response = await apiClient.get<ScanHistoryResponse>('/scans');
    return response.data;
  },
};

export default scanApi;
