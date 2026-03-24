import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ruler } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Button } from '../../../shared/components/ui/Button';
import { OnboardingHeader } from '../../../shared/components/ui/OnboardingHeader';
import { UserData } from '../../../shared/types/user';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepHeightProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepHeight({ userData, onNext }: StepHeightProps) {
  const { colors, isDark } = useTheme();
  const [heightCm, setHeightCm] = useState(userData.heightCm || 170);

  const handleSubmit = () => {
    onNext({ heightCm });
  };

  const formatHeight = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${cm} cm (${feet}'${inches}")`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OnboardingHeader 
        Icon={Ruler}
        title="How tall are you?"
        subtitle="This helps us show you better matches"
      />

      <View style={styles.sliderSection}>
        <View style={styles.heightDisplay}>
          <Text style={styles.heightValue}>{heightCm}</Text>
          <Text style={[styles.heightUnit, { color: colors.textSecondary }]}>cm</Text>
        </View>
        <Text style={[styles.heightConverted, { color: colors.textSecondary }]}>{formatHeight(heightCm)}</Text>

        <Slider
          style={styles.slider}
          minimumValue={140}
          maximumValue={220}
          step={1}
          value={heightCm}
          onValueChange={setHeightCm}
          minimumTrackTintColor="#ef4444"
          maximumTrackTintColor={colors.border}
          thumbTintColor="#ef4444"
        />

        <View style={styles.rangeLabels}>
          <Text style={[styles.rangeText, { color: colors.textSecondary }]}>140 cm</Text>
          <Text style={[styles.rangeText, { color: colors.textSecondary }]}>220 cm</Text>
        </View>
      </View>

      <Button title="Continue" onPress={handleSubmit} />
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
  sliderSection: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  heightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 5,
  },
  heightValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  heightUnit: {
    fontSize: 24,
    marginLeft: 5,
  },
  heightConverted: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  rangeText: {
    fontSize: 12,
  },
});
