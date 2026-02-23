import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Camera, X, Plus, Loader2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../../shared/components/ui/Button';
import { UserData, UserPhoto } from '../../../app/providers/UserContext';

interface StepPhotosProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepPhotos({ userData, onNext }: StepPhotosProps) {
  const [photos, setPhotos] = useState<UserPhoto[]>(userData.photos || []);
  const [isUploading, setIsUploading] = useState(false);

  // Upload logic removed to be handled at the final registration step

  const pickImage = async () => {
    // Permission check
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to continue.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (photos.length < 6) {
        setPhotos([...photos, { url: result.assets[0].uri, isMain: photos.length === 0 }]);
      }
    }
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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Camera size={32} color="#ef4444" />
          </View>
          <Text style={styles.title}>Add Your Photos</Text>
          <Text style={styles.subtitle}>Upload at least 2 photos to continue</Text>
        </View>

        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TouchableOpacity
              key={index}
              style={styles.photoBox}
              onPress={photos[index] ? undefined : pickImage}
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
                  <Plus size={32} color="#9ca3af" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <Text style={styles.tipsText}>
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
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#fee2e2',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
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
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    backgroundColor: '#fff1f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 18,
  },
});
