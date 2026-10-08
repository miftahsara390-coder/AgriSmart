import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { scanApi } from './apis';
import { scanKeys } from './keys';
import { ScanHistoryResponse } from './types';

export const useScanHistoryQuery = (
  options?: Omit<UseQueryOptions<ScanHistoryResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: scanKeys.history(),
    queryFn: () => scanApi.getHistory(),
    ...options,
  });
};
