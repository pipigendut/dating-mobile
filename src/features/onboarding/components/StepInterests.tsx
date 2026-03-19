import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { UserData } from '../../../shared/types/user';
import { useMasterStore } from '../../../store/useMasterStore';
import { MasterItem } from '../../../services/api/master';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepInterestsProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepInterests({ userData, onNext }: StepInterestsProps) {
  const { colors, isDark } = useTheme();
  const [interests, setInterests] = useState<MasterItem[]>(userData.interests || []);

  const { interests: availableInterests } = useMasterStore();

  const toggleInterest = (interest: MasterItem) => {
    if (interests.some(i => i.id === interest.id)) {
      setInterests(interests.filter((i) => i.id !== interest.id));
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surface : '#fee2e2' }]}>
            <Sparkles size={32} color="#ef4444" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>What are your interests?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select 3 to 10 interests</Text>
        </View>

        <View style={styles.interestsContainer}>
          {availableInterests.map((interest: MasterItem) => {
            const isSelected = interests.some(i => i.id === interest.id);
            const isDisabled = !isSelected && interests.length >= 10;

            return (
              <TouchableOpacity
                key={interest.id}
                onPress={() => toggleInterest(interest)}
                disabled={isDisabled}
                style={[
                  styles.interestChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && styles.activeChip,
                  isDisabled && [styles.disabledChip, { backgroundColor: isDark ? colors.surface : '#f9fafb', opacity: 0.5 }]
                ]}
              >
                <Text style={[
                  styles.interestText,
                  { color: colors.textSecondary },
                  isSelected && styles.activeText
                ]}>
                  {interest.icon} {interest.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[
          styles.infoBox,
          { backgroundColor: isDark ? colors.surface : '#f3e8ff', borderColor: isDark ? colors.border : '#e9d5ff' },
          interests.length < 3 && { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fff1f2', borderColor: isDark ? '#ef4444' : '#fecaca' }
        ]}>
          <Text style={[
            styles.infoText,
            { color: isDark ? colors.text : '#6b21a8' },
            interests.length < 3 && { color: isDark ? '#ef4444' : '#991b1b' }
          ]}>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
  },
  activeText: {
    color: 'white',
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningBox: {
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
  },
  warningText: {
  },
});
