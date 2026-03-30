import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import { MapPin, CheckCircle2, ChevronDown, Ruler, Heart, X, Star, Users } from 'lucide-react-native';
import { Profile } from '../../../data/mockProfiles';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';
import { DEFAULT_IMAGES } from '../../../shared/constants/images';
import { getImageSource } from '../../../shared/utils/image';
import { mapEntityToProfile } from '../../../utils/userMapper';

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
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const isGroup = profile.type === 'group';
  const members = profile.members || [];
  const memberCount = Math.min(members.length, 4);

  const maxPhotos = useMemo(() => {
    if (!isGroup) return profile.photos.length;
    let max = 1;
    members.slice(0, 4).forEach((member: any) => {
      const pCount = member.photos?.length || 1;
      if (pCount > max) max = pCount;
    });
    return max;
  }, [profile, members, isGroup]);

  const displayProfile = useMemo(() => {
    if (!isGroup) return profile;
    if (members.length > 0 && selectedTabIndex < members.length) {
      return mapEntityToProfile(members[selectedTabIndex]);
    }
    return profile;
  }, [profile, members, isGroup, selectedTabIndex]);

  useEffect(() => {
    const backAction = () => {
      onClose();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [onClose]);

  const handleNextPhoto = () => {
    if (currentPhotoIndex < maxPhotos - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  const getMemberPhotoAt = (member: any, index: number) => {
    const photos = member?.photos || [];
    if (photos.length === 0) return DEFAULT_IMAGES.SWIPE_PLACEHOLDER;
    const safeIndex = Math.min(index, photos.length - 1);
    return photos[safeIndex].url || DEFAULT_IMAGES.SWIPE_PLACEHOLDER;
  };

  const renderGroupGrid = () => {
    if (memberCount === 2) {
      return (
        <View style={styles.gridContainerRow}>
          <View style={styles.flex1}>
            <Image source={getImageSource(getMemberPhotoAt(members[0], currentPhotoIndex))} style={styles.gridImage} />
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.flex1}>
            <Image source={getImageSource(getMemberPhotoAt(members[1], currentPhotoIndex))} style={styles.gridImage} />
          </View>
        </View>
      );
    }

    if (memberCount === 3) {
      return (
        <View style={styles.gridContainerColumn}>
          <View style={styles.gridContainerRow}>
            <View style={styles.flex1}>
              <Image source={getImageSource(getMemberPhotoAt(members[0], currentPhotoIndex))} style={styles.gridImage} />
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.flex1}>
              <Image source={getImageSource(getMemberPhotoAt(members[1], currentPhotoIndex))} style={styles.gridImage} />
            </View>
          </View>
          <View style={styles.dividerHorizontal} />
          <View style={styles.flex1}>
            <Image source={getImageSource(getMemberPhotoAt(members[2], currentPhotoIndex))} style={styles.gridImage} />
          </View>
        </View>
      );
    }

    if (memberCount >= 4) {
      return (
        <View style={styles.gridContainerColumn}>
          <View style={styles.gridContainerRow}>
            <View style={styles.flex1}>
              <Image source={getImageSource(getMemberPhotoAt(members[0], currentPhotoIndex))} style={styles.gridImage} />
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.flex1}>
              <Image source={getImageSource(getMemberPhotoAt(members[1], currentPhotoIndex))} style={styles.gridImage} />
            </View>
          </View>
          <View style={styles.dividerHorizontal} />
          <View style={styles.gridContainerRow}>
            <View style={styles.flex1}>
              <Image source={getImageSource(getMemberPhotoAt(members[2], currentPhotoIndex))} style={styles.gridImage} />
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.flex1}>
              <Image source={getImageSource(getMemberPhotoAt(members[3], currentPhotoIndex))} style={styles.gridImage} />
            </View>
          </View>
        </View>
      );
    }

    return (
      <Image source={getImageSource(getMemberPhotoAt(members[0] || {}, currentPhotoIndex))} style={styles.gridImage} />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenWithHeader style={{ marginTop: 0 }} withBorder={false}>
        <View style={[styles.topHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.topHeaderNameRow}>
            {profile.type === 'group' ? (
              <>
                <Text style={[styles.topHeaderName, { color: colors.text }]}>{profile.name}</Text>
                <View style={[styles.memberBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Users size={16} color={colors.primary} />
                  <Text style={[styles.memberCountText, { color: colors.primary }]}>{profile.members?.length || 0}</Text>
                </View>
              </>
            ) : (
              <Text style={[styles.topHeaderName, { color: colors.text }]}>{profile.name}, {profile.age}</Text>
            )}
            {profile.type !== 'group' && !profile.verifiedAt && (
              <CheckCircle2 size={20} color="#3b82f6" fill="#e8e8e8ff" />
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
          {isGroup ? (
            <View style={styles.gridWrapper}>
              {renderGroupGrid()}
            </View>
          ) : (
            <Image
              source={getImageSource(profile.photos[currentPhotoIndex])}
              style={styles.image}
            />
          )}

          {/* Touch navigation areas overlaid on photo */}
          {maxPhotos > 1 && (
            <View style={styles.navContainer}>
              <TouchableOpacity style={styles.navArea} onPress={handlePrevPhoto} activeOpacity={1} />
              <TouchableOpacity style={styles.navArea} onPress={handleNextPhoto} activeOpacity={1} />
            </View>
          )}

          {/* Indicators Overlay */}
          {maxPhotos > 1 && (
            <View style={styles.indicators}>
              {Array.from({ length: maxPhotos }).map((_, index) => (
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

        {/* Tab Row for Group Members */}
        {isGroup && members.length > 0 && (
          <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
            {members.slice(0, 4).map((member: any, index: number) => {
              const isActive = selectedTabIndex === index;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.tabItem,
                    isActive && { borderBottomColor: colors.primary, borderBottomWidth: 3 }
                  ]}
                  onPress={() => setSelectedTabIndex(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.tabText,
                    { color: isActive ? colors.text : colors.textSecondary },
                    isActive && { fontWeight: '700' }
                  ]}>
                    {member.full_name?.split(' ')[0]}'s details
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Row 3+: Details Section */}
        <View style={[styles.detailSection, { backgroundColor: colors.background }]}>
          {/* Explicit Name/Age header below tabs */}
          {isGroup && displayProfile.name && (
            <View style={styles.memberHeaderContainer}>
              <View style={styles.memberHeaderRow}>
                <Text style={[styles.memberHeaderName, { color: colors.text }]}>{displayProfile.name}, {displayProfile.age}</Text>
                {displayProfile.verified && (
                  <CheckCircle2 size={24} color="#3b82f6" fill="#e8e8e8ff" />
                )}
              </View>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
            <View style={styles.detailValueRow}>
              <MapPin size={18} color={colors.textSecondary} />
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {displayProfile.location?.distance || 0} km away • {displayProfile.location?.city || ''}{displayProfile.location?.country ? `, ${displayProfile.location.country}` : ''}
              </Text>
            </View>
          </View>

          {displayProfile.height > 0 && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Physical</Text>
              <View style={styles.detailValueRow}>
                <Ruler size={18} color={colors.textSecondary} />
                <Text style={[styles.detailValue, { color: colors.text }]}>{displayProfile.height} cm</Text>
              </View>
            </View>
          )}

          {displayProfile.bio ? (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>About</Text>
              <View style={[styles.bioContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.bioText, { color: colors.textSecondary }]}>{displayProfile.bio}</Text>
              </View>
            </View>
          ) : null}

          {displayProfile.interests && displayProfile.interests.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Interests</Text>
              <View style={styles.tagContainer}>
                {displayProfile.interests.map((interest: string, index: number) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.border }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {displayProfile.lookingFor && displayProfile.lookingFor.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Looking For</Text>
              <View style={styles.tagContainer}>
                {displayProfile.lookingFor.map((item: string, index: number) => (
                  <View key={index} style={[styles.tag, styles.lookingTag]}>
                    <Text style={styles.lookingTagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {displayProfile.languages && displayProfile.languages.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Languages</Text>
              <View style={styles.tagContainer}>
                {displayProfile.languages.map((language: string, index: number) => (
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
  gridWrapper: {
    width: width,
    height: width * 1.25,
    overflow: 'hidden',
  },
  gridContainerRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridContainerColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  flex1: {
    flex: 1,
  },
  dividerVertical: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerHorizontal: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  image: {
    width: width,
    height: width * 1.25, // 4:5 aspect ratio
    resizeMode: 'cover',
  },
  gridImage: {
    width: '100%',
    height: '100%',
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
  memberHeaderContainer: {
    marginBottom: 24,
  },
  memberHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberHeaderName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
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
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  memberCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  membersGrid: {
    gap: 12,
  },
  memberListItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  memberSmallPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  memberAge: {
    fontSize: 14,
  },
  memberDetailButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 4,
  },
  memberDetailBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
