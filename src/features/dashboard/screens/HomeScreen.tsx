import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Sliders } from 'lucide-react-native';
import SwipeCards from '../components/SwipeCards';
import FilterModal from '../components/FilterModal';
import SubscriptionModal from '../components/SubscriptionModal';
import LocationSearchModal from '../components/LocationSearchModal';

export default function HomeScreen() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Swipee</Text>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setIsFilterOpen(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Sliders size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SwipeCards filters={filters} />
      </View>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        onOpenSubscription={openSubscription}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        initialPlan={initialPlan}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
    zIndex: 10,
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
