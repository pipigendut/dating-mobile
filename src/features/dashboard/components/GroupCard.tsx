import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Users, ArrowUp } from 'lucide-react-native';
import { useTheme } from '../../../shared/hooks/useTheme';

const { width, height: screenHeight } = Dimensions.get('window');
const CARD_HEIGHT = screenHeight * 0.7;

interface GroupCardProps {
  profile: any; // Mapped group profile
  onToggleDetail?: (isDetailMode: boolean, config?: { hideActions?: boolean }) => void;
}

export default function GroupCard({ profile, onToggleDetail }: GroupCardProps) {
  const { colors } = useTheme();
  const members = profile.members || [];
  const memberCount = Math.min(members.length, 4);

  const getMemberPhoto = (member: any) => {
    return (member.photos?.find((p: any) => p.is_main) || member.photos?.[0])?.url || 
           'https://images.unsplash.com/photo-1544723795-3fb6469f5b39';
  };

  const renderLayout = () => {
    if (memberCount === 2) {
      return (
        <View style={styles.gridContainerRow}>
           <View style={styles.flex1}>
              <Image source={{ uri: getMemberPhoto(members[0]) }} style={styles.image} />
           </View>
           <View style={styles.dividerVertical} />
           <View style={styles.flex1}>
              <Image source={{ uri: getMemberPhoto(members[1]) }} style={styles.image} />
           </View>
        </View>
      );
    }

    if (memberCount === 3) {
      return (
        <View style={styles.gridContainerColumn}>
          <View style={styles.gridContainerRow}>
             <View style={styles.flex1}>
                <Image source={{ uri: getMemberPhoto(members[0]) }} style={styles.image} />
             </View>
             <View style={styles.dividerVertical} />
             <View style={styles.flex1}>
                <Image source={{ uri: getMemberPhoto(members[1]) }} style={styles.image} />
             </View>
          </View>
          <View style={styles.dividerHorizontal} />
          <View style={styles.flex1}>
             <Image source={{ uri: getMemberPhoto(members[2]) }} style={styles.image} />
          </View>
        </View>
      );
    }

    if (memberCount >= 4) {
      return (
        <View style={styles.gridContainerColumn}>
          <View style={styles.gridContainerRow}>
             <View style={styles.flex1}>
                <Image source={{ uri: getMemberPhoto(members[0]) }} style={styles.image} />
             </View>
             <View style={styles.dividerVertical} />
             <View style={styles.flex1}>
                <Image source={{ uri: getMemberPhoto(members[1]) }} style={styles.image} />
             </View>
          </View>
          <View style={styles.dividerHorizontal} />
          <View style={styles.gridContainerRow}>
             <View style={styles.flex1}>
                <Image source={{ uri: getMemberPhoto(members[2]) }} style={styles.image} />
             </View>
             <View style={styles.dividerVertical} />
             <View style={styles.flex1}>
                <Image source={{ uri: getMemberPhoto(members[3]) }} style={styles.image} />
             </View>
          </View>
        </View>
      );
    }

    // Default or 1 member
    return (
      <Image source={{ uri: getMemberPhoto(members[0] || {}) }} style={styles.image} />
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]} collapsable={false}>
      {/* Grid Photo Section */}
      <View style={styles.photoSection} collapsable={false}>
        {renderLayout()}

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
                <Text style={styles.name} numberOfLines={1}>{profile.name}</Text>
                <View style={styles.memberBadge}>
                   <Users size={14} color="white" />
                   <Text style={styles.memberCountText}>{members.length}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.openDetailButton}
                onPressIn={() => onToggleDetail?.(true, { hideActions: true })}
                activeOpacity={0.8}
              >
                <ArrowUp size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.locationRow}>
              <MapPin size={18} color="white" />
              <Text style={styles.locationText}>
                Double Date • {profile.location.city}
              </Text>
            </View>

            <Text style={styles.bioText} numberOfLines={2}>
              {profile.bio}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.detailClickArea}
          onPress={() => onToggleDetail?.(true, { hideActions: true })}
          activeOpacity={1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
  },
  photoSection: {
    height: CARD_HEIGHT,
    position: 'relative',
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
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
    zIndex: 11,
  },
  infoWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
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
    gap: 8,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  memberCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 5,
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  bioText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  openDetailButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailClickArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
});
