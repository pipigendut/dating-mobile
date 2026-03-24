import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Camera, X, Plus, Loader2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../../shared/components/ui/Button';
import { OnboardingHeader } from '../../../shared/components/ui/OnboardingHeader';
import { compressImage } from '../../../shared/utils/imageCompressor';
import { UserData, UserPhoto } from '../../../shared/types/user';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepPhotosProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepPhotos({ userData, onNext }: StepPhotosProps) {
  const { colors, isDark } = useTheme();
  const [photos, setPhotos] = useState<UserPhoto[]>(userData.photos || []);
  const [isUploading, setIsUploading] = useState(false);

  // Upload logic removed to be handled at the final registration step

  const handlePhotoResult = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (photos.length < 6) {
        setIsUploading(true);
        try {
          const compressedUri = await compressImage(result.assets[0].uri);
          setPhotos([...photos, { url: compressedUri, isMain: photos.length === 0 }]);
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to continue.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1, // ImageManipulator will handle the compression
    });
    handlePhotoResult(result);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permission to take pictures.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });
    handlePhotoResult(result);
  };

  const showPhotoOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    if (photos[index].isMain && newPhotos.length > 0) {
      newPhotos[0].isMain = true;
    }
    setPhotos(newPhotos);
  };

  const setMainPhoto = (index: number) => {
    setPhotos(photos.map((p, i) => ({ ...p, isMain: i === index })));
  };

  const handleSubmit = async () => {
    if (photos.length < 2) return;
    onNext({ photos });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <OnboardingHeader 
          Icon={Camera}
          title="Add Your Photos"
          subtitle="Upload at least 2 photos to continue"
        />

        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TouchableOpacity
              key={index}
              style={[styles.photoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={photos[index] ? undefined : showPhotoOptions}
              activeOpacity={0.7}
            >
              {photos[index] ? (
                <>
                  <Image source={{ uri: photos[index].url }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePhoto(index)}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                  {photos[index].isMain ? (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>Main</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.setMainBadge}
                      onPress={() => setMainPhoto(index)}
                    >
                      <Text style={styles.setMainBadgeText}>Set Main</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.emptyIconContainer}>
                  <Plus size={32} color={colors.textSecondary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.tipsContainer, { backgroundColor: isDark ? colors.surface : '#fff1f2', borderColor: isDark ? colors.border : '#fecaca' }]}>
          <Text style={[styles.tipsTitle, { color: isDark ? colors.text : '#991b1b' }]}>Tips:</Text>
          <Text style={[styles.tipsText, { color: isDark ? colors.textSecondary : '#991b1b' }]}>
            Use clear, recent photos that show your face. Avoid group photos for your main picture.
          </Text>
        </View>
      </ScrollView>

      <Button
        title={isUploading ? 'Uploading...' : `Continue (${photos.length}/2)`}
        onPress={handleSubmit}
        loading={isUploading}
        disabled={photos.length < 2 || isUploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 30,
  },
  photoBox: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  setMainBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  setMainBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'normal',
  },
  tipsContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
