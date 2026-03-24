import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FileText } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { OnboardingHeader } from '../../../shared/components/ui/OnboardingHeader';
import { UserData } from '../../../shared/types/user';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepBioProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepBio({ userData, onNext }: StepBioProps) {
  const { colors, isDark } = useTheme();
  const [bio, setBio] = useState(userData.bio || '');
  const maxLength = 500;

  const handleSubmit = () => {
    onNext({ bio: bio.trim() || undefined });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <OnboardingHeader 
          Icon={FileText}
          title="Tell us about yourself"
          subtitle="Write a short bio (optional)"
        />

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Your Bio</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Tell potential matches about your interests, hobbies, what you're looking for..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            value={bio}
            onChangeText={(text) => setBio(text.slice(0, maxLength))}
          />
          <View style={styles.counterRow}>
            <Text style={styles.hint}>Make it interesting and authentic!</Text>
            <Text style={styles.counter}>{bio.length}/{maxLength}</Text>
          </View>
        </View>

        <View style={[styles.tipBox, { backgroundColor: isDark ? colors.surface : '#fffbeb', borderColor: isDark ? colors.border : '#fde68a' }]}>
          <Text style={[styles.tipText, { color: isDark ? colors.textSecondary : '#92400e' }]}>
            <Text style={{ fontWeight: 'bold', color: isDark ? colors.text : '#92400e' }}>Tip:</Text> Mention your hobbies, favorite activities, or what makes you unique. Be yourself!
          </Text>
        </View>
      </ScrollView>

      <Button title="Continue" onPress={handleSubmit} />
    </KeyboardAvoidingView>
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
  inputContainer: {
    flex: 1,
    marginTop: 30,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
  },
  counter: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tipBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
