import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, CheckCircle, ChevronDown, Ruler } from 'lucide-react-native';
import { Profile } from '../../../data/mockProfiles';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';

const { width } = Dimensions.get('window');

interface Props {
  profile: Profile;
  onClose: () => void;
}
export default function ExpandedProfileModal({ profile, onClose }: Props) {
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenWithHeader style={{ marginTop: 0 }} withBorder={false}>
        <View style={[styles.topHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.topHeaderNameRow}>
            <Text style={[styles.topHeaderName, { color: colors.text }]}>{profile.name}, {profile.age}</Text>
            {profile.verified && (
              <CheckCircle size={20} color="#3b82f6" fill="white" />
            )}
          </View>
          <TouchableOpacity 
            style={[styles.topHeaderBackButton, { backgroundColor: colors.border }]} 
            onPress={onClose} 
            activeOpacity={0.8}
          >
            <ChevronDown size={28} color={colors.text} />
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
        <View style={[styles.detailSection, { backgroundColor: colors.background }]}>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
            <View style={styles.detailValueRow}>
              <MapPin size={18} color={colors.textSecondary} />
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {profile.location.distance} km away • {profile.location.city}, {profile.location.country}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Physical</Text>
            <View style={styles.detailValueRow}>
              <Ruler size={18} color={colors.textSecondary} />
              <Text style={[styles.detailValue, { color: colors.text }]}>{profile.height} cm</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>About</Text>
            <View style={[styles.bioContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>{profile.bio}</Text>
            </View>
          </View>

          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Interests</Text>
              <View style={styles.tagContainer}>
                {profile.interests.map((interest, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.border }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profile.lookingFor && profile.lookingFor.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Looking For</Text>
              <View style={styles.tagContainer}>
                {profile.lookingFor.map((item, index) => (
                  <View key={index} style={[styles.tag, styles.lookingTag]}>
                    <Text style={styles.lookingTagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profile.languages && profile.languages.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Languages</Text>
              <View style={styles.tagContainer}>
                {profile.languages.map((language, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.border }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>{language}</Text>
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
  },
  topHeaderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topHeaderName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  topHeaderBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  },
  detailItem: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
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
    lineHeight: 24,
  },
  bioContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
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
