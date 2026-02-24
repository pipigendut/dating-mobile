import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Camera, MapPin, X, ChevronLeft, Plus, Star } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useUserStore } from '../../../store/useUserStore';
import { UserPhoto } from '../../../shared/types/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../../../services/api/user';
import { MasterItem } from '../../../services/api/master';
import { useMasterStore } from '../../../store/useMasterStore';

// Note: Removed hardcoded arrays to load dynamically from the backend

export default function EditProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { userData, setUserData } = useUserStore();
  const [name, setName] = useState(userData.name || '');
  const [bio, setBio] = useState(userData.bio || '');
  const [height, setHeight] = useState(userData.height || 170);
  const [interests, setInterests] = useState<string[]>(userData.interests || []);
  const [photos, setPhotos] = useState<UserPhoto[]>(userData.photos || []);
  const [deletedPhotos, setDeletedPhotos] = useState<UserPhoto[]>([]);
  const initialMainIdx = userData.photos?.findIndex(p => p.isMain) || 0;
  const [mainPhotoIndex, setMainPhotoIndex] = useState(initialMainIdx >= 0 ? initialMainIdx : 0);
  const [lookingFor, setLookingFor] = useState<string[]>(userData.lookingFor || []);
  const [languages, setLanguages] = useState<string[]>(userData.languages || []);
  const [interestedIn, setInterestedIn] = useState<string[]>(userData.interestedIn || []);

  const {
    interests: interestsOptions,
    languages: languagesOptions,
    relationshipTypes: lookingForOptions,
    genders: interestedInOptions,
    fetchMasterData,
    isLoaded
  } = useMasterStore();

  React.useEffect(() => {
    if (!isLoaded) {
      fetchMasterData();
    }

    // Failsafe: if the local phone cache has photos but no IDs (legacy session), fetch them safely from the backend immediately to ensure _destroy ID markers work
    if (userData.id && userData.photos && userData.photos.length > 0 && !userData.photos[0].id) {
      userService.getProfile(userData.id).then(fresh => {
        const mappedP = fresh.photos?.map((p: any) => ({ id: p.id, url: p.url, isMain: p.is_main })) || [];
        setUserData({ ...userData, photos: mappedP });
        setPhotos(mappedP);
      }).catch(console.error);
    }
  }, [isLoaded, fetchMasterData, userData.id]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => userService.updateProfile(data),
    onSuccess: () => {
      // We will perform the navigation down inside handleSave now.
    },
    onError: (error) => {
      setUploading(false);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Update profile error:', error);
    },
  });

  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    try {
      setUploading(true);
      let formattedPhotos: { id?: string; url: string; is_main: boolean }[] = [];

      for (const p of photos) {
        if (!p.url.startsWith('file://') && !p.url.startsWith('content://')) {
          formattedPhotos.push({ id: p.id, url: p.url, is_main: p.isMain });
          continue;
        }

        try {
          // Use authenticated upload endpoint since we are logged in
          const result = await userService.getUploadUrl();
          const { upload_url, file_key } = result;

          // 2. Upload to S3 using FileSystem.uploadAsync
          const uploadResp = await FileSystem.uploadAsync(upload_url, p.url, {
            httpMethod: 'PUT',
            uploadType: 0, // FileSystemUploadType.BINARY_CONTENT
            headers: {
              'Content-Type': 'image/jpeg',
            },
          });

          if (uploadResp.status !== 200) throw new Error(`S3 Put failed with status ${uploadResp.status} `);

          formattedPhotos.push({ id: p.id, url: file_key, is_main: p.isMain });
        } catch (uploadErr) {
          console.error('[EditProfile] S3 upload error:', uploadErr);
          throw new Error('Gagal mengunggah foto. Coba lagi.');
        }
      }

      // We need to re-map isMain based on current mainPhotoIndex
      formattedPhotos = formattedPhotos.map((p, i) => ({ ...p, is_main: i === mainPhotoIndex }));

      // Push deleted photos onto the payload for the backend to process
      for (const dp of deletedPhotos) {
        if (dp.id) {
          formattedPhotos.push({ id: dp.id, url: dp.url, _destroy: true } as any);
        }
      }

      const payload = {
        full_name: name,
        bio: bio,
        height_cm: height,
        interests: interests,
        looking_for: lookingFor.length > 0 ? lookingFor[0] : undefined,
        languages: languages,
        interested_in: interestedIn.length > 0 ? interestedIn[0] : undefined,
        photos: formattedPhotos,
      };

      await updateProfileMutation.mutateAsync(payload);

      if (userData.id) {
        const freshProfile = await userService.getProfile(userData.id);
        const mappedPhotos = freshProfile.photos?.map((p: any) => ({ id: p.id, url: p.url, isMain: p.is_main })) || [];
        setUserData({
          ...userData,
          name,
          bio,
          height,
          interests,
          photos: mappedPhotos,
          lookingFor,
          languages,
          interestedIn: interestedIn as any
        });
      } else {
        // Fallback
        setUserData({
          ...userData,
          name,
          bio,
          height,
          interests,
          photos: formattedPhotos.map((p, i) => ({ id: p.id, url: p.url, isMain: p.is_main })),
          lookingFor,
          languages,
          interestedIn: interestedIn as any
        });
      }

      setUploading(false);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal menyimpan profil');
      setUploading(false);
    }
  };

  const toggleInterest = (value: string) => {
    if (interests.includes(value)) {
      setInterests(interests.filter((i) => i !== value));
    } else if (interests.length < 5) {
      setInterests([...interests, value]);
    }
  };

  const toggleLanguage = (value: string) => {
    // Single selection: replace previous with new
    setLanguages([value]);
  };

  const toggleLookingFor = (value: string) => {
    // Single selection: replace previous with new
    setLookingFor([value]);
  };

  const toggleInterestedIn = (value: string) => {
    // Single selection: replace previous with new
    setInterestedIn([value]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos.');
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
    const photoToRemove = photos[index];
    if (photoToRemove.id) {
      // Keep track of DB photos being removed to tell backend to destroy them
      setDeletedPhotos([...deletedPhotos, photoToRemove]);
    }

    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    if (mainPhotoIndex === index) setMainPhotoIndex(0);
    else if (mainPhotoIndex > index) setMainPhotoIndex(mainPhotoIndex - 1);
  };

  if (!isLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={updateProfileMutation.isPending || uploading}>
          {updateProfileMutation.isPending || uploading ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>Add at least 2 photos. Tap to set main.</Text>
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoBox}
                onPress={() => setMainPhotoIndex(index)}
              >
                <Image source={{ uri: photo.url }} style={styles.image} />
                {mainPhotoIndex === index && (
                  <View style={styles.mainBadge}>
                    <Star size={10} color="white" fill="white" />
                    <Text style={styles.mainBadgeText}>Main</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removePhoto(index)}
                >
                  <X size={14} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            {photos.length < 6 && (
              <TouchableOpacity style={styles.addPhotoBox} onPress={pickImage}>
                <Camera size={32} color="#9ca3af" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Gender</Text>
          <View style={[styles.input, { backgroundColor: '#e5e7eb', marginBottom: 15 }]}>
            <Text style={{ color: '#4b5563', fontSize: 15 }}>
              {interestedInOptions.find(o => o.id === userData.gender)?.name || 'Not specified'}
            </Text>
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />

          <Text style={styles.label}>About yourself</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.counter}>{bio.length}/500</Text>

          {/* Looking For */}
          <Text style={styles.label}>Looking for</Text>
          <View style={styles.selectionList}>
            {lookingForOptions.map((option: MasterItem) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleLookingFor(option.id)}
                style={[
                  styles.selectionButton,
                  lookingFor.includes(option.id) && styles.selectionButtonActive
                ]}
              >
                <Text style={[
                  styles.selectionButtonText,
                  lookingFor.includes(option.id) && styles.selectionButtonTextActive
                ]}>
                  {option.icon ? `${option.icon} ` : ''}{option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Interested In */}
          <Text style={styles.label}>Interested in</Text>
          <View style={styles.selectionList}>
            {interestedInOptions.map((option: MasterItem) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleInterestedIn(option.id)}
                style={[
                  styles.selectionButton,
                  interestedIn.includes(option.id) && styles.selectionButtonActive
                ]}
              >
                <Text style={[
                  styles.selectionButtonText,
                  interestedIn.includes(option.id) && styles.selectionButtonTextActive
                ]}>
                  {option.icon ? `${option.icon} ` : ''}{option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Languages */}
          <Text style={styles.label}>Languages I speak</Text>
          <View style={styles.selectionList}>
            {languagesOptions.map((option: MasterItem) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleLanguage(option.id)}
                style={[
                  styles.selectionButton,
                  languages.includes(option.id) && styles.selectionButtonActive
                ]}
              >
                <View style={styles.languageRow}>
                  <Text style={styles.flagEmoji}>{option.icon}</Text>
                  <Text style={[
                    styles.selectionButtonText,
                    languages.includes(option.id) && styles.selectionButtonTextActive
                  ]}>
                    {option.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Height */}
        <View style={styles.section}>
          <Text style={styles.label}>Height: {height} cm</Text>
          <Slider
            style={styles.slider}
            minimumValue={140}
            maximumValue={220}
            step={1}
            value={height}
            onValueChange={setHeight}
            minimumTrackTintColor="#ef4444"
          />
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeText}>140 cm</Text>
            <Text style={styles.rangeText}>220 cm</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.label}>Your interests (Select up to 5)</Text>
          <View style={styles.interestsGrid}>
            {interestsOptions.map((option: MasterItem) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleInterest(option.id)}
                style={[
                  styles.interestChip,
                  interests.includes(option.id) && styles.activeChip
                ]}
              >
                <Text style={[
                  styles.interestText,
                  interests.includes(option.id) && styles.activeText
                ]}>
                  {option.icon ? `${option.icon} ` : ''}{option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoBox: {
    width: '31%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  addPhotoBox: {
    width: '31%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  mainBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    marginBottom: 5,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'right',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  activeChip: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  interestText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  activeText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  selectionList: {
    gap: 12,
    marginBottom: 20,
  },
  selectionButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionButtonActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fff1f2',
  },
  selectionButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  selectionButtonTextActive: {
    color: '#ef4444',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 20,
  },
});
