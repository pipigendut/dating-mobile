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
  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  setTypingStatus: (conversationId: string, status: string) => void;
  
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

  addMessage: (conversationId, message) => set((state) => {
    const existingMessages = state.messages[conversationId] || [];
    // Prevent duplicates by checking ID
    if (existingMessages.find(m => m.id === message.id)) return state;
    
    const updatedMessages = [message, ...existingMessages]; // Assuming latest first
    
    // Also update last message in conversation list
    const updatedConversations = state.conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, last_message: message };
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

  setTypingStatus: (conversationId, status) => set((state) => ({
    typingStatus: { ...state.typingStatus, [conversationId]: status }
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
