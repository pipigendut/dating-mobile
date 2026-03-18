import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, CheckCircle, ChevronDown, Ruler, Heart, Star } from 'lucide-react-native';
import { Profile } from '../../../data/mockProfiles';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { colors } from '../../../shared/theme/theme';

const { width } = Dimensions.get('window');

interface Props {
  profile: Profile;
  onClose: () => void;
}
export default function ExpandedProfileModal({ profile, onClose }: Props) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleNextPhoto = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenWithHeader style={{ marginTop: 0 }} withBorder={false}>
        <View style={styles.topHeader}>
          <View style={styles.topHeaderNameRow}>
            <Text style={styles.topHeaderName}>{profile.name}, {profile.age}</Text>
            {profile.verified && (
              <CheckCircle size={20} color={colors.primary} fill={colors.white} />
            )}
          </View>
          <TouchableOpacity style={styles.topHeaderBackButton} onPress={onClose} activeOpacity={0.8}>
            <ChevronDown size={28} color="#111827" />
          </TouchableOpacity>
        </View>
      </ScreenWithHeader>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Row 2: Photos Stack & Nav Area */}
        <View style={styles.photosContainer}>
          <Image
            source={{ uri: profile.photos[currentPhotoIndex] }}
            style={styles.image}
          />

          {/* Touch navigation areas overlaid on photo */}
          {profile.photos.length > 1 && (
            <View style={styles.navContainer}>
              <TouchableOpacity style={styles.navArea} onPress={handlePrevPhoto} activeOpacity={1} />
              <TouchableOpacity style={styles.navArea} onPress={handleNextPhoto} activeOpacity={1} />
            </View>
          )}

          {/* Indicators Overlay */}
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
        </View>

        {/* Row 3+: Details Section */}
        <View style={styles.detailSection}>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location</Text>
            <View style={styles.detailValueRow}>
              <MapPin size={18} color="#6b7280" />
              <Text style={styles.detailValue}>
                {profile.location.distance} km away • {profile.location.city}, {profile.location.country}
              </Text>
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

          {profile.lookingFor && profile.lookingFor.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Looking For</Text>
              <View style={styles.tagContainer}>
                {profile.lookingFor.map((item, index) => (
                  <View key={index} style={[styles.tag, styles.lookingTag]}>
                    <Text style={styles.lookingTagText}>{item}</Text>
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
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 100, // Make sure it sits above the swiper cards
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photosContainer: {
    width: '100%',
    position: 'relative',
    marginTop: 0,
  },
  image: {
    width: width,
    height: width * 1.25, // 4:5 aspect ratio
    resizeMode: 'cover',
  },
  topHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  topHeaderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topHeaderName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  topHeaderBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
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
  detailSection: {
    padding: 24,
    backgroundColor: '#fff',
  },
  detailItem: {
    marginBottom: 24,
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
    lineHeight: 24,
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
    height: 80, // Keep space for the action buttons at the bottom overlapping it
  },
});
