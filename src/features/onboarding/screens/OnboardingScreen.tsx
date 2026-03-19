import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import { useUserStore } from '../../../store/useUserStore';
import { authService } from '../../../services/api/auth';
import { userService } from '../../../services/api/user';
import { useToastStore } from '../../../store/useToastStore';
import { useMasterStore } from '../../../store/useMasterStore';
import { ChevronLeft } from 'lucide-react-native';
import axios from 'axios';
import uuid from 'react-native-uuid';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';

// Import Steps
import StepIdentityInfo from '../components/StepIdentityInfo';
import StepHeight from '../components/StepHeight';
import StepPhotos from '../components/StepPhotos';
import StepGender from '../components/StepGender';
import StepInterestedIn from '../components/StepInterestedIn';
import StepLocation from '../components/StepLocation';
import StepLookingFor from '../components/StepLookingFor';
import StepBio from '../components/StepBio';
import StepInterests from '../components/StepInterests';
import StepLanguage from '../components/StepLanguage';

export default function OnboardingScreen() {
  const { colors, isDark } = useTheme();
  const { userData, setUserData, setUserStatus, setIsLoggedIn, setIsRegistering, setTokens, resetUser } = useUserStore();
  const { showToast } = useToastStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [forceShowIdentity, setForceShowIdentity] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fetchMasterData, isLoaded } = useMasterStore();

  React.useEffect(() => {
    fetchMasterData();
  }, []);

  // Core onboarding steps (percentage starts here)
  const steps = [
    { component: StepHeight, title: 'How tall are you?' },
    { component: StepPhotos, title: 'Add your photos' },
    { component: StepGender, title: 'What is your gender?' },
    { component: StepInterestedIn, title: 'Who are you interested in?' },
    { component: StepLocation, title: 'Where are you from?' },
    { component: StepLookingFor, title: 'What are you looking for?' },
    { component: StepBio, title: 'About you' },
    { component: StepInterests, title: 'Your interests' },
    { component: StepLanguage, title: 'Languages you speak' },
  ];

  // If user info is missing, show Identity Form first (not counted in percentage)
  const needsIdentity = !userData.fullName || !userData.dateOfBirth;

  const handleNext = async (stepData: any) => {
    console.log('[Onboarding] handleNext called with:', stepData);
    const updatedData = { ...userData, ...stepData };
    setUserData(updatedData);

    const isStillMissingIdentity = !updatedData.fullName || !updatedData.dateOfBirth;

    if (needsIdentity || forceShowIdentity) {
      console.log('[Onboarding] Identity submitted. Proceeding to step 0. Missing?', isStillMissingIdentity);
      if (isStillMissingIdentity) return;
      setForceShowIdentity(false);
      // Let it re-render, it will naturally show step 0 since needsIdentity will become false
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      console.log(`[Onboarding] Moving to step ${currentStepIndex + 1}`);
      setCurrentStepIndex(currentStepIndex + 1);
      return;
    }

    // Final step - submit everything
    console.log('[Onboarding] Final step reached. Current userData:', updatedData);
    try {
      setLoading(true);
      let token = '';
      let refreshToken = '';

      // Fix: languages is already an array of MasterItems from StepLanguage
      const finalLanguages = (updatedData.languages || []).map((l: any) =>
        typeof l === 'string' ? l : l.id
      );

      // Generate a temporary DB-like UUID so S3 images land inside users/UUID/ instead of anonymous paths.
      // This ID will be transferred directly to the Go API downstream.
      let clientId = updatedData.id;
      if (!clientId) {
        clientId = uuid.v4().toString();
        updatedData.id = clientId;
        setUserData(updatedData);
      }

      // Fetch presigned URL and upload photos sequentially first
      console.log('[Onboarding] Starting image uploads to S3...');
      let formattedPhotos: { url: string; is_main: boolean }[] = [];

      for (const p of (updatedData.photos || [])) {
        // If it isn't a local file (e.g., http://, https://, or an already uploaded S3 key like onboarding/...), skip upload
        if (!p.url.startsWith('file://') && !p.url.startsWith('content://')) {
          formattedPhotos.push({ url: p.url, is_main: p.isMain });
          continue;
        }

        try {
          // 1. Get presigned URL using public endpoint + clientID injection
          const result = await userService.getUploadUrlPublic(clientId);
          const { upload_url, file_key } = result;

          // 2. Upload to S3 using FileSystem.uploadAsync
          const uploadResp = await FileSystem.uploadAsync(upload_url, p.url, {
            httpMethod: 'PUT',
            uploadType: 0, // FileSystemUploadType.BINARY_CONTENT
            headers: {
              'Content-Type': 'image/jpeg',
            },
          });

          if (uploadResp.status !== 200) throw new Error(`S3 Put failed with status ${uploadResp.status}`);

          formattedPhotos.push({ url: file_key, is_main: p.isMain });
        } catch (uploadErr) {
          console.error('[Onboarding] S3 upload error:', uploadErr);
          throw new Error('Gagal mengunggah foto profil Anda. Coba lagi.');
        }
      }
      console.log('[Onboarding] S3 uploads complete.', formattedPhotos);

      if (updatedData.authMethod === 'email') {
        console.log('[Onboarding] Submitting email registration...');
        if (!updatedData.email || !updatedData.password || !updatedData.fullName || !updatedData.dateOfBirth) {
          showToast('Missing required registration data', 'error');
          return;
        }

        const response = await authService.register({
          id: updatedData.id,
          email: updatedData.email,
          password: updatedData.password,
          full_name: updatedData.fullName,
          date_of_birth: updatedData.dateOfBirth,
          gender: updatedData.gender?.id,
          height_cm: updatedData.heightCm,
          bio: updatedData.bio,
          interested_in: updatedData.interestedGenders?.map(g => g.id).join(','),
          looking_for: updatedData.relationshipType?.id,
          location_city: updatedData.locationCity,
          location_country: updatedData.locationCountry,
          latitude: updatedData.latitude,
          longitude: updatedData.longitude,
          interests: updatedData.interests?.map(i => i.id),
          languages: finalLanguages,
          photos: formattedPhotos,
        });
        token = response.token;
        refreshToken = response.refresh_token;

        if (response.user) {
          setUserData({
            id: response.user.id,
            email: updatedData.email,
            authMethod: 'email',
            fullName: response.user.full_name,
            bio: response.user.bio,
            heightCm: response.user.height_cm,
            photos: response.user.photos?.map((p: any) => ({ id: p.id, url: p.url, isMain: p.is_main })) || [],
            gender: response.user.gender,
            relationshipType: response.user.relationship_type,
            interestedGenders: response.user.interested_genders || [],
            interests: response.user.interests || [],
            languages: response.user.languages || [],
            dateOfBirth: response.user.date_of_birth
              ? new Date(response.user.date_of_birth).toISOString().split('T')[0]
              : undefined,
            locationCity: response.user.location_city,
            locationCountry: response.user.location_country,
            latitude: response.user.latitude,
            longitude: response.user.longitude,
          });
        }
      } else if (updatedData.authMethod === 'google') {
        console.log('[Onboarding] Submitting google registration...');
        console.log('[Onboarding] Current userData:', updatedData);
        if (!updatedData.email || !updatedData.googleId || !updatedData.fullName) {
          showToast('Missing required Google registration data', 'error');
          return;
        }

        const response = await authService.googleLogin({
          id: updatedData.id,
          email: updatedData.email,
          google_id: updatedData.googleId,
          full_name: updatedData.fullName!,
          profile_picture: (updatedData as any).profileImage,
          date_of_birth: updatedData.dateOfBirth,
          gender: updatedData.gender?.id,
          height_cm: updatedData.heightCm,
          bio: updatedData.bio,
          interested_in: updatedData.interestedGenders?.map(g => g.id).join(','),
          looking_for: updatedData.relationshipType?.id,
          location_city: updatedData.locationCity,
          location_country: updatedData.locationCountry,
          latitude: updatedData.latitude,
          longitude: updatedData.longitude,
          interests: updatedData.interests?.map(i => i.id),
          languages: finalLanguages,
          photos: formattedPhotos,
        });
        token = response.token;
        refreshToken = response.refresh_token;

        if (response.user) {
          setUserData({
            id: response.user.id,
            authMethod: 'google',
            fullName: response.user.full_name || updatedData.fullName || 'Google User',
            email: updatedData.email,
            bio: response.user.bio,
            heightCm: response.user.height_cm,
            photos: response.user.photos?.map((p: any) => ({ id: p.id, url: p.url, isMain: p.is_main })) || [],
            gender: response.user.gender,
            relationshipType: response.user.relationship_type,
            interestedGenders: response.user.interested_genders || [],
            interests: response.user.interests || [],
            languages: response.user.languages || [],
            dateOfBirth: response.user.date_of_birth
              ? new Date(response.user.date_of_birth).toISOString().split('T')[0]
              : undefined,
            locationCity: response.user.location_city,
            locationCountry: response.user.location_country,
            latitude: response.user.latitude,
            longitude: response.user.longitude,
          });
        }
      } else {
        console.warn('[Onboarding] Unknown auth method:', updatedData.authMethod);
      }

      console.log('[Onboarding] Registration response token:', token ? 'Received' : 'Empty');

      if (token && refreshToken) {
        await setTokens(token, refreshToken);
        setIsLoggedIn(true);
        setUserStatus('active');
        setIsRegistering(false);
      }

    } catch (error: any) {
      console.error('Registration failed:', error);
      showToast(error.response?.data?.message || 'Failed to complete registration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (needsIdentity || forceShowIdentity) {
      Alert.alert(
        'Cancel Registration',
        'Are you sure you want to cancel and return to login?',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Return to Login',
            style: 'destructive',
            onPress: async () => {
              try {
                const { signOutWithGoogle } = require('../../auth/services/googleAuth');
                await signOutWithGoogle();
              } catch (e) { }
              await resetUser();
            }
          }
        ]
      );
    } else if (currentStepIndex === 0) {
      console.log('[Onboarding] handleBack: At step 0, forcing identity view');
      setForceShowIdentity(true);
    } else {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const progressPercent = needsIdentity ? 0 : Math.round(((currentStepIndex + 1) / steps.length) * 100);

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ef4444" />
      </SafeAreaView>
    );
  }

  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.progressHeader}>
            <View style={[styles.progressContainer, { backgroundColor: isDark ? colors.surface : '#f3f4f6' }]}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>{progressPercent}%</Text>
          </View>
        </View>
      </ScreenWithHeader>

      <View style={styles.content}>
        {needsIdentity || forceShowIdentity ? (
          <StepIdentityInfo
            userData={userData}
            onNext={handleNext}
          />
        ) : (
          <React.Fragment>
            {React.createElement(steps[currentStepIndex].component as any, {
              userData: userData,
              onNext: handleNext,
              isSubmitting: loading
            })}
          </React.Fragment>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 15,
  },
  progressHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginRight: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ef4444',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    width: 35,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 24,
  },
});
