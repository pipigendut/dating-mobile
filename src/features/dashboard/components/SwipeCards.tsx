import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Heart, X, Star, RotateCcw } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Profile } from '../../../data/mockProfiles';
import { swipeService, SwipeFilter } from '../../../services/api/swipe';
import ProfileCard from './ProfileCard';
import GroupCard from './GroupCard';
import ExpandedProfileModal from './ExpandedProfileModal';
import MatchModal from './MatchModal';
import { useUserStore } from '../../../store/useUserStore';
import { useToastStore } from '../../../store/useToastStore';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useGroupStore } from '../../../store/useGroupStore';
import { mapEntityToProfile } from '../../../utils/userMapper';
import { useNavigation } from '@react-navigation/native';
import { chatApi } from '../../../services/api/chat';

interface SwipeCardsProps {
  filters?: {
    distance: number;
    showMeOnly: boolean;
    ageRange: number[];
    gender: string[];
    heightRange?: number[];
    lookingFor?: string[];
    interests?: string[];
    explorerMode?: boolean;
    latitude?: number;
    longitude?: number;
  };
  isDetailMode: boolean;
  setIsDetailMode: (mode: boolean) => void;
  onOpenSubscription?: () => void;
  entityType: 'user' | 'group'; // Which deck to load
}

export default function SwipeCards({ filters, isDetailMode, setIsDetailMode, onOpenSubscription, entityType }: SwipeCardsProps) {
  const navigation = useNavigation<any>();
  const swiperRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = React.useState<Profile | null>(null);
  const [matchData, setMatchData] = React.useState<{ isVisible: boolean, matchedUser: Profile | null, matchedUserId?: string }>({
    isVisible: false,
    matchedUser: null,
    matchedUserId: undefined,
  });
  const [deckKey, setDeckKey] = React.useState(0);
  const [swipedIds, setSwipedIds] = React.useState<Set<string>>(new Set());
  const [hideActionsInDetail, setHideActionsInDetail] = React.useState(false);
  const { userData } = useUserStore();
  const { colors, isDark } = useTheme();
  const userPhoto = (userData.photos?.find(p => p.isMain) || userData.photos?.[0])?.url;

  const { group } = useGroupStore();
  const swiperEntityId = entityType === 'user' ? userData.entityId : group?.entity_id;

  // Reset deck when filters, entity type, profile, or swiperEntityId changes
  useEffect(() => {
    console.log('[SwipeCards] Refreshing deck due to filter/entityType/profile update');
    setSwipedIds(new Set());
    setDeckKey(prev => prev + 1);
  }, [userData.updatedAt, filters, entityType, swiperEntityId]);

  // Fetch live candidates — keyed by entityType so each tab has its own cache
  const { data: candidatesResponse, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['swipeCandidates', entityType, swiperEntityId, filters, userData.latitude, userData.longitude, userData.updatedAt],
    queryFn: () => {
      if (!swiperEntityId) return [];

      const apiFilter: SwipeFilter = {
        swiper_entity_id: swiperEntityId,
        distance: filters?.distance,
        min_age: filters?.ageRange?.[0],
        max_age: filters?.ageRange?.[1],
        genders: filters?.gender,
        interests: filters?.interests,
        relationship_types: filters?.lookingFor,
        latitude: filters?.explorerMode && filters?.latitude ? filters.latitude : userData.latitude,
        longitude: filters?.explorerMode && filters?.longitude ? filters.longitude : userData.longitude,
        min_height: filters?.heightRange?.[0],
        max_height: filters?.heightRange?.[1],
        entity_type: entityType,
      };
      return swipeService.getCandidates(apiFilter);
    },
    enabled: !!swiperEntityId,
  });

  // Convert and filter locally swiped IDs to prevent reappearance during race conditions
  const profiles: Profile[] = React.useMemo(() => {
    const list = candidatesResponse ? candidatesResponse.map(mapEntityToProfile).filter(Boolean) : [];
    return list.filter(p => !swipedIds.has(p.id));
  }, [candidatesResponse, swipedIds]);

  const swipeMutation = useMutation({
    mutationFn: ({ swipedId, direction }: { swipedId: string, direction: 'LIKE' | 'DISLIKE' | 'CRUSH' }) => {
      if (!swiperEntityId) throw new Error('No swiper entity ID');
      return swipeService.swipe(swiperEntityId, swipedId, direction);
    },
    onSuccess: (data, variables) => {
      if (variables.direction === 'CRUSH') {
        useUserStore.getState().decrementConsumable('crush', 1);
      }

      if (data.is_match && data.matched_entity) {
        setMatchData({
          isVisible: true,
          matchedUser: mapEntityToProfile(data.matched_entity),
          matchedUserId: data.matched_entity.id,
        });
      }

      if (profiles.length === 0) {
        setDeckKey(prev => prev + 1);
        refetch();
      }
    },
    onError: (err: any, variables: { swipedId: string; direction: 'LIKE' | 'DISLIKE' | 'CRUSH' }) => {
      console.error('Swipe error:', err);

      setSwipedIds(prev => {
        const next = new Set(prev);
        next.delete(variables.swipedId);
        return next;
      });

      setTimeout(() => {
        if (swiperRef.current) {
          swiperRef.current.swipeBack();
        }
      }, 50);

      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to record swipe';
      const showToast = useToastStore.getState().showToast;
      showToast(msg, 'error');
    }
  });

  const handleSwipeAll = () => {
    setIsDetailMode(false);
  };

  const handleRefresh = () => {
    setSwipedIds(new Set());
    setDeckKey(prev => prev + 1);
    refetch();
  };

  const handleSwipeAction = (index: number, direction: 'LIKE' | 'DISLIKE' | 'CRUSH') => {
    const swipedProfile = profiles[index];
    if (swipedProfile) {
      setSwipedIds(prev => new Set(prev).add(swipedProfile.id));
      swipeMutation.mutate({ swipedId: swipedProfile.id, direction });
    }
    setIsDetailMode(false);
  };

  const emptyMessage = entityType === 'group'
    ? 'No double date groups nearby'
    : 'No more profiles';
  const emptySubtitle = entityType === 'group'
    ? 'Check back later or create your own group!'
    : 'Check back later for new people!';

  return (
    <View style={styles.container}>
      <View style={styles.swiperContainer}>
        {isLoading || (isFetching && profiles.length === 0) ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#ef4444" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Finding perfect matches...</Text>
          </View>
        ) : isError || (profiles.length === 0 && !isFetching) ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{emptyMessage}</Text>
            <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Swiper
            key={`deck_${entityType}_${deckKey}_${profiles.length > 0 ? profiles[0].id : 'empty'}`}
            ref={swiperRef}
            cards={profiles}
            renderCard={(card) => {
              if (!card) return null;
              if (card.type === 'group') {
                return (
                  <GroupCard
                    profile={card}
                    onToggleDetail={(mode, config) => {
                      setSelectedProfile(card);
                      setHideActionsInDetail(!!config?.hideActions);
                      setIsDetailMode(mode);
                    }}
                  />
                );
              }
              return (
                <ProfileCard
                  profile={card}
                  onToggleDetail={(mode, config) => {
                    setSelectedProfile(card);
                    setHideActionsInDetail(!!config?.hideActions);
                    setIsDetailMode(mode);
                  }}
                />
              );
            }}
            onSwipedLeft={(index) => handleSwipeAction(index, 'DISLIKE')}
            onSwipedRight={(index) => handleSwipeAction(index, 'LIKE')}
            onSwipedTop={(index) => handleSwipeAction(index, 'CRUSH')}
            onSwipedAll={handleSwipeAll}
            disableLeftSwipe={isDetailMode}
            disableRightSwipe={isDetailMode}
            disableTopSwipe={isDetailMode}
            disableBottomSwipe={true}
            cardIndex={0}
            backgroundColor={'transparent'}
            stackSize={1}
            showSecondCard={false}
            stackSeparation={0}
            overlayLabels={{
              left: {
                title: 'NOPE',
                style: {
                  label: {
                    backgroundColor: 'transparent',
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    borderWidth: 4,
                    fontSize: 32,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30,
                  },
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    backgroundColor: 'transparent',
                    borderColor: '#22c55e',
                    color: '#22c55e',
                    borderWidth: 4,
                    fontSize: 32,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30,
                  },
                },
              },
              top: {
                title: 'CRUSH',
                style: {
                  label: {
                    backgroundColor: 'transparent',
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    borderWidth: 4,
                    fontSize: 32,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 80,
                  },
                },
              },
            }}
            animateOverlayLabelsOpacity
            animateCardOpacity
            swipeBackCard
          />
        )}
      </View>

      {isDetailMode && selectedProfile && (
        <ExpandedProfileModal
          profile={selectedProfile}
          onClose={() => setIsDetailMode(false)}
          onLike={() => swiperRef.current?.swipeRight()}
          onDislike={() => swiperRef.current?.swipeLeft()}
          onCrush={() => swiperRef.current?.swipeTop()}
          showActions={false}
        />
      )}

      {matchData.isVisible && matchData.matchedUser && (
        <MatchModal
          isVisible={matchData.isVisible}
          onClose={() => setMatchData({ ...matchData, isVisible: false })}
          userPhoto={userPhoto}
          matchedUserPhoto={matchData.matchedUser.photos[0]}
          matchedUserName={matchData.matchedUser.name}
          onSendMessage={async () => {
            setMatchData({ ...matchData, isVisible: false });
            if (!matchData.matchedUserId) return;
            try {
              const res = await chatApi.getOrCreateMatchConversation(matchData.matchedUserId);
              const conv = (res as any).data || res;
              navigation.navigate('ChatDetail', {
                conversationId: conv.id,
                participantName: matchData.matchedUser?.name || '',
                participantPhoto: matchData.matchedUser?.photos[0] || '',
                participantId: matchData.matchedUserId,
                isVerified: false,
              });
            } catch (e) {
              console.error('Failed to open chat', e);
            }
          }}
        />
      )}

      {/* Action Buttons */}
      {profiles.length > 0 && !isLoading && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.dislikeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              if (swiperRef.current) swiperRef.current.swipeLeft();
              setIsDetailMode(false);
            }}
          >
            <X size={32} color="#ef4444" strokeWidth={3} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.rewindButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              if (swiperRef.current) swiperRef.current.swipeBack();
            }}
          >
            <RotateCcw size={20} color={colors.textSecondary} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.crushButton]}
            onPress={() => {
              if (swiperRef.current) swiperRef.current.swipeTop();
              setIsDetailMode(false);
            }}
          >
            <Star size={24} color="white" fill="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.likeButton]}
            onPress={() => {
              if (swiperRef.current) swiperRef.current.swipeRight();
              setIsDetailMode(false);
            }}
          >
            <Heart size={32} color="white" fill="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiperContainer: {
    flex: 1,
    marginTop: -40,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    gap: 15,
    zIndex: 100,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dislikeButton: {
    width: 65,
    height: 65,
    borderWidth: 1,
  },
  rewindButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
  },
  crushButton: {
    width: 50,
    height: 50,
    backgroundColor: '#3b82f6',
  },
  likeButton: {
    width: 65,
    height: 65,
    backgroundColor: '#ef4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
