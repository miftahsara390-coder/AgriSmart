import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { authApi } from './apis';
import { authKeys } from './keys';
import { AuthResponse, LoginCredentials, RegisterCredentials } from './types';

export const useLoginMutation = (
  options?: UseMutationOptions<AuthResponse, Error, LoginCredentials>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await authApi.login(credentials);
      if (res.token) {
        await SecureStore.setItemAsync('accessToken', res.token);
      }
      return res;
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(authKeys.me(), { user: data.user });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useRegisterMutation = (
  options?: UseMutationOptions<AuthResponse, Error, RegisterCredentials>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (credentials: RegisterCredentials) => {
      const res = await authApi.register(credentials);
      if (res.token) {
        await SecureStore.setItemAsync('accessToken', res.token);
      }
      return res;
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(authKeys.me(), { user: data.user });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useLogoutMutation = (
  options?: UseMutationOptions<void, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async () => {
      await SecureStore.deleteItemAsync('accessToken');
    },
    onSuccess: (data, variables, context) => {
      queryClient.clear();
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};
