import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, Check } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { OnboardingHeader } from '../../../shared/components/ui/OnboardingHeader';
import { UserData } from '../../../shared/types/user';
import { useMasterStore } from '../../../store/useMasterStore';
import { MasterItem } from '../../../services/api/master';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepInterestedInProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepInterestedIn({ userData, onNext }: StepInterestedInProps) {
  const { colors, isDark } = useTheme();
  const [interestedIn, setInterestedIn] = useState<MasterItem[]>(
    userData.interestedGenders || []
  );

  const toggleInterest = (value: MasterItem) => {
    const current = interestedIn || [];
    if (current.some(g => g.id === value.id)) {
      setInterestedIn(current.filter(g => g.id !== value.id));
    } else {
      setInterestedIn([...current, value]);
    }
  };


  const handleSubmit = () => {
    if (interestedIn.length > 0) {
      onNext({ interestedGenders: interestedIn });
    }
  };

  const { genders: options } = useMasterStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OnboardingHeader 
        Icon={Heart}
        title="Who are you interested in?"
        subtitle="Select all that apply"
      />

      <View style={styles.optionsContainer}>
        {options.map((option: MasterItem) => {
          const isSelected = interestedIn.some(g => g.id === option.id);

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => toggleInterest(option)}
              style={[
                styles.option,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && { borderColor: '#ef4444', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionEmoji}>{option.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  { color: colors.textSecondary },
                  isSelected && { color: colors.text }
                ]}>
                  {option.name}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.checkCircle}>
                  <Check size={16} color="white" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

      </View>

      <Button
        title="Continue"
        onPress={handleSubmit}
        disabled={interestedIn.length === 0}
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
    color: '#6b7280',
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    marginTop: 20,
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
  disabledOption: {
    opacity: 0.5,
    backgroundColor: '#f9fafb',
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
