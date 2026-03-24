import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useUserStore } from '../../store/useUserStore';

interface WebSocketContextType {
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'image' | 'gif', metadata?: any) => void;
  sendTyping: (conversationId: string, status: 'typing' | 'idle') => void;
  sendReadReceipt: (conversationId: string, messageId: string) => void;
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

  const isManualClose = useRef(false);

  const connect = useCallback(() => {
    if (!token || !userData?.id || !isLoggedIn) return;

    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const wsUrl = baseUrl.replace('http', 'ws') + `/ws?user_id=${userData.id}`;
    
    // Close existing connection if any before creating a new one
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      console.log('🔌 Closing existing WebSocket connection before reconnecting');
      isManualClose.current = true;
      ws.current.close();
      isManualClose.current = false;
    }

    console.log('🔗 Attempting WebSocket connection:', wsUrl);
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      if (ws.current !== socket) return;
      console.log('✅ WebSocket Connected');
      reconnectAttempts.current = 0;
    };

    socket.onmessage = (e) => {
      if (ws.current !== socket) return;
      try {
        const event = JSON.parse(e.data);
        handleWsEvent(event);
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    };

    socket.onclose = (e) => {
      if (ws.current !== socket) return;

      // Don't reconnect if we closed it manually
      if (isManualClose.current) {
        console.log('ℹ️ WebSocket closed intentionally, skipping reconnect');
        return;
      }

      console.log('⚠️ WebSocket Closed:', e.reason);
      if (isLoggedIn && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          if (ws.current !== socket) return; // Extra check after timeout
          reconnectAttempts.current++;
          connect();
        }, RECONNECT_DELAY);
      }
    };

    socket.onerror = (e) => {
      if (ws.current !== socket) return;
      console.error('❌ WebSocket Error:', e);
    };
  }, [token, userData?.id, isLoggedIn]);

  const handleWsEvent = (event: any) => {
    const { type, conversation_id, payload } = event;

    switch (type) {
      case 'RECEIVE_MESSAGE':
        addMessage(conversation_id, payload, userData?.id);
        break;
      case 'TYPING_START':
        setTypingStatus(conversation_id, 'typing');
        break;
      case 'TYPING_STOP':
        setTypingStatus(conversation_id, 'idle');
        break;
      case 'USER_ONLINE':
        // Optional: handle user online status update in store
        break;
      case 'USER_OFFLINE':
        // Optional: handle user offline status update in store
        break;
    }
  };

  const sendMessage = useCallback((conversationId: string, content: string, type: 'text' | 'image' | 'gif' = 'text', metadata = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'SEND_MESSAGE',
        conversation_id: conversationId,
        payload: {
          content,
          message_type: type,
          metadata
        }
      }));
    }
  }, []);

  const sendTyping = useCallback((conversationId: string, status: 'typing' | 'idle') => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: status === 'typing' ? 'TYPING_START' : 'TYPING_STOP',
        conversation_id: conversationId,
        payload: {}
      }));
    }
  }, []);

  const sendReadReceipt = useCallback((conversationId: string, messageId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'MESSAGE_READ',
        conversation_id: conversationId,
        payload: {
          message_id: messageId
        }
      }));
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      connect();
    } else {
      isManualClose.current = true;
      ws.current?.close();
      isManualClose.current = false;
    }
    return () => {
      isManualClose.current = true;
      ws.current?.close();
    };
  }, [isLoggedIn, connect]);

  return (
    <WebSocketContext.Provider value={{ sendMessage, sendTyping, sendReadReceipt, isConnected: ws.current?.readyState === WebSocket.OPEN }}>
      {children}
    </WebSocketContext.Provider>
  );
};
