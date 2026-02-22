import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ruler } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Button } from '../../../shared/components/ui/Button';
import { UserData } from '../../../app/providers/UserContext';

interface StepHeightProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepHeight({ userData, onNext }: StepHeightProps) {
  const [height, setHeight] = useState(userData.height || 170);

  const handleSubmit = () => {
    onNext({ height });
  };

  const formatHeight = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${cm} cm (${feet}'${inches}")`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ruler size={32} color="#ef4444" />
        </View>
        <Text style={styles.title}>How tall are you?</Text>
        <Text style={styles.subtitle}>This helps us show you better matches</Text>
      </View>

      <View style={styles.sliderSection}>
        <View style={styles.heightDisplay}>
          <Text style={styles.heightValue}>{height}</Text>
          <Text style={styles.heightUnit}>cm</Text>
        </View>
        <Text style={styles.heightConverted}>{formatHeight(height)}</Text>

        <Slider
          style={styles.slider}
          minimumValue={140}
          maximumValue={220}
          step={1}
          value={height}
          onValueChange={setHeight}
          minimumTrackTintColor="#ef4444"
          maximumTrackTintColor="#f3f4f6"
          thumbTintColor="#ef4444"
        />

        <View style={styles.rangeLabels}>
          <Text style={styles.rangeText}>140 cm</Text>
          <Text style={styles.rangeText}>220 cm</Text>
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
  header: {
    alignItems: 'center',
    marginTop: 20,
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
    color: '#6b7280',
    marginLeft: 5,
  },
  heightConverted: {
    fontSize: 16,
    color: '#9ca3af',
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
    color: '#9ca3af',
  },
});
