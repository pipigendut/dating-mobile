import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Sliders, Zap } from 'lucide-react-native';
import SwipeCards from '../components/SwipeCards';
import FilterModal from '../components/FilterModal';
import BoostModal from '../../profile/components/BoostModal';
import ActivateBoostModal from '../../profile/components/ActivateBoostModal';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { useBoostStore } from '../../../store/useBoostStore';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useMasterStore } from '../../../store/useMasterStore';
import { useBoostAvailability } from '../../../services/api/boost';

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
  const { data: boostData, refetch: refetchBoost } = useBoostAvailability();
  const isBoostActive = boostData?.is_boosted ?? false;
  const boostExpiresAt = boostData?.expired_at ?? null;
  const boostAmount = boostData?.boost_amount ?? 0;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isBoostOpen, setIsBoostOpen] = useState(false);
  const [isActivateBoostOpen, setIsActivateBoostOpen] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [timeLeft, setTimeLeft] = useState<string>('');
 
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

  // Boost Timer Logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isBoostActive && boostExpiresAt) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(boostExpiresAt).getTime();
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeLeft('');
          clearInterval(interval);
        } else {
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBoostActive, boostExpiresAt]);

  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [initialPlan, setInitialPlan] = useState<'plus' | 'premium' | 'ultimate'>('premium');

  const [isCheckingBoost, setIsCheckingBoost] = useState(false);

  return (
    <ScreenLayout>
      {!isDetailMode && (
        <ScreenWithHeader>
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Swipee</Text>

            <View style={styles.headerRight}>
              {isBoostActive && (
                <View style={[styles.timerBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.timerText, { color: colors.primary }]}>{timeLeft}</Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.boostBtn, (isBoostActive || isCheckingBoost) && { backgroundColor: colors.primary + '20' }]}
                disabled={isCheckingBoost}
                onPress={async () => {
                  if (isCheckingBoost) return;
                  
                  setIsCheckingBoost(true);
                  try {
                    // Force refresh via react-query refetch
                    const result = await refetchBoost();
                    const data = result.data;
                    
                    if (data && data.boost_amount > 0) {
                      setIsActivateBoostOpen(true);
                    } else {
                      setIsBoostOpen(true);
                    }
                  } catch (error) {
                    console.error('[HomeScreen] Failed to check boost availability:', error);
                    // Fallback to shop if error
                    setIsBoostOpen(true);
                  } finally {
                    setIsCheckingBoost(false);
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {isCheckingBoost ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Zap
                    size={24}
                    color={isBoostActive ? colors.primary : colors.primary}
                    fill={isBoostActive ? "#4e03fc" : "transparent"}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => setIsFilterOpen(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Sliders size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
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

      <BoostModal
        isOpen={isBoostOpen}
        onClose={() => setIsBoostOpen(false)}
      />

      <ActivateBoostModal
        isOpen={isActivateBoostOpen}
        onClose={() => setIsActivateBoostOpen(false)}
        onGetMore={() => {
          setIsActivateBoostOpen(false);
          setIsBoostOpen(true);
        }}
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
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boostBtn: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  timerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: -5,
    zIndex: 1,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
