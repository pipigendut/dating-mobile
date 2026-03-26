import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Send, Image as ImageIcon, Smile, ChevronLeft, MoreVertical, Check, CheckCheck, CheckCircle2 } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useChatStore } from '../../../store/useChatStore';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import { useUserStore } from '../../../store/useUserStore';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';
import { Alert } from 'react-native';
import { userService } from '../../../services/api/user';
import { mapApiUserToProfile } from '../../../utils/userMapper';
import ExpandedProfileModal from '../../dashboard/components/ExpandedProfileModal';
import { Profile } from '../../../data/mockProfiles';

const InputBar = ({ colors, isDark, inputText, handleInputChange, handleSend }: any) => {
  return (
    <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <TouchableOpacity style={styles.attachButton}>
        <Smile color={colors.textSecondary} size={24} />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { backgroundColor: isDark ? colors.background : '#f3f4f6', color: colors.text }]}
        placeholder="Type a message..."
        placeholderTextColor={colors.textSecondary}
        value={inputText}
        onChangeText={handleInputChange}
        multiline
      />

      <TouchableOpacity style={styles.attachButton}>
        <ImageIcon color={colors.textSecondary} size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.sendButton, !inputText.trim() && (isDark ? { backgroundColor: '#450a0a' } : styles.sendButtonDisabled)]}
        onPress={handleSend}
        disabled={!inputText.trim()}
      >
        <Send color="white" size={20} />
      </TouchableOpacity>
    </View>
  );
};

export default function ChatDetailScreen() {
  const { colors, isDark } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { conversationId, participantName, participantPhoto, isVerified, participantId } = route.params as any;

  const [inputText, setInputText] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const { messages, fetchMessages, addMessage, activeConversationId, setActiveConversationId, resetUnreadCount, typingStatus, unmatchUser, hasMoreMessages, isLoading } = useChatStore();
  const { sendMessage, sendTyping, sendReadReceipt } = useWebSocket();
  const { userData } = useUserStore();
  const flatListRef = useRef<FlatList>(null);

  const conversationMessages = messages[conversationId] || [];
  const otherUserTyping = typingStatus[conversationId];

  const keyboardHeight = useSharedValue(0);

  const isTypingRef = useRef(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  const hasMore = hasMoreMessages[conversationId] ?? true;

  useKeyboardHandler({
    onStart: (e) => {
      'worklet';
      // Langsung tembak ke tinggi akhir keyboard
      keyboardHeight.value = Math.abs(e.height);
    },
    // Kosongkan onMove agar tidak mengikuti animasi sistem per frame
    onMove: (e) => {
      'worklet';
    },
    onEnd: (e) => {
      'worklet';
      keyboardHeight.value = Math.abs(e.height);
    },
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value,
  }));

  useEffect(() => {
    setActiveConversationId(conversationId);
    
    // Only fetch if we don't have messages yet or it's the first mount for this id
    if (!messages[conversationId] || isInitialLoad.current) {
      fetchMessages(conversationId);
      isInitialLoad.current = false;
    }
    
    resetUnreadCount(conversationId);

    return () => {
      setActiveConversationId(null);
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    if (conversationMessages.length > 0) {
      const lastMessage = conversationMessages[0];
      if (lastMessage.sender_id !== userData.id) {
        // Send read receipt to server
        sendReadReceipt(conversationId, lastMessage.id);
        // Reset unread count locally for immediate feedback
        resetUnreadCount(conversationId);
      }
    }
  }, [conversationId, messages[conversationId], sendReadReceipt, resetUnreadCount, userData.id]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(conversationId, inputText.trim());
      setInputText('');

      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        sendTyping(conversationId, 'idle');
      }
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    if (text.length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        sendTyping(conversationId, 'typing');
      }

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
        sendTyping(conversationId, 'idle');
      }, 2000);
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        sendTyping(conversationId, 'idle');
      }
    }
  };

  const handleMore = () => {
    setShowActionSheet(true);
  };

  const handleUnmatch = () => {
    setShowActionSheet(false);
    if (!participantId || !conversationId) return;

    Alert.alert(
      'Unmatch User',
      'Are you sure you want to unmatch? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: async () => {
            try {
              await unmatchUser(participantId, conversationId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to unmatch user. Please try again later.');
            }
          }
        }
      ]
    );
  };

  const handleViewProfile = async () => {
    if (!participantId) return;
    try {
      const resp = await userService.getProfile(participantId);
      const mapped = mapApiUserToProfile(resp);
      setSelectedProfile(mapped);
      setIsProfileVisible(true);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      Alert.alert('Error', 'Could not load profile details');
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoading) return;
    fetchMessages(conversationId, 50, conversationMessages.length);
  };

  const renderFooter = () => {
    if (!isLoading || conversationMessages.length === 0) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.sender_id === userData.id;

    return (
      <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        <View style={[styles.messageBubble, isMine ? styles.myBubble : [styles.theirBubble, { backgroundColor: colors.surface, borderColor: colors.border }]]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : [styles.theirMessageText, { color: colors.text }]]}>
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
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color={colors.text} size={28} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerInfo} onPress={handleViewProfile}>
            <Image source={{ uri: participantPhoto }} style={[styles.avatar, { backgroundColor: colors.surface }]} />
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>{participantName}</Text>
                {!!isVerified && (
                  <CheckCircle2 size={16} color="#3b82f6" fill="#3b82f6" style={{ marginLeft: 6, flexShrink: 0 }} />
                )}
              </View>
              {otherUserTyping === 'typing' ? (
                <Text style={[styles.typingText, { color: colors.textSecondary }]}>typing...</Text>
              ) : (
                <Text style={[styles.onlineStatus, { color: '#10b981' }]}>Online</Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreButton} onPress={handleMore}>
            <MoreVertical color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>
      </ScreenWithHeader>
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        <FlatList
          ref={flatListRef}
          data={conversationMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesListBase}
          contentContainerStyle={styles.messagesListContent}
          inverted
          keyboardShouldPersistTaps="handled"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />

        <InputBar
          colors={colors}
          isDark={isDark}
          inputText={inputText}
          handleInputChange={handleInputChange}
          handleSend={handleSend}
        />
      </Animated.View>

      {isProfileVisible && selectedProfile && (
        <ExpandedProfileModal
          profile={selectedProfile}
          onClose={() => setIsProfileVisible(false)}
          showActions={false}
        />
      )}

      {/* Action Sheet Modal */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        >
          <View style={[styles.actionSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.actionSheetHandle} />
            <TouchableOpacity
              style={[styles.actionButton, { borderBottomColor: colors.border }]}
              onPress={handleUnmatch}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Unmatch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowActionSheet(false);
                Alert.alert('Block', 'This feature is coming soon.');
              }}
            >
              <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Block User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, { backgroundColor: isDark ? colors.background : '#f3f4f6' }]}
              onPress={() => setShowActionSheet(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
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
    marginLeft: 12,
    flexShrink: 1,
  },
  onlineStatus: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 12,
    fontWeight: '500',
  },
  typingText: {
    fontSize: 12,
    marginLeft: 12,
    fontStyle: 'italic',
  },
  moreButton: {
    padding: 8,
  },
  messagesListBase: {
    flex: 1,
  },
  messagesListContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
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
    borderBottomLeftRadius: 4,
    borderWidth: 1,
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
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 120,
    fontSize: 15,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  actionSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  actionSheetTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionButton: {
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderBottomWidth: 0,
    marginTop: 15,
    borderRadius: 16,
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
});
