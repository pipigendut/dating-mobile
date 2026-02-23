import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useUserStore } from '../../../store/useUserStore';
import { authService } from '../../../services/api/auth';
import { userService } from '../../../services/api/user';
import { useToastStore } from '../../../store/useToastStore';
import { ChevronLeft } from 'lucide-react-native';
import axios from 'axios';

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
  const { userData, setUserData, setUserStatus, setIsLoggedIn, setIsRegistering, setTokens, resetUser } = useUserStore();
  const { showToast } = useToastStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);

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
  const needsIdentity = !userData.name || !userData.birthDate;

  const handleNext = async (stepData: any) => {
    console.log('[Onboarding] handleNext called with:', stepData);
    const updatedData = { ...userData, ...stepData };
    setUserData(updatedData);

    const isStillMissingIdentity = !updatedData.name || !updatedData.birthDate;

    if (needsIdentity) {
      console.log('[Onboarding] Identity submitted. Proceeding to step 0. Missing?', isStillMissingIdentity);
      if (isStillMissingIdentity) return;
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

      // Fix: StepLanguage sends { language: 'id' }, but backend expects languages array
      const finalLanguages = updatedData.languages || (updatedData.language ? [updatedData.language] : []);

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
          // 1. Get presigned URL using public endpoint
          const result = await userService.getUploadUrlPublic();
          const { upload_url, file_key } = result;

          // 2. Prepare file
          const imgResp = await fetch(p.url);
          const blob = await imgResp.blob();

          // 3. Upload to S3 using fetch (axios sometimes fails with blobs in RN)
          const uploadResp = await fetch(upload_url, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': blob.type || 'image/jpeg',
            },
          });

          if (!uploadResp.ok) throw new Error('S3 Put failed');

          formattedPhotos.push({ url: file_key, is_main: p.isMain });
        } catch (uploadErr) {
          console.error('[Onboarding] S3 upload error:', uploadErr);
          throw new Error('Gagal mengunggah foto profil Anda. Coba lagi.');
        }
      }
      console.log('[Onboarding] S3 uploads complete.', formattedPhotos);

      if (updatedData.authMethod === 'email') {
        console.log('[Onboarding] Submitting email registration...');
        if (!updatedData.email || !updatedData.password || !updatedData.name || !updatedData.birthDate) {
          showToast('Missing required registration data', 'error');
          return;
        }

        const response = await authService.register({
          email: updatedData.email,
          password: updatedData.password,
          full_name: updatedData.name,
          date_of_birth: updatedData.birthDate.split('/').reverse().join('-'),
          gender: updatedData.gender,
          height_cm: updatedData.height,
          bio: updatedData.bio,
          interested_in: updatedData.interestedIn?.join(','),
          looking_for: updatedData.lookingFor?.join(','),
          location_city: updatedData.location?.city,
          location_country: updatedData.location?.country,
          latitude: updatedData.location?.latitude,
          longitude: updatedData.location?.longitude,
          interests: updatedData.interests,
          languages: finalLanguages,
          photos: formattedPhotos,
        });
        token = response.token;
        refreshToken = response.refresh_token;
      } else if (updatedData.authMethod === 'google') {
        console.log('[Onboarding] Submitting google registration...');
        console.log('[Onboarding] Current userData:', updatedData);
        if (!updatedData.email || !updatedData.googleId || !updatedData.name) {
          showToast('Missing required Google registration data', 'error');
          return;
        }

        const response = await authService.googleLogin({
          email: updatedData.email,
          google_id: updatedData.googleId,
          full_name: updatedData.name,
          profile_picture: updatedData.profileImage,
          date_of_birth: updatedData.birthDate ? updatedData.birthDate.split('/').reverse().join('-') : undefined,
          gender: updatedData.gender,
          height_cm: updatedData.height,
          bio: updatedData.bio,
          interested_in: updatedData.interestedIn?.join(','),
          looking_for: updatedData.lookingFor?.join(','),
          location_city: updatedData.location?.city,
          location_country: updatedData.location?.country,
          latitude: updatedData.location?.latitude,
          longitude: updatedData.location?.longitude,
          interests: updatedData.interests,
          languages: finalLanguages,
          photos: formattedPhotos,
        });
        token = response.token;
        refreshToken = response.refresh_token;
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
    if (needsIdentity || currentStepIndex === 0) {
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
    } else {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const progressPercent = needsIdentity ? 0 : Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>

        <Text style={styles.stepText}>{progressPercent}%</Text>
      </View>

      <View style={styles.content}>
        {needsIdentity ? (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
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
