export interface ChatHistoryMessage {
  role: 'user' | 'assistant' | string;
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatHistoryMessage[];
  image?: string;
  mimeType?: string;
}

export interface ChatResponse {
  response: string;
  conversationId?: string | number | null;
  model?: string;
}

export interface ConversationItem {
  id: string | number;
  userId?: string | number;
  message: string;
  response: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentHistoryResponse {
  conversations: ConversationItem[];
}
