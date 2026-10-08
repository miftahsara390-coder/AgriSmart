import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { scanApi } from './apis';
import { scanKeys } from './keys';
import { ScanResponse } from './types';

export const useScanImageMutation = (
  options?: UseMutationOptions<
    ScanResponse,
    Error,
    { imageUri: string; cropId?: string | number }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ imageUri, cropId }: { imageUri: string; cropId?: string | number }) =>
      scanApi.scan(imageUri, cropId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: scanKeys.history() });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};
