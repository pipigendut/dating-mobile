import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sliders } from 'lucide-react-native';
import SwipeCards from '../components/SwipeCards';
import FilterModal from '../components/FilterModal';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { colors } from '../../../shared/theme/theme';
import LocationSearchModal from '../components/LocationSearchModal';

export default function HomeScreen() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [filters, setFilters] = useState({
    distance: 50,
    showMeOnly: false,
    ageRange: [18, 50],
    gender: ['female'],
    heightRange: [150, 200],
    lookingFor: [],
    interests: [],
    explorerMode: false,
    selectedLocation: { city: 'Jakarta', country: 'Indonesia' },
  });

  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [initialPlan, setInitialPlan] = useState<'plus' | 'premium' | 'ultimate'>('premium');

  const openSubscription = (plan: 'plus' | 'premium' | 'ultimate') => {
    setInitialPlan(plan);
    setIsSubscriptionOpen(true);
  };

  const handleSelectLocation = (location: any) => {
    setFilters({
      ...filters,
      explorerMode: true,
      selectedLocation: { city: location.city, country: location.country }
    });
    console.log('Selected location:', location);
  };

  return (
    <ScreenLayout>
      {!isDetailMode && (
        <ScreenWithHeader>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Swipee</Text>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setIsFilterOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Sliders size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </ScreenWithHeader>
      )}

      <View style={styles.content}>
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
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  filterBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
});
