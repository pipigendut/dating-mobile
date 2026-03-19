import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isPrimary && styles.primary,
        isOutline && [styles.outline, { borderColor: colors.border }],
        isGhost && styles.ghost,
        disabled && [styles.disabled, { backgroundColor: isDark ? colors.surface : '#f3f4f6', borderColor: isDark ? colors.surface : '#f3f4f6' }],
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : '#ef4444'} />
      ) : (
        <>
          {icon}
          <Text style={[
            styles.text,
            isPrimary && styles.primaryText,
            (isOutline || isGhost) && [styles.outlineText, { color: colors.text }],
            disabled && styles.disabledText,
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  primary: {
    backgroundColor: '#ef4444',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#f3f4f6',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  outlineText: {
  },
  disabledText: {
    color: '#9ca3af',
  },
});
