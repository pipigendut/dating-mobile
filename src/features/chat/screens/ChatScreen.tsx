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
  const { colors, isDark } = useTheme();
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
        <Image source={{ uri: otherParticipant.photo_url }} style={[styles.avatar, { backgroundColor: colors.surface }]} />
        {otherParticipant.is_online && <View style={[styles.onlineBadge, { borderColor: colors.background }]} />}

        <View style={styles.chatInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>{otherParticipant.full_name}</Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {item.last_message ? new Date(item.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text style={[
              styles.lastMessage, 
              { color: colors.textSecondary },
              item.unread_count > 0 && [styles.unreadMessage, { color: colors.text }]
            ]} numberOfLines={1}>
              {item.last_message ? item.last_message.content : 'No messages yet'}
            </Text>
            {item.unread_count > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
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
          <Image source={{ uri: otherParticipant.photo_url }} style={[styles.matchAvatar, { borderColor: colors.primary }]} />
          {otherParticipant.is_online && <View style={[styles.matchOnlineBadge, { borderColor: colors.background }]} />}
        </View>
        <Text style={[styles.matchName, { color: colors.text }]} numberOfLines={1}>{otherParticipant.full_name.split(' ')[0]}</Text>
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
        contentContainerStyle={[
          styles.listContent, 
          { backgroundColor: colors.background },
          conversations.length === 0 && { flexGrow: 1 }
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
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
                    renderItem={() => <MatchSkeleton colors={colors} />}
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
                      <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
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
          <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
            {error && conversations.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.surface }]}
                  onPress={() => fetchConversations()}
                >
                  <Text style={[styles.retryButtonText, { color: colors.text }]}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (isLoading && conversations.length === 0) ? (
              <View style={{ paddingHorizontal: 24, backgroundColor: colors.background }}>
                {[1, 2, 3, 4, 5].map(i => <ChatSkeleton key={i} colors={colors} />)}
              </View>
            ) : conversations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                  <MessageCircle size={48} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No messages yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Matches will appear here and you can start chatting with them.
                </Text>
                <TouchableOpacity
                  style={[styles.exploreButton, { backgroundColor: colors.primary }]}
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

const MatchSkeleton = ({ colors }: { colors: any }) => (
  <View style={styles.matchSkeletonItem}>
    <View style={[styles.matchSkeletonAvatar, { backgroundColor: colors.surface }]} />
    <View style={[styles.matchSkeletonName, { backgroundColor: colors.surface }]} />
  </View>
);

const ChatSkeleton = ({ colors }: { colors: any }) => (
  <View style={styles.skeletonItem}>
    <View style={[styles.skeletonAvatar, { backgroundColor: colors.surface }]} />
    <View style={styles.skeletonInfo}>
      <View style={styles.skeletonNameRow}>
        <View style={[styles.skeletonName, { backgroundColor: colors.surface }]} />
        <View style={[styles.skeletonTime, { backgroundColor: colors.surface }]} />
      </View>
      <View style={[styles.skeletonMessage, { backgroundColor: colors.surface, opacity: 0.5 }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
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
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countBadge: {
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
  },
  matchName: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  time: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: '700',
  },
  unreadBadge: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
    borderRadius: 4,
  },
  skeletonTime: {
    width: 40,
    height: 12,
    borderRadius: 4,
  },
  skeletonMessage: {
    width: '80%',
    height: 14,
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
    marginBottom: 10,
  },
  matchSkeletonName: {
    width: 50,
    height: 12,
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
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
