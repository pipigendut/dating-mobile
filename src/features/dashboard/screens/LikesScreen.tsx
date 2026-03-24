import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, X, Clock, CheckCircle2 } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../shared/components/ui/Button';
import { swipeService, IncomingLikeResponse, SentLikeResponse } from '../../../services/api/swipe';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { spacing } from '../../../shared/theme/theme';
import { useLikesReceived, useLikesSent } from '../hooks/useLikes';
import { useSubscriptionStatus } from '../../../services/api/monetization';
import { SubscriptionModal } from '../../dashboard/components/SubscriptionModal';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useUserStore } from '../../../store/useUserStore';
import ExpandedProfileModal from '../components/ExpandedProfileModal';
import { Profile } from '../../../data/mockProfiles';
import { mapApiUserToProfile } from '../../../utils/userMapper';

const { width } = Dimensions.get('window');
const columnWidth = (width - spacing.md * 3) / 3;

type TabType = 'incoming' | 'sent';

const CountdownTimer = ({ expiresAt, colors }: { expiresAt: string, colors: any }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(expiresAt) - +new Date();
      if (difference <= 0) return 'Expired';

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      if (days > 0) return `${days}d ${hours}h left`;
      if (hours > 0) return `${hours}h ${minutes}m left`;
      return `${minutes}m left`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <View style={styles.countdownContainer}>
      <Clock size={12} color={timeLeft === 'Expired' ? '#ef4444' : colors.textSecondary} />
      <Text style={[styles.sentTime, { color: timeLeft === 'Expired' ? '#ef4444' : colors.textSecondary, marginLeft: 4 }]}>
        {timeLeft}
      </Text>
    </View>
  );
};

