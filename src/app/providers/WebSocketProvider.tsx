import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useChatStore } from '../../store/useChatStore';
import { useUserStore } from '../../store/useUserStore';
import { BASE_URL, API_VERSION } from '../../lib/api';
import { wsEvents } from '../../utils/wsEvents';

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

const BASE_RECONNECT_DELAY = 5000;
const MAX_RECONNECT_DELAY = 30000;

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { userData, token, isLoggedIn } = useUserStore();
  const { addMessage, setTypingStatus } = useChatStore();
  
  const [isConnected, setIsConnected] = useState(false);
  const isManualClose = useRef(false);

  const connect = useCallback(() => {
    if (!token || !userData?.id || !isLoggedIn) {
      setIsConnected(false);
      return;
    }

    // Don't create another socket if one is already connecting or connected
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const baseUrl = `${BASE_URL}/api/${API_VERSION}`;
    const wsUrl = baseUrl.replace('http', 'ws') + `/ws?user_id=${userData.id}`;
    
    console.log('🔗 WebSocket connection attempt:', reconnectAttempts.current + 1);
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      if (ws.current !== socket) return;
      console.log('✅ WebSocket Connected');
      reconnectAttempts.current = 0;
      setIsConnected(true);
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
      setIsConnected(false);

      if (isManualClose.current) {
        console.log('ℹ️ WebSocket closed intentionally');
        return;
      }

      console.log('⚠️ WebSocket Closed:', e.reason || 'No reason');
      scheduleReconnect();
    };

    socket.onerror = (e) => {
      if (ws.current !== socket) return;
      console.error('❌ WebSocket Error:', e);
      // onerror is usually followed by onclose, but we can ensure it here
      setIsConnected(false);
      if (socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    };
  }, [token, userData?.id, isLoggedIn]);

  const scheduleReconnect = useCallback(() => {
    if (!isLoggedIn || isManualClose.current) return;
    
    // Clear any pending reconnects
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(MAX_RECONNECT_DELAY, BASE_RECONNECT_DELAY * Math.pow(1.5, reconnectAttempts.current));
    console.log(`📡 Reconnecting in ${Math.round(delay/1000)}s... (attempt ${reconnectAttempts.current + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      connect();
    }, delay);
  }, [isLoggedIn, connect]);

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
    }
  };

  // Proactive check logic
  const checkAndReconnect = useCallback(() => {
    if (isLoggedIn && (!ws.current || ws.current.readyState === WebSocket.CLOSED)) {
      console.log('🚀 Proactive WS check triggered: Attempting reconnection...');
      reconnectAttempts.current = 0; // Reset attempts to connect immediately
      connect();
    }
  }, [isLoggedIn, connect]);

  // AppState Listener (Foreground/Background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 App came to foreground, checking WebSocket...');
        checkAndReconnect();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [checkAndReconnect]);

  // Proactive Event Listener (from API calls)
  useEffect(() => {
    const unsubscribe = wsEvents.on('check-connection', () => {
      checkAndReconnect();
    });
    return unsubscribe;
  }, [checkAndReconnect]);

  // Initial connection and cleanup
  useEffect(() => {
    if (isLoggedIn) {
      isManualClose.current = false;
      connect();
    } else {
      isManualClose.current = true;
      ws.current?.close();
      ws.current = null;
      setIsConnected(false);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isLoggedIn, connect]);

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

  return (
    <WebSocketContext.Provider value={{ sendMessage, sendTyping, sendReadReceipt, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
