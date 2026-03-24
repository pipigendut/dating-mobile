import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Globe, Check } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { OnboardingHeader } from '../../../shared/components/ui/OnboardingHeader';
import { UserData } from '../../../shared/types/user';
import { useMasterStore } from '../../../store/useMasterStore';
import { MasterItem } from '../../../services/api/master';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepLanguageProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
  isSubmitting?: boolean;
}

export default function StepLanguage({ userData, onNext, isSubmitting }: StepLanguageProps) {
  const { colors, isDark } = useTheme();
  const [language, setLanguage] = useState<MasterItem | undefined>(userData.languages?.[0]);

  const { languages } = useMasterStore();

  const handleSubmit = () => {
    if (language) {
      onNext({ languages: [language] });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <OnboardingHeader 
          Icon={Globe}
          title="Select your language"
          subtitle="Your preferred language on Swipee"
        />

        <View style={styles.optionsContainer}>
          {languages.map((lang: MasterItem) => (
            <TouchableOpacity
              key={lang.id}
              onPress={() => setLanguage(lang)}
              style={[
                styles.option,
                { backgroundColor: colors.surface, borderColor: colors.border },
                language?.id === lang.id && { borderColor: '#ef4444', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionEmoji}>{lang.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  { color: colors.textSecondary },
                  language?.id === lang.id && { color: colors.text }
                ]}>
                  {lang.name}
                </Text>
              </View>
              {language?.id === lang.id && (
                <View style={styles.checkCircle}>
                  <Check size={16} color="white" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: isDark ? colors.surface : '#f0fdf4', borderColor: isDark ? colors.border : '#bbf7d0' }]}>
          <Text style={[styles.infoText, { color: isDark ? colors.textSecondary : '#166534' }]}>
            <Text style={{ fontWeight: 'bold', color: isDark ? colors.text : '#166534' }}>🎉 You're almost done!</Text> This is the last step of your profile setup.
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
  subtitle: {
    fontSize: 16,
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
    borderRadius: 16,
    borderWidth: 2,
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
