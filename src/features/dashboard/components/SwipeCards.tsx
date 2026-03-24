import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Heart, X, Star, RotateCcw } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Profile } from '../../../data/mockProfiles';
import { swipeService, UserSwipeProfileResponse, SwipeFilter } from '../../../services/api/swipe';
import ProfileCard from './ProfileCard';
import ExpandedProfileModal from './ExpandedProfileModal';
import MatchModal from './MatchModal';
import { useUserStore } from '../../../store/useUserStore';
import { useSubscriptionStatus } from '../../../services/api/monetization';
import { useToastStore } from '../../../store/useToastStore';
import { useTheme } from '../../../shared/hooks/useTheme';

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
}

// Convert backend response to local Profile interface
const mapUserToProfile = (u: UserSwipeProfileResponse): Profile => {
  return {
    id: u.id,
    name: u.full_name,
    age: u.age,
    location: { city: u.location_city, country: u.location_country, distance: 0 },
    height: u.height_cm,
    bio: u.bio,
    interests: u.interests?.map(i => `${i.icon || ''} ${i.name}`) || [],
    photos: u.photos && u.photos.length > 0
      ? u.photos.sort((a, b) => a.sort_order - b.sort_order).map(p => p.url)
      : ['https://images.unsplash.com/photo-1544723795-3fb6469f5b39'], // Fallback image
    verified: !!u.verified_at,
    isPlusMember: false,
    languages: u.languages?.map(l => l.name) || [],
    lookingFor: u.relationship_type ? [u.relationship_type.name] : [],
    gender: 'other', 
  };
};

export default function SwipeCards({ filters, isDetailMode, setIsDetailMode, onOpenSubscription }: SwipeCardsProps) {
  const swiperRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = React.useState<Profile | null>(null);
  const [matchData, setMatchData] = React.useState<{ isVisible: boolean, matchedUser: Profile | null }>({
    isVisible: false,
    matchedUser: null,
  });
  const [deckKey, setDeckKey] = React.useState(0);
  const [swipedIds, setSwipedIds] = React.useState<Set<string>>(new Set());
  const [hideActionsInDetail, setHideActionsInDetail] = React.useState(false);
  const { userData } = useUserStore();
  const { colors, isDark } = useTheme();
  const userPhoto = userData.photos && userData.photos.length > 0 ? userData.photos[0].url : undefined;

  // Reset deck and clear swiped cache when profile is updated OR filters change
  useEffect(() => {
    console.log('[SwipeCards] Refreshing deck due to filter or profile update');
    setSwipedIds(new Set());
    setDeckKey(prev => prev + 1);
  }, [userData.updatedAt, filters]);


  // 1. Fetch live candidates
  const { data: candidatesResponse, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['swipeCandidates', filters, userData.latitude, userData.longitude, userData.updatedAt],
    queryFn: () => {
      const apiFilter: SwipeFilter = {
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
      };
      return swipeService.getCandidates(apiFilter);
    },
  });

  // Convert array
  // Convert array and filter locally swiped IDs to prevent reappearance during race conditions
  const profiles: Profile[] = React.useMemo(() => {
    const list = candidatesResponse ? candidatesResponse.map(mapUserToProfile) : [];
    return list.filter(p => !swipedIds.has(p.id));
  }, [candidatesResponse, swipedIds]);

  // TODO: Implement advanced frontend filtering or refetch based on filters

  // 2. Mutations
  const swipeMutation = useMutation({
    mutationFn: ({ swipedId, direction }: { swipedId: string, direction: 'LIKE' | 'DISLIKE' | 'CRUSH' }) =>
      swipeService.swipe(swipedId, direction),
    onSuccess: (data) => {
      if (data.is_match && data.matched_user) {
        // Trigger Match UI
        setMatchData({
          isVisible: true,
          matchedUser: mapUserToProfile(data.matched_user),
        });
      }

      // If we just swiped the last card, now is the safe time to refetch candidates.
      // We check if the local filtered profiles list is now empty.
      if (profiles.length === 0) {
        setDeckKey(prev => prev + 1);
        refetch();
      }
    },
    onError: (err: any) => {
      console.error('Swipe error:', err);
      // Rewind the card in UI if backend failed
      if (swiperRef.current) {
        swiperRef.current.swipeBack();
      }

      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to record swipe';
      const showToast = useToastStore.getState().showToast;

      showToast(msg, 'error');
    }
  });

  const undoMutation = useMutation({
    mutationFn: swipeService.undoLastSwipe,
    onSuccess: (undoneUser) => {
      // Alert.alert('Undo Success', `Restored ${undoneUser.full_name} back to the deck`);
      refetch(); // Reload deck to see the undone user at the top
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || '';
      if (msg.includes('premium')) {
        Alert.alert(
          'Premium Feature',
          'Undo is exclusive to premium members. Upgrade now to never miss a match!',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Upgrade', onPress: onOpenSubscription }
          ]
        );
      } else {
        Alert.alert('Cannot Undo', msg || 'Only one undo allowed per swipe action.');
      }
    }
  });

  const handleSwipeAll = () => {
    setIsDetailMode(false);
    // Move refetch to swipeMutation.onSuccess to avoid race conditions with the last card
    // setDeckKey(prev => prev + 1);
    // refetch();
  };

  const handleRefresh = () => {
    setSwipedIds(new Set()); // Clear local filters on manual refresh
    setDeckKey(prev => prev + 1);
    refetch();
  };

  const handleSwipeAction = (index: number, direction: 'LIKE' | 'DISLIKE' | 'CRUSH') => {
    const swipedProfile = profiles[index];
    if (swipedProfile) {
      // Optimistically add to swipedIds to prevent reappearance if refetch() returns stale data
      setSwipedIds(prev => new Set(prev).add(swipedProfile.id));
      swipeMutation.mutate({ swipedId: swipedProfile.id, direction });
    }
    setIsDetailMode(false);
  };

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
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No more profiles</Text>
            <Text style={styles.emptySubtitle}>Check back later for new people!</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Swiper
            key={`deck_${deckKey}_${profiles.length > 0 ? profiles[0].id : 'empty'}`}
            ref={swiperRef}
            cards={profiles}
            renderCard={(card) => card ? <ProfileCard profile={card} onToggleDetail={(mode, config) => {
              setSelectedProfile(card);
              setHideActionsInDetail(!!config?.hideActions);
              setIsDetailMode(mode);
            }} /> : null}
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
            style={[styles.button, styles.rewindButton, { backgroundColor: colors.surface }]}
            onPress={() => {
              undoMutation.mutate();
              setIsDetailMode(false);
            }}
            disabled={undoMutation.isPending}
          >
            <RotateCcw size={24} color={undoMutation.isPending ? "#9ca3af" : "#facc15"} />
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
    zIndex: 100, // Ensure buttons stay on top of the modal
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
  rewindButton: {
    width: 50,
    height: 50,
  },
  dislikeButton: {
    width: 65,
    height: 65,
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
    color: '#111827',
    marginBottom: 10,
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
