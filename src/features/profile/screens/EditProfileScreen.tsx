import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Camera, X, Star, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Slider from '@react-native-community/slider';

import { userService, UpdateProfileRequest } from '../../../services/api/user';
import { MasterItem, UserPhoto } from '../../../shared/types/user';
import { useMasterStore } from '../../../store/useMasterStore';
import { useUserStore } from '../../../store/useUserStore';
import { useToastStore } from '../../../store/useToastStore';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';

const { width } = Dimensions.get('window');

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { colors, isDark } = useTheme();
  const { userData, setUserData } = useUserStore();
  const { showToast } = useToastStore();
  const {
    relationshipTypes: relationshipTypeOptions,
    genders: interestedInOptions,
    languages: languagesOptions,
    interests: interestsOptions,
    isLoaded,
    fetchMasterData
  } = useMasterStore();

  useEffect(() => {
    if (!isLoaded) {
      fetchMasterData();
    }
  }, [isLoaded]);

  // Form State - Always use camelCase (Mapped by useUserStore)
  const [name, setName] = useState(userData.fullName || '');
  const [bio, setBio] = useState(userData.bio || '');
  const [height, setHeight] = useState(userData.heightCm || 170);
  const [relationshipType, setRelationshipType] = useState<string[]>(
    userData.relationshipType ? [userData.relationshipType.id] : []
  );
  const [interestedIn, setInterestedIn] = useState<string[]>(
    userData.interestedGenders?.map(g => g.id) || []
  );
  const [languages, setLanguages] = useState<string[]>(userData.languages?.map(l => l.id) || []);
  const [interests, setInterests] = useState<string[]>(userData.interests?.map(i => i.id) || []);
  const [photos, setPhotos] = useState<UserPhoto[]>(userData.photos || []);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(userData.photos?.findIndex(p => p.isMain) || 0);
  const [uploading, setUploading] = useState(false);

  // Sync state if userData changes
  useEffect(() => {
    if (userData) {
      setName(userData.fullName || '');
      setBio(userData.bio || '');
      setHeight(userData.heightCm || 170);
      setRelationshipType(userData.relationshipType ? [userData.relationshipType.id] : []);
      setInterestedIn(userData.interestedGenders?.map(g => g.id) || []);
      setLanguages(userData.languages?.map(l => l.id) || []);
      setInterests(userData.interests?.map(i => i.id) || []);
      setPhotos(userData.photos || []);
      const mainIdx = userData.photos?.findIndex(p => p.isMain);
      setMainPhotoIndex(mainIdx !== undefined && mainIdx !== -1 ? mainIdx : 0);
    }
  }, [userData]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUserData(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Profile updated successfully', 'success');
      setUploading(false);
      navigation.goBack();
    },
    onError: (error: any) => {
      setUploading(false);
      showToast(error.message || 'Failed to update profile', 'error');
    },
  });

  const handleSave = async () => {
    try {
      setUploading(true);
      let formattedPhotos: { id?: string; url: string; is_main: boolean }[] = [];

      for (let idx = 0; idx < photos.length; idx++) {
        const p = photos[idx];
        const isMain = idx === mainPhotoIndex;

        if (!p.url.startsWith('file://') && !p.url.startsWith('content://')) {
          formattedPhotos.push({ 
            id: p.id, 
            url: p.url, 
            is_main: isMain 
          });
          continue;
        }

        try {
          const result = await userService.getUploadUrl();
          const { upload_url, file_key } = result;

          const uploadResp = await FileSystem.uploadAsync(upload_url, p.url, {
            httpMethod: 'PUT',
            uploadType: 0, // FileSystemUploadType.BINARY_CONTENT
            headers: {
              'Content-Type': 'image/jpeg',
            },
          });

          if (uploadResp.status !== 200) {
            throw new Error(`S3 Put failed with status ${uploadResp.status}`);
          }

          formattedPhotos.push({ 
            url: file_key, 
            is_main: isMain 
          });
        } catch (uploadErr) {
          console.error('[EditProfile] S3 upload error:', uploadErr);
          setUploading(false);
          showToast('Failed to upload photo to S3', 'error');
          return; // Stop update on failure
        }
      }

      const payload: UpdateProfileRequest = {
        full_name: name,
        bio: bio,
        height_cm: height,
        interests: interests,
        relationship_type: relationshipType.length > 0 ? relationshipType[0] : undefined,
        languages: languages,
        interested_in: interestedIn.join(','),
        photos: formattedPhotos,
      };

      updateProfileMutation.mutate(payload);
    } catch (error) {
      console.error('Save error:', error);
      setUploading(false);
      showToast('Failed to save profile', 'error');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const fileUri = result.assets[0].uri;
        const newPhoto: UserPhoto = {
          url: fileUri,
          isMain: photos.length === 0,
        };
        setPhotos([...photos, newPhoto]);
      } catch (error) {
        showToast('Failed to upload photo', 'error');
      } finally {
        setUploading(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    if (mainPhotoIndex === index) {
      setMainPhotoIndex(0);
    } else if (mainPhotoIndex > index) {
      setMainPhotoIndex(mainPhotoIndex - 1);
    }
  };

  const toggleRelationshipType = (id: string) => {
    setRelationshipType([id]);
  };

  const toggleInterestedIn = (value: string) => {
    if (interestedIn.includes(value)) {
      setInterestedIn(interestedIn.filter((v) => v !== value));
    } else {
      setInterestedIn([...interestedIn, value]);
    }
  };


  const toggleLanguage = (id: string) => {
    if (languages.includes(id)) {
      setLanguages(languages.filter(l => l !== id));
    } else {
      setLanguages([...languages, id]);
    }
  };

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter(i => i !== id));
    } else {
      if (interests.length < 5) {
        setInterests([...interests, id]);
      } else {
        showToast('Maximum 5 interests allowed', 'info');
      }
    }
  };

  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={[styles.header]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={updateProfileMutation.isPending || uploading}>
            {updateProfileMutation.isPending || uploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScreenWithHeader>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Add at least 2 photos. Tap to set main.</Text>
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.photoBox, { backgroundColor: colors.surface }]}
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
              <TouchableOpacity style={[styles.addPhotoBox, { borderColor: colors.border }]} onPress={pickImage}>
                <Camera size={32} color={colors.textSecondary} />
                <Text style={[styles.addPhotoText, { color: colors.textSecondary }]}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
          <View style={[styles.input, { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 15 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
              {userData.gender?.name || 'Not specified'}
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text }]}>About yourself</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
          <Text style={[styles.counter, { color: colors.textSecondary }]}>{bio.length}/500</Text>

          <Text style={[styles.label, { color: colors.text }]}>Looking for</Text>
          <View style={styles.selectionList}>
            {relationshipTypeOptions.map((option: MasterItem) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleRelationshipType(option.id)}
                style={[
                  styles.selectionButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  relationshipType.includes(option.id) && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fff1f2' }
                ]}
              >
                <Text style={[
                  styles.selectionButtonText,
                  { color: colors.text },
                  relationshipType.includes(option.id) && { color: colors.primary }
                ]}>
                  {option.icon ? `${option.icon} ` : ''}{option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Interested in</Text>
          <View style={styles.selectionList}>
            {interestedInOptions.map((option: MasterItem) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleInterestedIn(option.id)}
                style={[
                  styles.selectionButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  interestedIn.includes(option.id) && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fff1f2' }
                ]}
              >
                <Text style={[
                  styles.selectionButtonText,
                  { color: colors.text },
                  interestedIn.includes(option.id) && { color: colors.primary }
                ]}>
                  {option.icon ? `${option.icon} ` : ''}{option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Languages I speak</Text>
          <View style={styles.selectionList}>
            {languagesOptions.map((option: MasterItem) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleLanguage(option.id)}
                style={[
                  styles.selectionButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  languages.includes(option.id) && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fff1f2' }
                ]}
              >
                <View style={styles.languageRow}>
                  <Text style={styles.flagEmoji}>{option.icon}</Text>
                  <Text style={[
                    styles.selectionButtonText,
                    { color: colors.text },
                    languages.includes(option.id) && { color: colors.primary }
                  ]}>
                    {option.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Height: {height} cm</Text>
          <Slider
            style={styles.slider}
            minimumValue={140}
            maximumValue={220}
            step={1}
            value={height}
            onValueChange={setHeight}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.rangeLabels}>
            <Text style={[styles.rangeText, { color: colors.textSecondary }]}>140 cm</Text>
            <Text style={[styles.rangeText, { color: colors.textSecondary }]}>220 cm</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Your interests (Select up to 5)</Text>
          <View style={styles.interestsGrid}>
            {interestsOptions.map((option: MasterItem) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleInterest(option.id)}
                style={[
                  styles.interestChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  interests.includes(option.id) && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
                ]}
              >
                <Text style={[
                  styles.interestText,
                  { color: colors.text },
                  interests.includes(option.id) && { color: colors.primary, fontWeight: 'bold' }
                ]}>
                  {option.icon ? `${option.icon} ` : ''}{option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
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
  },
  addPhotoBox: {
    width: '31%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 10,
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
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 5,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 11,
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
  },
  interestText: {
    fontSize: 13,
  },
  selectionList: {
    gap: 12,
    marginBottom: 20,
  },
  selectionButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
