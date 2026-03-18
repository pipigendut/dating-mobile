import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Send, Image as ImageIcon, Smile, ChevronLeft, MoreVertical, Check, CheckCheck } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useChatStore } from '../../../store/useChatStore';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import { useUserStore } from '../../../store/useUserStore';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';

export default function ChatDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { conversationId, participantName, participantPhoto } = route.params as any;
  
  const [inputText, setInputText] = useState('');
  const { messages, fetchMessages, typingStatus } = useChatStore();
  const { sendMessage, sendTyping } = useWebSocket();
  const { userData } = useUserStore();
  const flatListRef = useRef<FlatList>(null);

  const conversationMessages = messages[conversationId] || [];
  const otherUserTyping = typingStatus[conversationId];

  useEffect(() => {
    fetchMessages(conversationId);
  }, [conversationId]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(conversationId, inputText.trim());
      setInputText('');
      sendTyping(conversationId, 'idle');
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (text.length > 0) {
      sendTyping(conversationId, 'typing');
    } else {
      sendTyping(conversationId, 'idle');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.sender_id === userData.id;

    return (
      <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, isMine ? styles.myTimestamp : styles.theirTimestamp]}>
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMine && (
                <View style={styles.statusIcon}>
                    {item.is_read ? <CheckCheck size={12} color="#fff" /> : <Check size={12} color="#fff" />}
                </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#111827" size={28} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Image source={{ uri: participantPhoto }} style={styles.avatar} />
            <View>
              <Text style={styles.headerName}>{participantName}</Text>
              {otherUserTyping === 'typing' ? (
                  <Text style={styles.typingText}>typing...</Text>
              ) : (
                  <Text style={styles.onlineStatus}>Online</Text>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical color="#6b7280" size={24} />
          </TouchableOpacity>
        </View>
      </ScreenWithHeader>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >

      <FlatList
        ref={flatListRef}
        data={conversationMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted // Newest messages at bottom
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Smile color="#6b7280" size={24} />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={handleInputChange}
          multiline
        />

        <TouchableOpacity style={styles.attachButton}>
          <ImageIcon color="#6b7280" size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send color="white" size={20} />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  onlineStatus: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 12,
    fontWeight: '500',
  },
  typingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 12,
    fontStyle: 'italic',
  },
  moreButton: {
    padding: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  myBubble: {
    backgroundColor: '#ef4444',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#1f2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.7,
  },
  myTimestamp: {
    color: '#fff',
    marginRight: 4,
  },
  theirTimestamp: {
    color: '#9ca3af',
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 120,
    fontSize: 15,
    color: '#1f2937',
    marginHorizontal: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#fca5a5',
  },
});
