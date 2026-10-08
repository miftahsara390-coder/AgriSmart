import { useMutation, useQueryClient } from '@tanstack/react-query';
import { weatherKeys } from './keys';

export const useRefreshWeatherMutation = (city?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: weatherKeys.current(city) });
      await queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
};
