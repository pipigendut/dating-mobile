import React from 'react';
import { StyleSheet, View, SafeAreaView, ViewStyle, StatusBar } from 'react-native';
import { spacing, colors } from '../../theme/theme';

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
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
  },
});
