import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Heart, Check } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { UserData } from '../../context/UserContext';

interface StepLookingForProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

const lookingForOptions = [
  { value: 'long-term', label: 'Long-term partner', emoji: '💕' },
  { value: 'short-term', label: 'Short-term', emoji: '🌟' },
  { value: 'short-term-fun', label: 'Short-term fun', emoji: '🎉' },
  { value: 'new-friends', label: 'New friends', emoji: '👋' },
  { value: 'still-figuring', label: 'Still figuring it out', emoji: '🤔' },
];

export default function StepLookingFor({ userData, onNext }: StepLookingForProps) {
  const [selected, setSelected] = useState<string>(userData.lookingFor?.[0] || '');

  const handleSubmit = () => {
    if (selected) {
      onNext({ lookingFor: [selected] });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Heart size={32} color="#ef4444" />
          </View>
          <Text style={styles.title}>What are you looking for?</Text>
          <Text style={styles.subtitle}>Choose one that best describes you</Text>
        </View>

        <View style={styles.optionsContainer}>
          {lookingForOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSelected(option.value)}
              style={[
                styles.option,
                selected === option.value && styles.activeOption
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  selected === option.value && styles.activeOptionLabel
                ]}>
                  {option.label}
                </Text>
              </View>
              {selected === option.value && (
                <View style={styles.checkCircle}>
                  <Check size={16} color="white" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: 'bold' }}>Note:</Text> This will be shown on your profile and help you match with people who want the same things.
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
