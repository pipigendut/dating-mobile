import React, { useMemo } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { DEFAULT_IMAGES } from '../../../shared/constants/images';
import { getImageSource } from '../../../shared/utils/image';

interface GroupGridPhotoProps {
  members?: any[];
  photos?: string[];
  style?: any;
  blurRadius?: number;
}
 
export default function GroupGridPhoto({ members = [], photos, style, blurRadius }: GroupGridPhotoProps) {
  const displayPhotos = useMemo(() => {
    if (photos && photos.length > 0) return photos;
    return members.map(m => {
      const mPhotos = m?.photos || [];
      return mPhotos[0]?.url || DEFAULT_IMAGES.SWIPE_PLACEHOLDER;
    });
  }, [members, photos]);

  const photoCount = Math.min(displayPhotos.length, 4);
 
  const renderLayout = () => {
    if (photoCount === 2) {
      return (
        <View style={styles.gridContainerRow}>
          <View style={styles.flex1}>
            <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[0])} style={styles.image} />
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.flex1}>
            <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[1])} style={styles.image} />
          </View>
        </View>
      );
    }
 
    if (photoCount === 3) {
      return (
        <View style={styles.gridContainerColumn}>
          <View style={styles.gridContainerRow}>
            <View style={styles.flex1}>
              <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[0])} style={styles.image} />
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.flex1}>
              <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[1])} style={styles.image} />
            </View>
          </View>
          <View style={styles.dividerHorizontal} />
          <View style={styles.flex1}>
            <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[2])} style={styles.image} />
          </View>
        </View>
      );
    }
 
    if (photoCount >= 4) {
      return (
        <View style={styles.gridContainerColumn}>
          <View style={styles.gridContainerRow}>
            <View style={styles.flex1}>
              <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[0])} style={styles.image} />
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.flex1}>
              <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[1])} style={styles.image} />
            </View>
          </View>
          <View style={styles.dividerHorizontal} />
          <View style={styles.gridContainerRow}>
            <View style={styles.flex1}>
              <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[2])} style={styles.image} />
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.flex1}>
              <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[3])} style={styles.image} />
            </View>
          </View>
        </View>
      );
    }
 
    // Default or 1 photo
    return (
      <Image blurRadius={blurRadius} source={getImageSource(displayPhotos[0] || DEFAULT_IMAGES.SWIPE_PLACEHOLDER)} style={styles.image} />
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderLayout()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
