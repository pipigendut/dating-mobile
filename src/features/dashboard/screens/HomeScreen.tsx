import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Sliders, User, Users } from 'lucide-react-native';
import SwipeCards from '../components/SwipeCards';
import FilterModal from '../components/FilterModal';
import BoostModal from '../../profile/components/BoostModal';
import ActivateBoostModal from '../../profile/components/ActivateBoostModal';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useMasterStore } from '../../../store/useMasterStore';
import { useUserStore } from '../../../store/useUserStore';
import { useGroupStore } from '../../../store/useGroupStore';
import { useBoostAvailability } from '../../../services/api/boost';
import { BoostButton } from '../../../shared/components/ui/BoostButton';


const TABS: { key: 'user' | 'group'; label: string; icon: React.FC<any> }[] = [
  { key: 'user', label: 'Yourself', icon: User },
  { key: 'group', label: 'Double Date', icon: Users },
];

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
  const { colors, isDark } = useTheme();
  const { fetchMasterData, isLoaded } = useMasterStore();
  const { userData } = useUserStore();
  const { group } = useGroupStore();
  const [activeTab, setActiveTab] = useState<'user' | 'group'>('user');

  const activeEntityId = activeTab === 'user'
    ? (userData.entityId || userData.id)
    : group?.id;

  const { data: boostData, refetch: refetchBoost } = useBoostAvailability(activeEntityId);
  const isBoostActive = boostData?.is_boosted ?? false;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isBoostOpen, setIsBoostOpen] = useState(false);
  const [isActivateBoostOpen, setIsActivateBoostOpen] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [initialPlan, setInitialPlan] = useState<'plus' | 'premium' | 'ultimate'>('premium');
  const [isCheckingBoost, setIsCheckingBoost] = useState(false);

  // Animated indicator for tab bar
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!isLoaded) {
      fetchMasterData();
    }
  }, [isLoaded]);

  useFocusEffect(
    useCallback(() => {
      console.log('[HomeScreen] Focused - Resetting filters to profile defaults');
      setFilters(INITIAL_FILTERS);
    }, [])
  );


  const handleTabPress = (tab: 'user' | 'group', index: number) => {
    setActiveTab(tab);
    setIsDetailMode(false); // Reset detail mode when switching tabs
    Animated.spring(indicatorAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const TAB_WIDTH = 90; // Smaller fixed width for tabs to allow centering and scrolling
  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, TAB_WIDTH + 2],
  });

  return (
    <ScreenLayout>
      {!isDetailMode && (
        <ScreenWithHeader style={styles.headerContainer}>
          {/* App Header */}
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            {/* Filter Button (Far Left) */}
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setIsFilterOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Sliders size={22} color={colors.text} />
            </TouchableOpacity>

            {/* Scrollable Tab Bar (Center) */}
            <View style={styles.centerTabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScrollContent}
              >
                <View style={[styles.tabTrack, { backgroundColor: isDark ? colors.border + '40' : '#f3f4f6' }]}>
                  {/* Sliding indicator */}
                  <Animated.View
                    style={[
                      styles.tabIndicator,
                      {
                        width: TAB_WIDTH - 4,
                        backgroundColor: colors.primary,
                        transform: [{ translateX: indicatorTranslateX }],
                      },
                    ]}
                  />

                  {/* Tab buttons */}
                  {TABS.map((tab, index) => {
                    const isActive = activeTab === tab.key;
                    const IconComponent = tab.icon;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabButton, { width: TAB_WIDTH }]}
                        onPress={() => handleTabPress(tab.key, index)}
                        activeOpacity={0.8}
                      >
                        <IconComponent
                          size={13}
                          color={isActive ? '#ffffff' : colors.textSecondary}
                          strokeWidth={2.5}
                        />
                        <Text
                          style={[
                            styles.tabLabel,
                            {
                              color: isActive ? '#ffffff' : colors.textSecondary,
                              fontWeight: isActive ? '700' : '500',
                            },
                          ]}
                        >
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Boost Section (Far Right) */}
            <View style={styles.headerRight}>
              <BoostButton
                isActive={isBoostActive}
                isChecking={isCheckingBoost}
                size={30}
                onPress={async () => {
                  if (isCheckingBoost) return;
                  setIsCheckingBoost(true);
                  try {
                    const result = await refetchBoost();
                    const data = result.data;
                    if (data && (data.is_boosted || data.boost_amount > 0)) {
                      setIsActivateBoostOpen(true);
                    } else {
                      setIsBoostOpen(true);
                    }
                  } catch (error) {
                    console.error('[HomeScreen] Failed to check boost availability:', error);
                    setIsBoostOpen(true);
                  } finally {
                    setIsCheckingBoost(false);
                  }
                }}
              />
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
          entityType={activeTab}
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
        entityId={activeEntityId!}
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
    paddingHorizontal: 8,
    height: 54,
    zIndex: 10,
    overflow: 'visible',
  },
  headerContainer: {
    zIndex: 10,
    overflow: 'visible',
  },
  centerTabsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  tabsScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  filterBtn: {
    // padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    overflow: 'visible',
  },
  // Tab bar styles
  tabTrack: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 2,
    position: 'relative',
    height: 32,
  },
  tabIndicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: 18,
  },
  tabButton: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 11,
  },
  content: {
    flex: 1,
  },
});
