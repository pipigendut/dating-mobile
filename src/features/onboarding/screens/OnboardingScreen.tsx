import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useUserStore } from '../../../store/useUserStore';
import { userService } from '../../../services/api/user';
import { ChevronLeft } from 'lucide-react-native';

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
  const { userData, setUserData, setOnboardingComplete } = useUserStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

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
    const updatedData = { ...userData, ...stepData };
    setUserData(updatedData);

    try {
      // Map frontend data to backend request
      const updateReq: any = {};
      if (stepData.name) updateReq.full_name = stepData.name;
      if (stepData.birthDate) updateReq.date_of_birth = stepData.birthDate.split('/').reverse().join('-'); // Convert MM/DD/YYYY to YYYY-MM-DD
      if (stepData.gender) updateReq.gender = stepData.gender;
      if (stepData.height) updateReq.height_cm = stepData.height;
      if (stepData.bio) updateReq.bio = stepData.bio;
      if (stepData.interestedIn) updateReq.interested_in = stepData.interestedIn.join(',');
      if (stepData.lookingFor) updateReq.looking_for = stepData.lookingFor.join(',');
      if (stepData.location) {
        updateReq.location_city = stepData.location.city;
        updateReq.location_country = stepData.location.country;
      }
      if (stepData.interests) updateReq.interests = stepData.interests;
      if (stepData.languages) updateReq.languages = stepData.languages;

      if (Object.keys(updateReq).length > 0) {
        await userService.updateProfile(updateReq);
      }

      if (needsIdentity) {
        return;
      }

      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        // Mark as active on complete
        await userService.updateProfile({ status: 'active' });
        setOnboardingComplete(true);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      // We could show an alert here, but for smooth onboarding maybe just log it
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const progressPercent = needsIdentity ? 0 : Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          disabled={currentStepIndex === 0 || needsIdentity}
          style={[styles.backButton, (currentStepIndex === 0 || needsIdentity) && { opacity: 0 }]}
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
            {React.createElement(steps[currentStepIndex].component, {
              userData: userData,
              onNext: handleNext
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
