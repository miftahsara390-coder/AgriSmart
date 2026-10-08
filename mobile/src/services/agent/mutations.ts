import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { agentApi } from './apis';
import { agentKeys } from './keys';
import { ChatHistoryMessage, ChatResponse } from './types';

export const useSendAgentChatMutation = (
  options?: UseMutationOptions<
    ChatResponse,
    Error,
    {
      message: string;
      history?: ChatHistoryMessage[];
      image?: string;
      mimeType?: string;
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ message, history, image, mimeType }) =>
      agentApi.chat(message, history, image, mimeType),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.history() });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};

export const useClearAgentHistoryMutation = (
  options?: UseMutationOptions<{ message: string }, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => agentApi.clearHistory(),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(agentKeys.history(), { conversations: [] });
      queryClient.invalidateQueries({ queryKey: agentKeys.history() });
      (options?.onSuccess as any)?.(data, variables, context);
    },
  });
};
