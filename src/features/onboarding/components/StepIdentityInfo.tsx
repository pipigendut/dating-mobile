import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Button } from '../../../shared/components/ui/Button';

import { UserData } from '../../../shared/types/user';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepIdentityInfoProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepIdentityInfo({ userData, onNext }: StepIdentityInfoProps) {
  const { colors, isDark } = useTheme();
  const [fullName, setFullName] = useState(userData.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(userData.dateOfBirth || '');

  const handleBirthDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    setDateOfBirth(formatted);
  };

  const isDateInFuture = (dateStr: string) => {
    if (dateStr.length !== 10) return false;
    const [day, month, year] = dateStr.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return birthDate > today;
  };

  const isFuture = isDateInFuture(dateOfBirth);
  const isValid = fullName.trim().length > 0 && dateOfBirth.length === 10 && !isFuture;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>What's your identity?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter your name and birthday to continue</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter your name"
            placeholderTextColor={colors.textSecondary}
            value={fullName}
            onChangeText={setFullName}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Birthday (DD/MM/YYYY)</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: isFuture ? '#ef4444' : colors.border
            }]}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textSecondary}
            value={dateOfBirth}
            onChangeText={handleBirthDateChange}
            keyboardType="numeric"
            maxLength={10}
          />
          {isFuture && (
            <Text style={styles.errorText}>Birth date cannot be in the future</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => onNext({ fullName, dateOfBirth })}
          disabled={!isValid}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  footer: {
    paddingBottom: 20,
  },
});
