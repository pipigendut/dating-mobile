import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Check } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { OnboardingHeader } from '../../../shared/components/ui/OnboardingHeader';
import { UserData } from '../../../shared/types/user';
import { useMasterStore } from '../../../store/useMasterStore';
import { MasterItem } from '../../../services/api/master';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepGenderProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepGender({ userData, onNext }: StepGenderProps) {
  const { colors, isDark } = useTheme();
  const [gender, setGender] = useState<MasterItem | undefined>(userData.gender);

  const { genders: genderOptions } = useMasterStore();

  const handleSubmit = () => {
    if (gender) {
      onNext({ gender });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OnboardingHeader 
        Icon={User}
        title="What's your gender?"
        subtitle="This will be shown on your profile"
      />

      <View style={styles.optionsContainer}>
        {genderOptions.map((option: MasterItem) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => setGender(option)}
            style={[
              styles.option,
              { backgroundColor: colors.surface, borderColor: colors.border },
              gender?.id === option.id && { borderColor: '#ef4444', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
            ]}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionEmoji}>{option.icon}</Text>
              <Text style={[
                styles.optionLabel,
                { color: colors.textSecondary },
                gender?.id === option.id && { color: colors.text }
              ]}>
                {option.name}
              </Text>
            </View>
            {gender?.id === option.id && (
              <View style={styles.checkCircle}>
                <Check size={16} color="white" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Continue"
        onPress={handleSubmit}
        disabled={!gender}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  activeOption: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  optionEmoji: {
    fontSize: 32,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
