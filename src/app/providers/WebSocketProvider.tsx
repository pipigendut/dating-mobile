import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useUserStore } from '../../store/useUserStore';

interface WebSocketContextType {
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'image' | 'gif', metadata?: any) => void;
  sendTyping: (conversationId: string, status: 'typing' | 'idle') => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const { userData, token, isLoggedIn } = useUserStore();
  const { addMessage, setTypingStatus } = useChatStore();

  const connect = useCallback(() => {
    if (!token || !userData?.id || !isLoggedIn) return;

    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const wsUrl = baseUrl.replace('http', 'ws') + `/ws?user_id=${userData.id}`;
    
    console.log('🔗 Attempting WebSocket connection:', wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('✅ WebSocket Connected');
      reconnectAttempts.current = 0;
    };

    ws.current.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        handleWsEvent(event);
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    };

    ws.current.onclose = (e) => {
      console.log('⚠️ WebSocket Closed:', e.reason);
      if (isLoggedIn && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, RECONNECT_DELAY);
      }
    };

    ws.current.onerror = (e) => {
      console.error('❌ WebSocket Error:', e);
    };
  }, [token, userData?.id, isLoggedIn]);

  const handleWsEvent = (event: any) => {
    const { type, data, event_type } = event;
    const typeToHandle = event_type || type;
    const payload = data || event;

    switch (typeToHandle) {
      case 'chat.message.sent':
        addMessage(payload.conversation_id, payload);
        break;
      case 'chat.typing':
        setTypingStatus(payload.conversation_id, payload.status);
        break;
    }
  };

  const sendMessage = useCallback((conversationId: string, content: string, type: 'text' | 'image' | 'gif' = 'text', metadata = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'chat_message',
        conversation_id: conversationId,
        content,
        message_type: type,
        metadata
      }));
    }
  }, []);

  const sendTyping = useCallback((conversationId: string, status: 'typing' | 'idle') => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'typing',
        conversation_id: conversationId,
        status
      }));
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      connect();
    } else {
      ws.current?.close();
    }
    return () => {
      ws.current?.close();
    };
  }, [isLoggedIn, connect]);

  return (
    <WebSocketContext.Provider value={{ sendMessage, sendTyping, isConnected: ws.current?.readyState === WebSocket.OPEN }}>
      {children}
    </WebSocketContext.Provider>
  );
};
