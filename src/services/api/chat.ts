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
  id: string;
  full_name: string;
  profile_picture: string;
  age?: number;
  is_online: boolean;
  is_verified?: boolean;
  verified_at?: string;
}

export interface Conversation {
  id: string;
  user: Participant;
  last_message?: Message;
  unread_count: number;
  is_typing: boolean;
  created_at?: string;
}

export interface ChatUploadResponse {
  upload_url: string;
  file_key: string;
}

export const chatApi = {
  getConversations: async (limit: number = 20, offset: number = 0) => {
    const response = await apiClient.get<Conversation[]>('/chat/conversations', {
      params: { limit, offset },
    });
    return response.data || [];
  },

  getMessages: (conversationId: string, limit = 50, offset = 0) => 
    apiClient.get<Message[]>(`/chat/conversations/${conversationId}/messages`, {
      params: { limit, offset }
    }),

  getOrCreateMatchConversation: (targetUserId: string) => 
    apiClient.post<Conversation>(`/chat/conversations/match/${targetUserId}`),

  unmatchUser: async (targetUserId: string) => {
    // The unmatch route is on the swipe service
    const response = await apiClient.post<{ message: string }>(`/swipe/unmatch/${targetUserId}`);
    return response.data;
  },

  getUploadUrl: (conversationId: string) => 
    apiClient.get<ChatUploadResponse>('/chat/upload-url', {
      params: { conversation_id: conversationId }
    }),
};
