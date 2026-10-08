import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { authApi } from './apis';
import { authKeys } from './keys';
import { CurrentUserResponse, ProfileResponse } from './types';

export const useCurrentUserQuery = (
  options?: Omit<UseQueryOptions<CurrentUserResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.getMe(),
    ...options,
  });
};

export const useUserProfileQuery = (
  options?: Omit<UseQueryOptions<ProfileResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    ...options,
  });
};
