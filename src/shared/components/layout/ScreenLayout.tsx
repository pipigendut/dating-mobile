import { StyleSheet, View, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../theme/theme';
import { useTheme } from '../../hooks/useTheme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  withPadding?: boolean;
  style?: ViewStyle;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  withPadding = false,
  style,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <View
        style={[
          styles.content,
          withPadding && styles.padded,
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
  },
});
