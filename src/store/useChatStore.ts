import { create } from 'zustand';
import { Conversation, Message, chatApi } from '../services/api/chat';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  typingStatus: Record<string, string>; // conversationId -> initials/name of who is typing
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message, currentUserId?: string) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  setTypingStatus: (conversationId: string, status: string) => void;
  resetUnreadCount: (conversationId: string) => void;
  
  // Async Thunks (manual implementation with Zustand)
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingStatus: {},
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message, currentUserId) => set((state) => {
    const existingMessages = state.messages[conversationId] || [];
    // Prevent duplicates by checking ID
    if (existingMessages.find(m => m.id === message.id)) return state;
    
    const updatedMessages = [message, ...existingMessages]; // Assuming latest first
    
    // Also update last message and unread count in conversation list
    const updatedConversations = state.conversations.map(conv => {
      if (conv.id === conversationId) {
        // Increment unread count if message is from other user
        const isFromOther = currentUserId && message.sender_id !== currentUserId;
        // Only increment if we are not actively viewing this conversation
        const isNotActive = state.activeConversationId !== conversationId;
        
        return { 
          ...conv, 
          last_message: message,
          unread_count: (isFromOther && isNotActive) ? (conv.unread_count || 0) + 1 : (conv.unread_count || 0)
        };
      }
      return conv;
    });

    return {
      messages: { ...state.messages, [conversationId]: updatedMessages },
      conversations: updatedConversations
    };
  }),

  setMessages: (conversationId, messages) => set((state) => ({
    messages: { ...state.messages, [conversationId]: messages }
  })),

  setTypingStatus: (conversationId: string, status) => set((state) => ({
    typingStatus: { ...state.typingStatus, [conversationId]: status }
  })),

  resetUnreadCount: (conversationId) => set((state) => ({
    conversations: state.conversations.map(conv => 
      conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
    )
  })),

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await chatApi.getConversations();
      set({ conversations: data, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      set({ error: error.message || 'Failed to fetch conversations', isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      const { data } = await chatApi.getMessages(conversationId);
      set((state) => ({
        messages: { ...state.messages, [conversationId]: data }
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },
}));
