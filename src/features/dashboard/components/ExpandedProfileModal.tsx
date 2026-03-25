import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, CheckCircle2, ChevronDown, Ruler, Heart, X, Star } from 'lucide-react-native';
import { Profile } from '../../../data/mockProfiles';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';

const { width } = Dimensions.get('window');

interface Props {
  profile: Profile;
  onClose: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onCrush?: () => void;
  showActions?: boolean;
}
export default function ExpandedProfileModal({
  profile,
  onClose,
  onLike,
  onDislike,
  onCrush,
  showActions = true
}: Props) {
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
            {!profile.verifiedAt && (
              <CheckCircle2 size={20} color="#3b82f6" fill="white" />
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

      {/* Action Buttons - Fixed at bottom */}
      {showActions && (onLike || onDislike || onCrush) && (
        <View style={styles.buttonsWrapper}>
          <View style={styles.buttonsContainer}>
            {onDislike && (
              <TouchableOpacity
                style={[styles.button, styles.dislikeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={onDislike}
              >
                <X size={32} color="#ef4444" strokeWidth={3} />
              </TouchableOpacity>
            )}

            {onCrush && (
              <TouchableOpacity
                style={[styles.button, styles.crushButton]}
                onPress={onCrush}
              >
                <Star size={24} color="white" fill="white" />
              </TouchableOpacity>
            )}

            {onLike && (
              <TouchableOpacity
                style={[styles.button, styles.likeButton]}
                onPress={onLike}
              >
                <Heart size={32} color="white" fill="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100, // Make sure it sits above the swiper cards
  },
  scrollContent: {
    paddingBottom: 120, // More space for fixed buttons
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
    height: 20,
  },
  buttonsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
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
});
