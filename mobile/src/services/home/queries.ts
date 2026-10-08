import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { homeApi } from './apis';
import { homeKeys } from './keys';
import { HomeDashboardResponse } from './types';

export const useHomeDashboardQuery = (
  options?: Omit<UseQueryOptions<HomeDashboardResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: homeKeys.dashboard(),
    queryFn: () => homeApi.getDashboard(),
    ...options,
  });
};
