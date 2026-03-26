import { create } from 'zustand';
import { Conversation, Message, chatApi } from '../services/api/chat';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  typingStatus: Record<string, string>; // conversationId -> initials/name of who is typing
  isLoading: boolean;
  hasMoreMessages: Record<string, boolean>;
  error: string | null;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message, currentUserId?: string) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  setTypingStatus: (conversationId: string, status: string) => void;
  resetUnreadCount: (conversationId: string) => void;
  resetChat: () => void;
  
  // Async Thunks (manual implementation with Zustand)
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, limit?: number, offset?: number) => Promise<void>;
  unmatchUser: (targetUserId: string, conversationId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingStatus: {},
  isLoading: false,
  hasMoreMessages: {},
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

  resetChat: () => set({ 
    conversations: [], 
    activeConversationId: null, 
    messages: {}, 
    hasMoreMessages: {},
    typingStatus: {}, 
    isLoading: false, 
    error: null 
  }),

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await chatApi.getConversations();
      set({ conversations: data, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      set({ error: error.message || 'Failed to fetch conversations', isLoading: false });
    }
  },

  unmatchUser: async (targetUserId, conversationId) => {
    try {
      await chatApi.unmatchUser(targetUserId);
      // Remove conversation directly from local state to update UI immediately
      set((state) => {
        const updatedConversations = state.conversations.filter(c => c.id !== conversationId);
        
        // Remove locally stored messages for this conversation
        const newMessages = { ...state.messages };
        delete newMessages[conversationId];

        return {
          conversations: updatedConversations,
          messages: newMessages,
          activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId
        };
      });
    } catch (error) {
      console.error('Failed to unmatch user:', error);
      throw error;
    }
  },

  fetchMessages: async (conversationId, limit = 50, offset = 0) => {
    if (offset === 0) {
      set({ isLoading: true, error: null });
    }
    try {
      const { data } = await chatApi.getMessages(conversationId, limit, offset);
      set((state) => {
        const existingMessages = state.messages[conversationId] || [];
        const newMessages = offset === 0 ? data : [...existingMessages, ...data];
        
        return {
          messages: { ...state.messages, [conversationId]: newMessages },
          hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: data.length === limit },
          isLoading: false
        };
      });
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      set({ error: error.message || 'Failed to fetch messages', isLoading: false });
    }
  },
}));
