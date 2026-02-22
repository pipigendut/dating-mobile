import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, Check } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { UserData } from '../../../app/providers/UserContext';

interface StepInterestedInProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepInterestedIn({ userData, onNext }: StepInterestedInProps) {
  const [interestedIn, setInterestedIn] = useState<('male' | 'female' | 'everyone')[]>(
    userData.interestedIn || []
  );

  const toggleInterest = (value: 'male' | 'female' | 'everyone') => {
    setInterestedIn([value]);
  };

  const handleSubmit = () => {
    if (interestedIn.length > 0) {
      onNext({ interestedIn });
    }
  };

  const options = [
    { value: 'male' as const, label: 'Men', icon: '👨' },
    { value: 'female' as const, label: 'Women', icon: '👩' },
    { value: 'everyone' as const, label: 'Everyone', icon: '🌈' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Heart size={32} color="#ef4444" />
        </View>
        <Text style={styles.title}>Who are you interested in?</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = interestedIn.includes(option.value);

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => toggleInterest(option.value)}
              style={[
                styles.option,
                isSelected && styles.activeOption,
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionEmoji}>{option.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  isSelected && styles.activeOptionLabel
                ]}>
                  {option.label}
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
  header: {
    alignItems: 'center',
    marginTop: 20,
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
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f3f4f6',
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
    color: '#374151',
  },
  activeOptionLabel: {
    color: '#111827',
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
