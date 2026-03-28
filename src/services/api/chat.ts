import apiClient from './client';
import { EntityResponse } from '../../shared/types/entity';

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

export interface Conversation {
  id: string;
  type: string;
  title: string;
  avatar_url: string;
  last_message?: Message;
  unread_count: number;
  is_typing: boolean;
  created_at?: string;
  entity?: EntityResponse;
}

export interface ChatUploadResponse {
  upload_url: string;
  file_key: string;
}

export const chatApi = {
  getConversations: async (limit: number = 20, cursor?: string) => {
    const response = await apiClient.get<Conversation[]>('/chat/conversations', {
      params: { limit, cursor },
    });
    return response.data || [];
  },

  getNewMatches: async (limit: number = 20, cursor?: string) => {
    const response = await apiClient.get<Conversation[]>('/chat/new-matches', {
      params: { limit, cursor },
    });
    return response.data || [];
  },

  getMessages: (conversationId: string, limit = 50, offset = 0) =>
    apiClient.get<Message[]>(`/chat/conversations/${conversationId}/messages`, {
      params: { limit, offset }
    }),

  getOrCreateMatchConversation: (targetUserId: string) =>
    apiClient.post<Conversation>(`/chat/conversations/match/${targetUserId}`),

  unmatchUser: async (swiperEntityId: string, targetUserId: string) => {
    const response = await apiClient.post<{ message: string }>(`/swipe/unmatch/${targetUserId}`, null, {
      params: { swiper_entity_id: swiperEntityId }
    });
    return response.data;
  },

  getUploadUrl: (conversationId: string) =>
    apiClient.get<ChatUploadResponse>('/chat/upload-url', {
      params: { conversation_id: conversationId }
    }),
};
