import { useMutation, useQueryClient } from '@tanstack/react-query';
import { homeKeys } from './keys';

export const useRefreshHomeDashboardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: homeKeys.dashboard() });
    },
  });
};
