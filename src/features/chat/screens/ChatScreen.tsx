import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageCircle } from 'lucide-react-native';
import { useChatStore } from '../../../store/useChatStore';
import { useUserStore } from '../../../store/useUserStore';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';

export default function ChatScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { conversations, fetchConversations, isLoading, error } = useChatStore();
  const { userData } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const renderConversation = ({ item }: { item: any }) => {
    const otherParticipant = item.participants.find((p: any) => p.user_id !== userData.id);
    if (!otherParticipant) return null;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatDetail', {
          conversationId: item.id,
          participantName: otherParticipant.full_name,
          participantPhoto: otherParticipant.photo_url
        })}
      >
        <Image source={{ uri: otherParticipant.photo_url }} style={styles.avatar} />
        {otherParticipant.is_online && <View style={styles.onlineBadge} />}

        <View style={styles.chatInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{otherParticipant.full_name}</Text>
            <Text style={styles.time}>
              {item.last_message ? new Date(item.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text style={[styles.lastMessage, item.unread_count > 0 && styles.unreadMessage]} numberOfLines={1}>
              {item.last_message ? item.last_message.content : 'No messages yet'}
            </Text>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMatch = ({ item }: { item: any }) => {
    const otherParticipant = item.participants.find((p: any) => p.user_id !== userData.id);
    if (!otherParticipant) return null;

    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => navigation.navigate('ChatDetail', {
          conversationId: item.id,
          participantName: otherParticipant.full_name,
          participantPhoto: otherParticipant.photo_url
        })}
      >
        <View style={styles.matchAvatarContainer}>
          <Image source={{ uri: otherParticipant.photo_url }} style={styles.matchAvatar} />
          {otherParticipant.is_online && <View style={styles.matchOnlineBadge} />}
        </View>
        <Text style={styles.matchName} numberOfLines={1}>{otherParticipant.full_name.split(' ')[0]}</Text>
      </TouchableOpacity>
    );
  };

  const newMatches = conversations.filter(c => !c.last_message);
  const activeChats = conversations.filter(c => c.last_message);

  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        </View>
      </ScreenWithHeader>

      <FlatList
        data={activeChats}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, conversations.length === 0 && { flexGrow: 1 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
        }
        ListHeaderComponent={
          <View>
            {(isLoading && conversations.length === 0) ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>New Matches</Text>
                </View>
                <View style={{ height: 110, marginBottom: 10 }}>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[1, 2, 3, 4]}
                    renderItem={() => <MatchSkeleton />}
                    keyExtractor={(i) => `m-skele-${i}`}
                    contentContainerStyle={{ paddingLeft: 24 }}
                  />
                </View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Messages</Text>
                </View>
              </>
            ) : (
              <>
                {newMatches.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>New Matches</Text>
                      <View style={styles.countBadge}>
                        <Text style={styles.countText}>{newMatches.length}</Text>
                      </View>
                    </View>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={newMatches}
                      renderItem={renderMatch}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={styles.matchList}
                    />
                  </>
                )}
                {activeChats.length > 0 && (
                  <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>Messages</Text>
                  </View>
                )}
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            {error && conversations.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchConversations()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (isLoading && conversations.length === 0) ? (
              <View style={{ paddingHorizontal: 24 }}>
                {[1, 2, 3, 4, 5].map(i => <ChatSkeleton key={i} />)}
              </View>
            ) : conversations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <MessageCircle size={48} color="#9ca3af" />
                </View>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtitle}>
                  Matches will appear here and you can start chatting with them.
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('Swipe')}
                >
                  <Text style={styles.exploreButtonText}>Find Matches</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        }
      />
    </ScreenLayout>
  );
}

const MatchSkeleton = () => (
  <View style={styles.matchSkeletonItem}>
    <View style={styles.matchSkeletonAvatar} />
    <View style={styles.matchSkeletonName} />
  </View>
);

const ChatSkeleton = () => (
  <View style={styles.skeletonItem}>
    <View style={styles.skeletonAvatar} />
    <View style={styles.skeletonInfo}>
      <View style={styles.skeletonNameRow}>
        <View style={styles.skeletonName} />
        <View style={styles.skeletonTime} />
      </View>
      <View style={styles.skeletonMessage} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  matchList: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  matchItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  matchAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  matchAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#ef4444',
  },
  matchOnlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  matchName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#f3f4f6',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 18,
    left: 74,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 15,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: '#111827',
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
  },
  skeletonItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  skeletonAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#f3f4f6',
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  skeletonNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skeletonName: {
    width: 120,
    height: 18,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  skeletonTime: {
    width: 40,
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  skeletonMessage: {
    width: '80%',
    height: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  matchSkeletonItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  matchSkeletonAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f3f4f6',
    marginBottom: 10,
  },
  matchSkeletonName: {
    width: 50,
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
