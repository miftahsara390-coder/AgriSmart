import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { agentApi } from './apis';
import { agentKeys } from './keys';
import { AgentHistoryResponse } from './types';

export const useAgentHistoryQuery = (
  options?: Omit<UseQueryOptions<AgentHistoryResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: agentKeys.history(),
    queryFn: () => agentApi.getHistory(),
    ...options,
  });
};
