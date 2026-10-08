import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { tasksApi } from './apis';
import { taskKeys } from './keys';
import { CreateTaskInput, Task, UpdateTaskInput } from './types';

export const useCreateTaskMutation = (
  options?: UseMutationOptions<{ message: string; task: Task }, Error, CreateTaskInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      if (variables.cropId) {
        queryClient.invalidateQueries({ queryKey: ['crops', 'detail', String(variables.cropId)] });
      }
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useUpdateTaskMutation = (
  options?: UseMutationOptions<
    { message: string; task: Task },
    Error,
    { id: string | number; data: UpdateTaskInput }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string | number; data: UpdateTaskInput }) =>
      tasksApi.update(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useCompleteTaskMutation = (
  options?: UseMutationOptions<{ message: string; task: Task }, Error, string | number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string | number) => tasksApi.complete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useDeleteTaskMutation = (
  options?: UseMutationOptions<{ message: string }, Error, string | number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string | number) => tasksApi.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};
