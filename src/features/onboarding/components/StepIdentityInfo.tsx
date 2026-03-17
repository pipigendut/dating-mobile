import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Button } from '../../../shared/components/ui/Button';

import { UserData } from '../../../shared/types/user';

interface StepIdentityInfoProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepIdentityInfo({ userData, onNext }: StepIdentityInfoProps) {
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

  const isValid = fullName.trim().length > 0 && dateOfBirth.length === 10;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What's your identity?</Text>
        <Text style={styles.subtitle}>Enter your name and birthday to continue</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={fullName}
            onChangeText={setFullName}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birthday (DD/MM/YYYY)</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            value={dateOfBirth}
            onChangeText={handleBirthDateChange}
            keyboardType="numeric"
            maxLength={10}
          />
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
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  footer: {
    paddingBottom: 20,
  },
});
