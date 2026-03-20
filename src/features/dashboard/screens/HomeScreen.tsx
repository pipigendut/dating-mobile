import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Sliders } from 'lucide-react-native';
import SwipeCards from '../components/SwipeCards';
import FilterModal from '../components/FilterModal';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useMasterStore } from '../../../store/useMasterStore';

const INITIAL_FILTERS = {
  distance: 50,
  showMeOnly: false,
  ageRange: [10, 50],
  gender: [] as string[],
  heightRange: [150, 200],
  lookingFor: [],
  interests: [],
  explorerMode: false,
  selectedLocation: { city: 'Jakarta', country: 'Indonesia' },
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { genders, fetchMasterData, isLoaded } = useMasterStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  React.useEffect(() => {
    if (!isLoaded) {
      fetchMasterData();
    }
  }, [isLoaded]);

  // Handle auto-reset and refresh when screen is focused (e.g., coming back from Profile)
  useFocusEffect(
    useCallback(() => {
      console.log('[HomeScreen] Focused - Resetting filters to profile defaults');
      setFilters(INITIAL_FILTERS);
    }, [])
  );

  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [initialPlan, setInitialPlan] = useState<'plus' | 'premium' | 'ultimate'>('premium');

  return (
    <ScreenLayout>
      {!isDetailMode && (
        <ScreenWithHeader>
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Swipee</Text>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setIsFilterOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Sliders size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </ScreenWithHeader>
      )}

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <SwipeCards
          filters={filters}
          isDetailMode={isDetailMode}
          setIsDetailMode={setIsDetailMode}
          onOpenSubscription={() => setIsSubscriptionOpen(true)}
        />
      </View>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        onOpenSubscription={(plan) => {
          setInitialPlan(plan);
          setIsSubscriptionOpen(true);
        }}
      />

      <SubscriptionModal
        isVisible={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        initialPlanId={initialPlan}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
});
