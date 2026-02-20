import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Button } from '../ui/Button';

interface StepIdentityInfoProps {
  userData: any;
  onNext: (data: any) => void;
}

export default function StepIdentityInfo({ userData, onNext }: StepIdentityInfoProps) {
  const [name, setName] = useState(userData.name || '');
  const [birthDate, setBirthDate] = useState(userData.birthDate || '');

  const handleBirthDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    setBirthDate(formatted);
  };

  const isValid = name.trim().length > 0 && birthDate.length === 10;

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
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birthday (DD/MM/YYYY)</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            value={birthDate}
            onChangeText={handleBirthDateChange}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => onNext({ name, birthDate })}
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
