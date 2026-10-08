import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { cropsApi } from './apis';
import { cropKeys } from './keys';
import {
  Crop,
  CropDetailResponse,
  CropIntelligenceResponse,
  CropObservation,
  CropTelemetryResponse,
  SensorRecord,
} from './types';

export const useCropsQuery = (
  options?: Omit<UseQueryOptions<{ crops: Crop[] }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: cropKeys.lists(),
    queryFn: () => cropsApi.getAll(),
    ...options,
  });
};

export const useCropQuery = (
  id: string | number | undefined,
  options?: Omit<UseQueryOptions<CropDetailResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: cropKeys.detail(id || ''),
    queryFn: () => cropsApi.getById(id!),
    enabled: !!id,
    ...options,
  });
};

export const useCropTelemetryQuery = (
  options?: Omit<UseQueryOptions<CropTelemetryResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: cropKeys.telemetry(),
    queryFn: () => cropsApi.getTelemetry(),
    ...options,
  });
};

export const useCropObservationsQuery = (
  id: string | number | undefined,
  options?: Omit<UseQueryOptions<{ observations: CropObservation[] }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: cropKeys.observations(id || ''),
    queryFn: () => cropsApi.getObservations(id!),
    enabled: !!id,
    ...options,
  });
};

export const useCropSensorsQuery = (
  id: string | number | undefined,
  options?: Omit<UseQueryOptions<{ sensors: SensorRecord[] }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: cropKeys.sensors(id || ''),
    queryFn: () => cropsApi.getSensorHistory(id!),
    enabled: !!id,
    ...options,
  });
};

export const useCropIntelligenceQuery = (
  id: string | number | undefined,
  options?: Omit<UseQueryOptions<CropIntelligenceResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: cropKeys.intelligence(id || ''),
    queryFn: () => cropsApi.getIntelligence(id!),
    enabled: !!id,
    ...options,
  });
};
