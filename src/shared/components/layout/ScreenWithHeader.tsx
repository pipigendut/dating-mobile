import { StyleSheet, View, ViewStyle } from 'react-native';
import { spacing } from '../../theme/theme';
import { useTheme } from '../../hooks/useTheme';

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
  const { colors } = useTheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.surface },
      withBorder && { borderBottomWidth: 1, borderBottomColor: colors.border },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    minHeight: 40,
  },
});
