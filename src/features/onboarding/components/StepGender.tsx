import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Check } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { UserData } from '../../../app/providers/UserContext';
import { useMasterStore } from '../../../store/useMasterStore';
import { MasterItem } from '../../../services/api/master';

interface StepGenderProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepGender({ userData, onNext }: StepGenderProps) {
  const [gender, setGender] = useState<string | undefined>(userData.gender);

  const { genders: genderOptions } = useMasterStore();

  const handleSubmit = () => {
    if (gender) {
      onNext({ gender });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <User size={32} color="#ef4444" />
        </View>
        <Text style={styles.title}>What's your gender?</Text>
        <Text style={styles.subtitle}>This will be shown on your profile</Text>
      </View>

      <View style={styles.optionsContainer}>
        {genderOptions.map((option: MasterItem) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => setGender(option.id)}
            style={[
              styles.option,
              gender === option.id && styles.activeOption
            ]}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionEmoji}>{option.icon}</Text>
              <Text style={[
                styles.optionLabel,
                gender === option.id && styles.activeOptionLabel
              ]}>
                {option.name}
              </Text>
            </View>
            {gender === option.id && (
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
