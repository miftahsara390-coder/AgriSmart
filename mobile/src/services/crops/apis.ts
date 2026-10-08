import apiClient from '../client';
import {
  AddObservationInput,
  AiAdviceResponse,
  CreateCropInput,
  Crop,
  CropDetailResponse,
  CropIntelligenceResponse,
  CropObservation,
  CropTelemetryResponse,
  SensorRecord,
  UpdateCropInput,
} from './types';

export const cropsApi = {
  getAll: async (): Promise<{ crops: Crop[] }> => {
    const response = await apiClient.get<{ crops: Crop[] }>('/crops');
    return response.data;
  },

  getById: async (id: string | number): Promise<CropDetailResponse> => {
    const response = await apiClient.get<CropDetailResponse>(`/crops/${id}`);
    return response.data;
  },

  create: async (data: CreateCropInput): Promise<{ message: string; crop: Crop }> => {
    const response = await apiClient.post<{ message: string; crop: Crop }>('/crops', data);
    return response.data;
  },

  update: async (
    id: string | number,
    data: UpdateCropInput
  ): Promise<{ message: string; crop: Crop }> => {
    const response = await apiClient.put<{ message: string; crop: Crop }>(`/crops/${id}`, data);
    return response.data;
  },

  delete: async (id: string | number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/crops/${id}`);
    return response.data;
  },

  getTelemetry: async (): Promise<CropTelemetryResponse> => {
    const response = await apiClient.get<CropTelemetryResponse>('/crops/telemetry');
    return response.data;
  },

  addObservation: async (
    cropId: string | number,
    data: AddObservationInput
  ): Promise<{ message: string; observation: CropObservation }> => {
    const response = await apiClient.post<{ message: string; observation: CropObservation }>(
      `/crops/${cropId}/observations`,
      data
    );
    return response.data;
  },

  getObservations: async (
    cropId: string | number
  ): Promise<{ observations: CropObservation[] }> => {
    const response = await apiClient.get<{ observations: CropObservation[] }>(
      `/crops/${cropId}/observations`
    );
    return response.data;
  },

  getSensorHistory: async (
    cropId: string | number
  ): Promise<{ sensors: SensorRecord[] }> => {
    const response = await apiClient.get<{ sensors: SensorRecord[] }>(
      `/crops/${cropId}/sensors`
    );
    return response.data;
  },

  getIntelligence: async (
    cropId: string | number
  ): Promise<CropIntelligenceResponse> => {
    const response = await apiClient.get<CropIntelligenceResponse>(
      `/crops/${cropId}/intelligence`
    );
    return response.data;
  },

  getAiAdvice: async (
    cropId: string | number,
    question?: string
  ): Promise<AiAdviceResponse> => {
    const response = await apiClient.post<AiAdviceResponse>(
      `/crops/${cropId}/ai-advice`,
      { question }
    );
    return response.data;
  },
};

export default cropsApi;
