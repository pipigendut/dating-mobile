import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Heart, X, Star, RotateCcw } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Profile } from '../../../data/mockProfiles';
import { swipeService, UserSwipeProfileResponse } from '../../../services/api/swipe';
import ProfileCard from './ProfileCard';
import ExpandedProfileModal from './ExpandedProfileModal';
import MatchModal from './MatchModal';
import { useUserStore } from '../../../store/useUserStore';

interface SwipeCardsProps {
  filters?: {
    distance: number;
    showMeOnly: boolean;
    ageRange: number[];
    gender: string[];
    heightRange?: number[];
    lookingFor?: string[];
    interests?: string[];
  };
  isDetailMode: boolean;
  setIsDetailMode: (mode: boolean) => void;
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
    interests: [], // To be populated later when backend includes them in response
    photos: u.photos && u.photos.length > 0
      ? u.photos.sort((a,b)=>a.sort_order - b.sort_order).map(p => p.url)
      : ['https://images.unsplash.com/photo-1544723795-3fb6469f5b39'], // Fallback image
    verified: true, // Assuming default true right now
    isPlusMember: false,
    gender: 'other', // Update later if backend sends gender
  };
};

export default function SwipeCards({ filters, isDetailMode, setIsDetailMode }: SwipeCardsProps) {
  const swiperRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = React.useState<Profile | null>(null);
  const [matchData, setMatchData] = React.useState<{ isVisible: boolean, matchedUser: Profile | null }>({
    isVisible: false,
    matchedUser: null,
  });
  const { userData } = useUserStore();
  const userPhoto = userData.photos && userData.photos.length > 0 ? userData.photos[0].url : undefined;

  // 1. Fetch live candidates
  const { data: candidatesResponse, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['swipeCandidates'],
    queryFn: swipeService.getCandidates,
  });

  // Convert array
  const profiles: Profile[] = candidatesResponse ? candidatesResponse.map(mapUserToProfile) : [];

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
    },
    onError: (err) => {
      console.error('Swipe error:', err);
    }
  });

  const undoMutation = useMutation({
    mutationFn: swipeService.undoLastSwipe,
    onSuccess: (undoneUser) => {
      Alert.alert('Undo Success', `Restored ${undoneUser.full_name} back to the deck`);
      refetch(); // Reload deck to see the undone user at the top
    },
    onError: (err: any) => {
      Alert.alert('Cannot Undo', err?.response?.data?.message || 'Daily limit reached or no swipe history.');
    }
  });

  if (isLoading || (isFetching && profiles.length === 0)) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.emptyTitle}>Finding perfect matches...</Text>
      </View>
    );
  }

  if (isError || (profiles.length === 0 && !isFetching)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptySubtitle}>Check back later for new people!</Text>
        <TouchableOpacity style={{marginTop: 20}} onPress={() => refetch()}>
          <Text style={{color: '#ef4444', fontWeight: 'bold'}}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSwipeAll = () => {
    setIsDetailMode(false);
    refetch(); // Automatically fetch more when exhausted
  };

  const handleSwipeAction = (index: number, direction: 'LIKE' | 'DISLIKE' | 'CRUSH') => {
    const swipedProfile = profiles[index];
    if (swipedProfile) {
      swipeMutation.mutate({ swipedId: swipedProfile.id, direction });
    }
    setIsDetailMode(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.swiperContainer}>
        <Swiper
          key={profiles.length > 0 ? `${profiles[0].id}_${profiles.length}` : 'empty'} // Force re-render on deck refresh
          ref={swiperRef}
          cards={profiles}
          renderCard={(card) => card ? <ProfileCard profile={card} onToggleDetail={() => {
            setSelectedProfile(card);
            setIsDetailMode(true);
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
      </View>

      {isDetailMode && selectedProfile && (
        <ExpandedProfileModal
          profile={selectedProfile}
          onClose={() => setIsDetailMode(false)}
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
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dislikeButton]}
          onPress={() => {
            if (swiperRef.current) swiperRef.current.swipeLeft();
            setIsDetailMode(false);
          }}
        >
          <X size={32} color="#ef4444" strokeWidth={3} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rewindButton]}
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
    backgroundColor: 'white',
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
    borderColor: '#eee',
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
});
