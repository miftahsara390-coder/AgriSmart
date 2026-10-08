import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { weatherApi } from './apis';
import { weatherKeys } from './keys';
import { WeatherResponse } from './types';

export const useWeatherQuery = (
  city?: string,
  options?: Omit<UseQueryOptions<WeatherResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: weatherKeys.current(city),
    queryFn: () => weatherApi.get(city),
    ...options,
  });
};
