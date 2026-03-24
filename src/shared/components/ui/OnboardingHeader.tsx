import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

interface OnboardingHeaderProps {
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
  iconColor?: string;
}

export const OnboardingHeader = ({ 
  Icon, 
  title, 
  subtitle, 
  iconColor = '#ef4444' 
}: OnboardingHeaderProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.header}>
      <View style={[
        styles.iconContainer, 
        { backgroundColor: isDark ? colors.surface : '#fee2e2' }
      ]}>
        <Icon size={32} color={iconColor} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
