import apiClient from './client';

export interface ChatMetadata {
  gif_provider?: string;
  image_width?: number;
  image_height?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: 'text' | 'image' | 'gif';
  content: string;
  metadata: ChatMetadata;
  created_at: string;
  is_read: boolean;
}

export interface Participant {
  user_id: string;
  full_name: string;
  photo_url: string;
  is_online: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
}

export interface ChatUploadResponse {
  upload_url: string;
  file_key: string;
}

export const chatApi = {
  getConversations: () => 
    apiClient.get<Conversation[]>('/chat/conversations'),

  getMessages: (conversationId: string, limit = 50, offset = 0) => 
    apiClient.get<Message[]>(`/chat/conversations/${conversationId}/messages`, {
      params: { limit, offset }
    }),

  getOrCreateMatchConversation: (targetUserId: string) => 
    apiClient.post<Conversation>(`/chat/conversations/match/${targetUserId}`),

  getUploadUrl: (conversationId: string) => 
    apiClient.get<ChatUploadResponse>('/chat/upload-url', {
      params: { conversation_id: conversationId }
    }),
};
