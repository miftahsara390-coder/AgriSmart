import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { cropsApi } from './apis';
import { cropKeys } from './keys';
import {
  AddObservationInput,
  AiAdviceResponse,
  CreateCropInput,
  Crop,
  CropObservation,
  UpdateCropInput,
} from './types';

export const useCreateCropMutation = (
  options?: UseMutationOptions<{ message: string; crop: Crop }, Error, CreateCropInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data: CreateCropInput) => cropsApi.create(data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: cropKeys.all });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useUpdateCropMutation = (
  options?: UseMutationOptions<
    { message: string; crop: Crop },
    Error,
    { id: string | number; data: UpdateCropInput }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string | number; data: UpdateCropInput }) =>
      cropsApi.update(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: cropKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: cropKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useDeleteCropMutation = (
  options?: UseMutationOptions<{ message: string }, Error, string | number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string | number) => cropsApi.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: cropKeys.all });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useAddObservationMutation = (
  options?: UseMutationOptions<
    { message: string; observation: CropObservation },
    Error,
    { cropId: string | number; data: AddObservationInput }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ cropId, data }: { cropId: string | number; data: AddObservationInput }) =>
      cropsApi.addObservation(cropId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: cropKeys.observations(variables.cropId),
      });
      queryClient.invalidateQueries({
        queryKey: cropKeys.detail(variables.cropId),
      });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useCropAiAdviceMutation = (
  options?: UseMutationOptions<
    AiAdviceResponse,
    Error,
    { cropId: string | number; question?: string }
  >
) => {
  return useMutation({
    ...options,
    mutationFn: ({ cropId, question }: { cropId: string | number; question?: string }) =>
      cropsApi.getAiAdvice(cropId, question),
  });
};
