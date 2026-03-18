import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, X } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../shared/components/ui/Button';
import { swipeService, IncomingLikeResponse, SentLikeResponse } from '../../../services/api/swipe';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { spacing, colors } from '../../../shared/theme/theme';
import { useLikesReceived, useLikesSent } from '../hooks/useLikes';

const { width } = Dimensions.get('window');
const columnWidth = (width - spacing.md * 3) / 3;

type TabType = 'incoming' | 'sent';

export default function LikesScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<TabType>('incoming');
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: incomingPayload, isLoading: isLoadingIncoming, refetch: refetchIncoming } = useLikesReceived();
  const { data: sentPayload, isLoading: isLoadingSent, refetch: refetchSent } = useLikesSent();

  const unlikeMutation = useMutation({
    mutationFn: swipeService.unlike,
    onMutate: async (targetUserId) => {
      await queryClient.cancelQueries({ queryKey: ['likes', 'sent'] });
      const previousSentLikes = queryClient.getQueryData<SentLikeResponse[]>(['likes', 'sent']);
      queryClient.setQueryData(['likes', 'sent'], (old: SentLikeResponse[] | undefined) =>
        old?.filter(like => like.user.id !== targetUserId)
      );
      return { previousSentLikes };
    },
    onError: (err, targetUserId, context) => {
      if (context?.previousSentLikes) {
        queryClient.setQueryData(['likes', 'sent'], context.previousSentLikes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', 'sent'] });
    },
  });

  const incomingData = incomingPayload || [];
  const sentData = sentPayload || [];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'incoming') {
        await refetchIncoming();
      } else {
        await refetchSent();
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, refetchIncoming, refetchSent]);

  const renderIncomingItem = ({ item }: { item: IncomingLikeResponse }) => (
    <View style={styles.likeCard}>
      <Image
        source={{ uri: item.user.photos && item.user.photos.length > 0 ? item.user.photos[0].url : 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39' }}
        style={styles.likePhoto}
        blurRadius={15}
      />
      <View style={styles.overlay} />

      {item.is_crush && (
        <View style={styles.crushBadge}>
          <Star size={12} color={colors.white} fill={colors.white} />
          <Text style={styles.crushText}>Crush</Text>
        </View>
      )}
    </View>
  );

  const renderSentItem = ({ item }: { item: SentLikeResponse }) => (
    <View style={styles.sentItemCard}>
      <Image
        source={{ uri: item.user.photos && item.user.photos.length > 0 ? item.user.photos[0].url : 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39' }}
        style={styles.sentPhoto}
      />
      <View style={styles.sentInfo}>
        <Text style={styles.sentName}>{item.user.full_name}, {item.user.age}</Text>
        <Text style={styles.sentTime}>Liked on {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity
        style={styles.unlikeButton}
        onPress={() => unlikeMutation.mutate(item.user.id)}
        disabled={unlikeMutation.isPending}
      >
        <X size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const isLoading = activeTab === 'incoming' ? isLoadingIncoming : isLoadingSent;

  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'incoming' && styles.activeTab]}
            onPress={() => setActiveTab('incoming')}
          >
            <Text style={[styles.tabText, activeTab === 'incoming' && styles.activeTabText]}>Likes You</Text>
            {activeTab === 'incoming' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>Likes Sent</Text>
            {activeTab === 'sent' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        </View>
      </ScreenWithHeader>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeTab === 'incoming' ? (
        <FlatList
          key="likes-you-list"
          data={incomingData}
          renderItem={renderIncomingItem}
          keyExtractor={(item) => item.user.id}
          numColumns={3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nothing to see yet</Text>
              <Text style={styles.emptySubtitle}>When people like you, they'll appear here.</Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.premiumFooter}>
              <View style={styles.premiumCardContainer}>
                <LinearGradient colors={[colors.primary, '#db2777']} style={styles.premiumCard}>
                  <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>X4</Text></View>
                  <Text style={styles.premiumTitle}>Premium</Text>
                  <Text style={styles.premiumSubtitle}>See who likes you</Text>
                </LinearGradient>
              </View>
              <View style={styles.ctaSection}>
                <Text style={styles.ctaTitle}>Want to get more likes?</Text>
                <Text style={styles.ctaSubtitle}>Premium members get x4 more likes daily than regular users.</Text>
                <Button title="Upgrade to Premium" onPress={() => { }} style={styles.ctaButton} />
              </View>
            </View>
          }
        />
      ) : (
        <FlatList
          key="likes-sent-list"
          data={sentData}
          renderItem={renderSentItem}
          keyExtractor={(item) => item.user.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nothing to see yet</Text>
              <Text style={styles.emptySubtitle}>You haven't liked anyone yet. Start swiping!</Text>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  tab: {
    paddingVertical: 10,
    marginRight: spacing.lg,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  likeCard: {
    width: columnWidth,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    marginHorizontal: 4,
    backgroundColor: colors.border,
  },
  likePhoto: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  crushBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: 4,
  },
  crushText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  sentItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.sm + spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
  },
  sentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  sentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sentTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unlikeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff1f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumFooter: {
    marginTop: spacing.md,
  },
  premiumCardContainer: {
    marginVertical: spacing.md,
    position: 'relative',
  },
  premiumCard: {
    height: 120,
    borderRadius: 24,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 30,
  },
});
