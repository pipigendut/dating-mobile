import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Globe, Check } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { UserData } from '../../../app/providers/UserContext';
import { useMasterStore } from '../../../store/useMasterStore';
import { MasterItem } from '../../../services/api/master';

interface StepLanguageProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
  isSubmitting?: boolean;
}

export default function StepLanguage({ userData, onNext, isSubmitting }: StepLanguageProps) {
  const [language, setLanguage] = useState((userData as any).language || '');

  const { languages } = useMasterStore();

  const handleSubmit = () => {
    if (language) {
      onNext({ language } as any);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Globe size={32} color="#ef4444" />
          </View>
          <Text style={styles.title}>Select your language</Text>
          <Text style={styles.subtitle}>Your preferred language on Swipee</Text>
        </View>

        <View style={styles.optionsContainer}>
          {languages.map((lang: MasterItem) => (
            <TouchableOpacity
              key={lang.id}
              onPress={() => setLanguage(lang.id)}
              style={[
                styles.option,
                language === lang.id && styles.activeOption
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionEmoji}>{lang.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  language === lang.id && styles.activeOptionLabel
                ]}>
                  {lang.name}
                </Text>
              </View>
              {language === lang.id && (
                <View style={styles.checkCircle}>
                  <Check size={16} color="white" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: 'bold' }}>🎉 You're almost done!</Text> This is the last step of your profile setup.
          </Text>
        </View>
      </ScrollView>

      <Button
        title={isSubmitting ? "Completing Setup..." : "Complete Setup"}
        onPress={handleSubmit}
        disabled={!language || isSubmitting}
        loading={isSubmitting}
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
    padding: 16,
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
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#166534',
    textAlign: 'center',
  },
});
