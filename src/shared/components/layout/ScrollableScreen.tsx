import React from 'react';
import { StyleSheet, ScrollView, ViewStyle, RefreshControl, RefreshControlProps } from 'react-native';
import { ScreenLayout } from './ScreenLayout';
import { spacing } from '../../theme/theme';

interface ScrollableScreenProps {
  children: React.ReactNode;
  withPadding?: boolean;
  style?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const ScrollableScreen: React.FC<ScrollableScreenProps> = ({
  children,
  withPadding = true,
  style,
  refreshControl,
}) => {
  return (
    <ScreenLayout withPadding={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          withPadding && styles.contentContainer,
          style,
        ]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
