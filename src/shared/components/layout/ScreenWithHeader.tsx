import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { spacing, colors } from '../../theme/theme';

interface ScreenWithHeaderProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  withBorder?: boolean;
}

/**
 * ScreenWithHeader serves as a consistent header container.
 * It provides a fixed height and an optional bottom border.
 * Content should be passed as children.
 */
export const ScreenWithHeader: React.FC<ScreenWithHeaderProps> = ({
  children,
  style,
  withBorder = true,
}) => {
  return (
    <View style={[
      styles.container,
      withBorder && styles.border,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    minHeight: 40,
    backgroundColor: colors.white,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  }
});
