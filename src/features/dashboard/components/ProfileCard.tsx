import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, CheckCircle, ChevronDown, ChevronUp, Ruler, Heart, Star, ArrowUp } from 'lucide-react-native';
import { Profile } from '../../../data/mockProfiles';

const { width, height: screenHeight } = Dimensions.get('window');
const CARD_HEIGHT = screenHeight * 0.7;

interface ProfileCardProps {
  profile: Profile;
  onToggleDetail?: (isDetailMode: boolean) => void;
}

export default function ProfileCard({ profile, onToggleDetail }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Reset index when profile changes, so swiped-in cards start at photo 0
  // and prefetch the other photos to avoid white screens
  useEffect(() => {
    setCurrentPhotoIndex(0);
    
    // Prefetch remaining photos for this profile
    if (profile.photos && profile.photos.length > 1) {
      profile.photos.slice(1).forEach((photoUrl) => {
        Image.prefetch(photoUrl).catch(console.error);
      });
    }
  }, [profile.id]);

  const nextPhoto = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <View style={styles.card} collapsable={false}>
      {/* Main Photo Section */}
      <View style={styles.photoSection} collapsable={false}>
        <Image
          key={profile.id}
          source={{ uri: profile.photos[currentPhotoIndex] }}
          style={styles.image}
        />

        {/* Photo indicators */}
        {profile.photos.length > 1 && (
          <View style={styles.indicators}>
            {profile.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentPhotoIndex ? styles.activeIndicator : styles.inactiveIndicator
                ]}
              />
            ))}
          </View>
        )}

        {/* Touch areas for photo navigation */}
        {profile.photos.length > 1 && (
          <View style={styles.navContainer} collapsable={false}>
            <TouchableOpacity style={styles.navArea} onPressIn={prevPhoto} activeOpacity={1} />
            <TouchableOpacity style={styles.navArea} onPressIn={nextPhoto} activeOpacity={1} />
          </View>
        )}

        <View pointerEvents="none" style={styles.gradient}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.infoWrapper} collapsable={false}>
          <View style={styles.basicInfo} collapsable={false}>
            <View style={styles.nameRow} collapsable={false}>
              <View style={styles.nameHeader}>
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{profile.name}, {profile.age}</Text>
                {profile.verified && (
                  <CheckCircle size={20} color="#3b82f6" fill="white" style={styles.verifiedIcon} />
                )}
              </View>
              <TouchableOpacity
                style={styles.openDetailButton}
                onPressIn={() => onToggleDetail?.(true)}
                activeOpacity={0.8}
              >
                <ArrowUp size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.locationRow}>
              <MapPin size={18} color="white" />
              <Text style={styles.locationText}>
                {profile.location.distance} km away • {profile.location.country}
              </Text>
            </View>

            {profile.lookingFor && profile.lookingFor.length > 0 && (
              <View style={styles.lookingForOverlay}>
                <Text style={styles.lookingForOverlayText}>
                  {profile.lookingFor.join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {profile.isPlusMember && (
          <View style={styles.plusBadge}>
            <Text style={styles.plusText}>⚡ PLUS MEMBER</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  photoSection: {
    height: CARD_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  indicators: {
    position: 'absolute',
    top: 15,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 5,
    zIndex: 20,
  },
  indicator: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  navContainer: {
    position: 'absolute',
    top: 0,
    bottom: '40%', // Leave bottom area entirely for button touches
    left: 0,
    right: 0,
    flexDirection: 'row',
    zIndex: 10,
  },
  navArea: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    zIndex: 11,
  },
  infoWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 24,
    zIndex: 12,
  },
  basicInfo: {
    marginBottom: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  name: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  verifiedIcon: {
    marginLeft: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 5,
  },
  locationText: {
    color: 'white',
    fontSize: 18,
    opacity: 0.9,
  },
  lookingForOverlay: {
    marginTop: 5,
    marginBottom: 10,
  },
  lookingForOverlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.95,
  },
  openDetailButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusBadge: {
    position: 'absolute',
    top: 10,
    left: 15,
    backgroundColor: 'rgba(147, 51, 234, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 20,
  },
  plusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
});
