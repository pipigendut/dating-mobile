import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';

export default function PlaceholderScreen({ name }: { name: string }) {
  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{name} Screen</Text>
        </View>
      </ScreenWithHeader>
      <View style={styles.container}>
        <Text style={styles.text}>{name} Screen</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    color: '#9ca3af',
  },
});
