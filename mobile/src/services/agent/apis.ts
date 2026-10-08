import apiClient from '../client';
import {
  AgentHistoryResponse,
  ChatHistoryMessage,
  ChatRequest,
  ChatResponse,
} from './types';

export const agentApi = {
  chat: async (
    message: string,
    history?: ChatHistoryMessage[],
    image?: string,
    mimeType?: string
  ): Promise<ChatResponse> => {
    const payload: ChatRequest = {
      message,
      history: history ?? [],
      ...(image ? { image, mimeType: mimeType || 'image/jpeg' } : {}),
    };
    const response = await apiClient.post<ChatResponse>('/agent/chat', payload);
    return response.data;
  },

  getHistory: async (): Promise<AgentHistoryResponse> => {
    const response = await apiClient.get<AgentHistoryResponse>('/agent/history');
    return response.data;
  },

  clearHistory: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>('/agent/history');
    return response.data;
  },
};

export default agentApi;
