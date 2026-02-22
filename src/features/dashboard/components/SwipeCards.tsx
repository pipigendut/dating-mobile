import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Heart, X, Star, RotateCcw } from 'lucide-react-native';
import { mockProfiles } from '../../../data/mockProfiles';
import ProfileCard from './ProfileCard';

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
}

export default function SwipeCards({ filters }: SwipeCardsProps) {
  const swiperRef = useRef(null);
  const [filteredProfiles, setFilteredProfiles] = React.useState(mockProfiles);

  React.useEffect(() => {
    if (!filters) {
      setFilteredProfiles(mockProfiles);
      return;
    }

    const filtered = mockProfiles.filter((profile) => {
      // Distance filter
      if (profile.location.distance && profile.location.distance > filters.distance) {
        return false;
      }

      // Gender filter
      if (filters.gender && filters.gender.length > 0 && !filters.gender.includes(profile.gender)) {
        return false;
      }

      // Age filter
      if (filters.ageRange && (profile.age < filters.ageRange[0] || profile.age > filters.ageRange[1])) {
        return false;
      }

      // Height filter
      if (filters.heightRange && (profile.height < filters.heightRange[0] || profile.height > filters.heightRange[1])) {
        return false;
      }

      // Looking For filter
      if (filters.lookingFor && filters.lookingFor.length > 0) {
        if (!profile.lookingFor || !profile.lookingFor.some(pref => filters.lookingFor.includes(pref))) {
          return false;
        }
      }

      // Interests filter
      if (filters.interests && filters.interests.length > 0) {
        if (!profile.interests || !profile.interests.some(profileInterest =>
          filters.interests!.some(filterInterest => profileInterest.includes(filterInterest))
        )) {
          return false;
        }
      }

      return true;
    });

    setFilteredProfiles(filtered);
  }, [filters]);

  if (filteredProfiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your filters to see more people!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.swiperContainer}>
        <Swiper
          key={JSON.stringify(filters)} // Force re-render when filters change to reset swiper
          ref={swiperRef}
          cards={filteredProfiles}
          renderCard={(card) => card ? <ProfileCard profile={card} /> : null}
          onSwipedLeft={(index) => console.log('Passed:', filteredProfiles[index]?.name)}
          onSwipedRight={(index) => console.log('Liked:', filteredProfiles[index]?.name)}
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
          }}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dislikeButton]}
          onPress={() => swiperRef.current.swipeLeft()}
        >
          <X size={32} color="#ef4444" strokeWidth={3} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rewindButton]}
          onPress={() => swiperRef.current.swipeBack()}
        >
          <RotateCcw size={24} color="#facc15" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.crushButton]}>
          <Star size={24} color="white" fill="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => swiperRef.current.swipeRight()}
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
