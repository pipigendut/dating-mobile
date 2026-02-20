import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, CheckCircle, ChevronDown, Ruler, Heart, Star } from 'lucide-react-native';
import { Profile } from '../../data/mockProfiles';

const { width, height: screenHeight } = Dimensions.get('window');
const CARD_HEIGHT = screenHeight * 0.7;

interface ProfileCardProps {
  profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
    <View style={styles.card}>
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Main Photo Section */}
        <View style={styles.photoSection}>
          <Image
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
            <View style={styles.navContainer}>
              <TouchableOpacity style={styles.navArea} onPress={prevPhoto} activeOpacity={1} />
              <TouchableOpacity style={styles.navArea} onPress={nextPhoto} activeOpacity={1} />
            </View>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <View style={styles.basicInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile.name}, {profile.age}</Text>
                {profile.verified && (
                  <CheckCircle size={20} color="#3b82f6" fill="white" style={styles.verifiedIcon} />
                )}
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

              <View style={styles.scrollHint}>
                <Text style={styles.scrollHintText}>Scroll for more info</Text>
                <ChevronDown size={20} color="white" />
              </View>
            </View>
          </LinearGradient>

          {profile.isPlusMember && (
            <View style={styles.plusBadge}>
              <Text style={styles.plusText}>⚡ PLUS MEMBER</Text>
            </View>
          )}
        </View>

        {/* Detail Section */}
        <View style={styles.detailSection}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{profile.name}'s Profile</Text>
            {profile.verified && <CheckCircle size={20} color="#3b82f6" fill="white" />}
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location</Text>
            <View style={styles.detailValueRow}>
              <MapPin size={18} color="#6b7280" />
              <Text style={styles.detailValue}>{profile.location.city}, {profile.location.country}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Physical</Text>
            <View style={styles.detailValueRow}>
              <Ruler size={18} color="#6b7280" />
              <Text style={styles.detailValue}>{profile.height} cm</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>About</Text>
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          </View>

          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Interests</Text>
              <View style={styles.tagContainer}>
                {profile.interests.map((interest, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}


          <View style={styles.spacer} />
        </View>
      </ScrollView>
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
    bottom: 0,
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
    justifyContent: 'flex-end',
    padding: 24,
  },
  basicInfo: {
    marginBottom: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
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
  scrollHint: {
    alignItems: 'center',
    opacity: 0.7,
    gap: 4,
  },
  scrollHintText: {
    color: 'white',
    fontSize: 12,
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
  detailSection: {
    minHeight: CARD_HEIGHT,
    backgroundColor: '#fff',
    padding: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailItem: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailValue: {
    fontSize: 16,
    color: '#374151',
  },
  bioContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  lookingTag: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  lookingTagText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  spacer: {
    height: 100,
  }
});
