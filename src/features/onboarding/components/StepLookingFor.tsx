import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Heart, Check } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { UserData } from '../../../shared/types/user';
import { useMasterStore } from '../../../store/useMasterStore';
import { MasterItem } from '../../../services/api/master';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepLookingForProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepLookingFor({ userData, onNext }: StepLookingForProps) {
  const { colors, isDark } = useTheme();
  const [selected, setSelected] = useState<MasterItem | undefined>(userData.relationshipType);

  const { relationshipTypes: lookingForOptions } = useMasterStore();

  const handleSubmit = () => {
    if (selected) {
      onNext({ relationshipType: selected });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surface : '#fee2e2' }]}>
            <Heart size={32} color="#ef4444" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>What are you looking for?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose one that best describes you</Text>
        </View>

        <View style={styles.optionsContainer}>
          {lookingForOptions.map((option: MasterItem) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setSelected(option)}
              style={[
                styles.option,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selected?.id === option.id && { borderColor: '#ef4444', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionEmoji}>{option.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  { color: colors.textSecondary },
                  selected?.id === option.id && { color: colors.text }
                ]}>
                  {option.name}
                </Text>
              </View>
              {selected?.id === option.id && (
                <View style={styles.checkCircle}>
                  <Check size={16} color="white" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: isDark ? colors.surface : '#eff6ff', borderColor: isDark ? colors.border : '#bfdbfe' }]}>
          <Text style={[styles.infoText, { color: isDark ? colors.textSecondary : '#1e40af' }]}>
            <Text style={{ fontWeight: 'bold', color: isDark ? colors.text : '#1e40af' }}>Note:</Text> This will be shown on your profile and help you match with people who want the same things.
          </Text>
        </View>
      </ScrollView>

      <Button
        title="Continue"
        onPress={handleSubmit}
        disabled={!selected}
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
    marginBottom: 20,
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
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
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
    fontSize: 28,
  },
  optionLabel: {
    fontSize: 16,
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
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
});