export default function LikesScreen() {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('incoming');
  const [refreshing, setRefreshing] = useState(false);

  const { userData } = useUserStore();
  const { 
    data: incomingPayload, 
    isLoading: isLoadingIncoming, 
    isFetchingNextPage: isFetchingNextPageIncoming, 
    fetchNextPage: fetchNextIncoming, 
    hasNextPage: hasNextIncoming, 
    refetch: refetchIncoming 
  } = useLikesReceived();

  const { 
    data: sentPayload, 
    isLoading: isLoadingSent, 
    isFetchingNextPage: isFetchingNextPageSent, 
    fetchNextPage: fetchNextSent, 
    hasNextPage: hasNextSent, 
    refetch: refetchSent 
  } = useLikesSent();

  const { data: status } = useSubscriptionStatus();
  const [showSubscription, setShowSubscription] = useState(false);

  const incomingData = incomingPayload?.pages.flat().filter(Boolean) || [];
  const sentData = sentPayload?.pages.flat().filter(Boolean) || [];

  // Robust subscription check with multiple fallbacks
  const planName = status?.plan_name?.toLowerCase() || (status as any)?.planName?.toLowerCase() || userData.subscription?.planName?.toLowerCase() || '';
  const isUnlocked = planName === 'premium' || planName === 'ultimate' || !!status?.features?.['see_likes'];

  const displayedIncoming = isUnlocked ? incomingData : incomingData.slice(0, 6);

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);

  const unlikeMutation = useMutation({
    mutationFn: swipeService.unlike,
    onMutate: async (targetUserId) => {
      await queryClient.cancelQueries({ queryKey: ['likes', 'sent'] });

      // InfiniteQuery stores data as { pages: SentLikeResponse[][], pageParams: [] }
      const previousData = queryClient.getQueryData(['likes', 'sent']);

      queryClient.setQueryData(['likes', 'sent'], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: SentLikeResponse[]) =>
            page.filter(like => like.user.id !== targetUserId)
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _targetUserId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['likes', 'sent'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', 'sent'] });
    },
  });

  const swipeMutation = useMutation({
    mutationFn: ({ swipedId, direction }: { swipedId: string, direction: 'LIKE' | 'DISLIKE' | 'CRUSH' }) =>
      swipeService.swipe(swipedId, direction),
    onSuccess: (data) => {
      // Invalidate both incoming and candidates for consistency
      queryClient.invalidateQueries({ queryKey: ['likes', 'received'] });
      queryClient.invalidateQueries({ queryKey: ['swipeCandidates'] });
      setIsDetailMode(false);
      setSelectedProfile(null);
    },
  });

  const handleAction = (direction: 'LIKE' | 'DISLIKE' | 'CRUSH') => {
    if (selectedProfile) {
      swipeMutation.mutate({ swipedId: selectedProfile.id, direction });
    }
  };

  const onRefresh = useCallback(async () => {
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

  const renderIncomingItem = ({ item }: { item: IncomingLikeResponse }) => {
    if (!item) return null;
    const profile = mapApiUserToProfile(item.user);

    return (
      <TouchableOpacity
        style={[styles.likeCard, { backgroundColor: colors.border }]}
        onPress={() => {
          if (isUnlocked && profile) {
            setSelectedProfile(profile);
            setIsDetailMode(true);
          } else {
            setShowSubscription(true);
          }
        }}
        activeOpacity={isUnlocked ? 0.7 : 1}
      >
        <Image
          source={{ uri: item.user.photos && item.user.photos.length > 0 ? item.user.photos[0].url : 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39' }}
          style={styles.likePhoto}
          blurRadius={isUnlocked ? 0 : 50}
        />
        <View style={styles.overlay} />

        {item.is_crush && (
          <View style={styles.crushBadge}>
            <Star size={12} color="white" fill="white" />
            <Text style={styles.crushText}>Crush</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSentItem = ({ item }: { item: SentLikeResponse }) => {
    if (!item || !item.user) return null;
    return (
      <View style={[styles.sentItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Image
          source={{ uri: item.user.photos && item.user.photos.length > 0 ? item.user.photos[0].url : 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39' }}
          style={[styles.sentPhoto, { backgroundColor: colors.border }]}
        />
        <View style={styles.sentInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.sentName, { color: colors.text }]} numberOfLines={1}>
              {item.user.full_name}, {item.user.age}
            </Text>
            {!!(item.user.verified_at || (item.user as any).verifiedAt) && (
              <CheckCircle2 size={16} color="#3b82f6" fill="#3b82f6" style={{ marginLeft: 4 }} />
            )}
          </View>
          <CountdownTimer expiresAt={item.expires_at} colors={colors} />
        </View>
        <TouchableOpacity
          style={[styles.unlikeButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fff1f2' }]}
          onPress={() => unlikeMutation.mutate(item.user.id)}
          disabled={unlikeMutation.isPending}
        >
          <X size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const isLoading = activeTab === 'incoming' ? isLoadingIncoming : isLoadingSent;

  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'incoming' && styles.activeTab]}
            onPress={() => setActiveTab('incoming')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'incoming' ? colors.primary : colors.textSecondary }
            ]}>Likes You</Text>
            {activeTab === 'incoming' && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'sent' ? colors.primary : colors.textSecondary }
            ]}>Likes Sent</Text>
            {activeTab === 'sent' && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
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
          data={displayedIncoming}
          renderItem={renderIncomingItem}
          keyExtractor={(item) => item.user.id}
          numColumns={3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (hasNextIncoming && !isFetchingNextPageIncoming) {
              fetchNextIncoming();
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing to see yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>When people like you, they'll appear here.</Text>
            </View>
          }
          ListFooterComponent={
            <View>
              {isFetchingNextPageIncoming && (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} />
              )}
              <View style={styles.premiumFooter}>
                <View style={styles.premiumCardContainer}>
                  <LinearGradient colors={[colors.primary, '#db2777']} style={styles.premiumCard}>
                    <View style={styles.premiumBadge}><Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>X4</Text></View>
                    <Text style={[styles.premiumTitle, { color: 'white' }]}>Premium</Text>
                    <Text style={[styles.premiumSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>See who likes you</Text>
                  </LinearGradient>
                </View>
                {!isUnlocked && (
                  <View style={styles.ctaSection}>
                    <Text style={[styles.ctaTitle, { color: colors.text }]}>Want to get more likes?</Text>
                    <Text style={[styles.ctaSubtitle, { color: colors.textSecondary }]}>Premium members get x4 more likes daily than regular users.</Text>
                    <Button title="Upgrade to Premium" onPress={() => setShowSubscription(true)} style={styles.ctaButton} />
                  </View>
                )}
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
          onEndReached={() => {
            if (hasNextSent && !isFetchingNextPageSent) {
              fetchNextSent();
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing to see yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>You haven't liked anyone yet. Start swiping!</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPageSent ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} />
            ) : null
          }
        />
      )}
      <SubscriptionModal
        isVisible={showSubscription}
        onClose={() => setShowSubscription(false)}
        initialPlanId="premium"
      />
      {isDetailMode && selectedProfile && (
        <ExpandedProfileModal
          profile={selectedProfile}
          onClose={() => setIsDetailMode(false)}
          onLike={() => handleAction('LIKE')}
          onDislike={() => handleAction('DISLIKE')}
          onCrush={() => handleAction('CRUSH')}
          showActions={true}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 9,
    marginRight: spacing.lg,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
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
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 16,
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
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  sentItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: spacing.sm + spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
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
  },
  sentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  sentName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sentTime: {
    fontSize: 14,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  premiumSubtitle: {
    fontSize: 16,
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  ctaSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 30,
  },
});
