import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { UserData } from '../../../app/providers/UserContext';
import { useMasterStore } from '../../../store/useMasterStore';
import { MasterItem } from '../../../services/api/master';

interface StepInterestsProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepInterests({ userData, onNext }: StepInterestsProps) {
  const [interests, setInterests] = useState<string[]>(userData.interests || []);

  const { interests: availableInterests } = useMasterStore();


  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else if (interests.length < 10) {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = () => {
    if (interests.length >= 3) {
      onNext({ interests });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Sparkles size={32} color="#ef4444" />
          </View>
          <Text style={styles.title}>What are your interests?</Text>
          <Text style={styles.subtitle}>Select 3 to 10 interests</Text>
        </View>

        <View style={styles.interestsContainer}>
          {availableInterests.map((interest: MasterItem) => {
            const isSelected = interests.includes(interest.id);
            const isDisabled = !isSelected && interests.length >= 10;

            return (
              <TouchableOpacity
                key={interest.id}
                onPress={() => toggleInterest(interest.id)}
                disabled={isDisabled}
                style={[
                  styles.interestChip,
                  isSelected && styles.activeChip,
                  isDisabled && styles.disabledChip
                ]}
              >
                <Text style={[
                  styles.interestText,
                  isSelected && styles.activeText
                ]}>
                  {interest.icon} {interest.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.infoBox, interests.length < 3 && styles.warningBox]}>
          <Text style={[styles.infoText, interests.length < 3 && styles.warningText]}>
            <Text style={{ fontWeight: 'bold' }}>Selected: {interests.length}/10</Text>
            {interests.length < 3 && ` - Select at least ${3 - interests.length} more`}
          </Text>
        </View>
      </ScrollView>

      <Button
        title="Continue"
        onPress={handleSubmit}
        disabled={interests.length < 3}
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
    marginTop: 10,
    marginBottom: 25,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  activeChip: {
    borderColor: '#ef4444',
    backgroundColor: '#ef4444',
  },
  disabledChip: {
    opacity: 0.5,
    backgroundColor: '#f9fafb',
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  activeText: {
    color: 'white',
  },
  infoBox: {
    backgroundColor: '#f3e8ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecaca',
  },
  infoText: {
    fontSize: 13,
    color: '#6b21a8',
    textAlign: 'center',
  },
  warningText: {
    color: '#991b1b',
  },
});
