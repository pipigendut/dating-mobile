import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Camera, X, Plus, Loader2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../../shared/components/ui/Button';
import { UserData } from '../../../app/providers/UserContext';
import { userService } from '../../../services/api/user';
import axios from 'axios';

interface StepPhotosProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepPhotos({ userData, onNext }: StepPhotosProps) {
  const [photos, setPhotos] = useState<string[]>(userData.photos || []);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (uri: string) => {
    try {
      // 1. Get presigned URL
      const { data } = await userService.getUploadUrl();
      const { upload_url, file_key } = data;

      // 2. Prepare file
      const response = await fetch(uri);
      const blob = await response.blob();

      // 3. Upload to S3
      await axios.put(upload_url, blob, {
        headers: {
          'Content-Type': blob.type,
        },
      });

      // 4. Return the file key or public URL
      // For now, let's assume the backend will construct the public URL from the key or we use the key
      return file_key;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

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
        setPhotos([...photos, result.assets[0].uri]);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (photos.length < 2) return;

    try {
      setIsUploading(true);
      const uploadedPhotos = [];

      for (const uri of photos) {
        // If it's already a remote URL, don't re-upload
        if (uri.startsWith('http')) {
          uploadedPhotos.push(uri);
          continue;
        }

        const fileKey = await uploadImage(uri);
        uploadedPhotos.push(fileKey);
      }

      onNext({ photos: uploadedPhotos });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
                  <Image source={{ uri: photos[index] }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePhoto(index)}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>Main</Text>
                    </View>
                  )}
                </>
              ) : (
                <Plus size={32} color="#9ca3af" />
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
