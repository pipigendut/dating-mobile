import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MessageCircle, CheckCircle2, Heart } from 'lucide-react-native';
import { Conversation } from '../../../services/api/chat';
import { useChatStore } from '../../../store/useChatStore';
import { useUserStore } from '../../../store/useUserStore';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const {
    conversations,
    newMatches,
    hasMoreMatches,
    likesSummary,
    fetchConversations,
    fetchNewMatches,
    isLoading,
    error
  } = useChatStore();
  const { userData } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const title = item.title;
    const avatarUrl = item.avatar_url;
    const entity = item.entity;
    const isVerified = entity?.type === 'user' ? !!(entity.user?.verified_at ?? (entity.user as any)?.verifiedAt) : false;
    const isOnline = false;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatDetail', {
          conversationId: item.id,
          participantName: title,
          participantPhoto: avatarUrl,
          isVerified,
          participantId: entity?.id
        })}
      >
        <Image source={{ uri: avatarUrl || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39' }} style={[styles.avatar, { backgroundColor: colors.surface }]} />
        {isOnline && <View style={[styles.onlineBadge, { borderColor: colors.background }]} />}

        <View style={styles.chatInfo}>
          <View style={styles.nameRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{title}</Text>
              {isVerified && (
                <CheckCircle2 size={16} color="#3b82f6" fill="#e8e8e8ff" style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {item.last_message ? new Date(item.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={[
                styles.lastMessage,
                { color: colors.textSecondary },
                item.unread_count > 0 && [styles.unreadMessage, { color: colors.text }]
              ]} numberOfLines={1}>
                {item.last_message ? item.last_message.content : 'No messages yet'}
              </Text>
              {item.last_message && item.last_message.sender_id !== userData?.id && item.unread_count > 0 && (
                <View style={[styles.yourMoveBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.yourMoveText, { color: colors.primary }]}>YOUR MOVE</Text>
                </View>
              )}
            </View>
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

  const renderNewMatch = ({ item }: { item: Conversation }) => {
    const title = item.title;
    const avatarUrl = item.avatar_url;

    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => navigation.navigate('ChatDetail', {
          conversationId: item.id,
          participantName: title,
          participantPhoto: avatarUrl,
          participantId: item.entity?.id
        })}
      >
        <View style={styles.matchAvatarContainer}>
          <Image
            source={{ uri: avatarUrl || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39' }}
            style={[styles.matchAvatar, { borderColor: colors.primary }]}
          />
        </View>
        <Text style={[styles.matchName, { color: colors.text }]} numberOfLines={1}>{title.split(' ')[0]}</Text>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={{ backgroundColor: colors.background }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Likes and matches</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={newMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.matchList}
        renderItem={renderNewMatch}
        ListHeaderComponent={() => (
          <TouchableOpacity
            style={styles.likesBubble}
            onPress={() => navigation.navigate('Likes')}
          >
            <View style={styles.likesPhotoContainer}>
              {likesSummary?.last_photo ? (
                <Image
                  source={{ uri: likesSummary.last_photo }}
                  style={styles.likesPhoto}
                  blurRadius={70}
                />
              ) : (
                <View style={[styles.likesPlaceholder, { backgroundColor: colors.surface }]}>
                  <Heart size={32} color={colors.primary} fill={colors.primary} />
                </View>
              )}
              <View style={[styles.likesBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.likesBadgeText}>
                  {likesSummary?.count || 0}
                </Text>
              </View>
            </View>
            <Text style={[styles.matchName, { color: colors.text }]}>Likes</Text>
          </TouchableOpacity>
        )}
        onEndReached={() => {
          if (hasMoreMatches && !isLoading) {
            fetchNewMatches();
          }
        }}
        onEndReachedThreshold={0.5}
      />

      <View style={[styles.sectionHeader, { marginTop: 8 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Messages</Text>
      </View>
    </View>
  );

  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Chats</Text>
        </View>
      </ScreenWithHeader>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        )}
        contentContainerStyle={[
          styles.listContent,
          { backgroundColor: colors.background },
          conversations.length === 0 && { flexGrow: 1 }
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
            {isLoading && conversations.length === 0 ? (
              <View style={{ paddingHorizontal: 24 }}>
                {[1, 2, 3].map(i => <ChatSkeleton key={i} colors={colors} />)}
              </View>
            ) : conversations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                  <MessageCircle size={48} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No messages yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Matches with messages will appear here. Start a conversation with your new matches!
                </Text>
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
    flex: 1,
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
  likesBubble: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
    paddingLeft: 4,
  },
  likesPhotoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  likesPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  likesPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likesBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  likesBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 10,
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
  separator: {
    height: StyleSheet.hairlineWidth,
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
  yourMoveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  yourMoveText: {
    fontSize: 8,
    fontWeight: '800',
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
