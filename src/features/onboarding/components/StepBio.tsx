import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FileText } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { UserData } from '../../../app/providers/UserContext';

interface StepBioProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepBio({ userData, onNext }: StepBioProps) {
  const [bio, setBio] = useState(userData.bio || '');
  const maxLength = 500;

  const handleSubmit = () => {
    onNext({ bio: bio.trim() || undefined });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FileText size={32} color="#ef4444" />
          </View>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>Write a short bio (optional)</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Bio</Text>
          <TextInput
            style={styles.input}
            placeholder="Tell potential matches about your interests, hobbies, what you're looking for..."
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

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            <Text style={{ fontWeight: 'bold' }}>Tip:</Text> Mention your hobbies, favorite activities, or what makes you unique. Be yourself!
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
  header: {
    alignItems: 'center',
    marginTop: 10,
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
  inputContainer: {
    flex: 1,
    marginTop: 30,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
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
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 20,
  },
  tipText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
});
