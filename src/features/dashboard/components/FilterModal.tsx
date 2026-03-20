import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { X, Globe, Lock, ShieldCheck, Wifi } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Button } from '../../../shared/components/ui/Button';
import { useUserStore } from '../../../store/useUserStore';
import { useMasterStore } from '../../../store/useMasterStore';
import LocationSearchModal from './LocationSearchModal';
import { useTheme } from '../../../shared/hooks/useTheme';

const { width } = Dimensions.get('window');

const DEFAULT_FILTERS = {
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

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onApply: (filters: any) => void;
  onOpenSubscription: (plan: 'plus' | 'premium' | 'ultimate') => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onOpenSubscription,
}: FilterModalProps) {
  const { userData } = useUserStore();
  const { relationshipTypes: relationshipTypeOptions, interests: masterInterests, fetchMasterData, isLoaded: isMasterLoaded, genders } = useMasterStore();
  const { colors, isDark } = useTheme();
  const [localFilters, setLocalFilters] = useState(filters);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);

  useEffect(() => {
    if (!isMasterLoaded) {
      fetchMasterData();
    }
  }, [isMasterLoaded]);

  // Sync localFilters with filters prop when it changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleToggleExplorerMode = (val: boolean) => {
    if (val) {
      if (userData.subscription?.planName?.toLowerCase() !== 'ultimate') {
        onOpenSubscription('ultimate');
        return;
      }
      setIsLocationSearchOpen(true);
    } else {
      setLocalFilters({ ...localFilters, explorerMode: false });
    }
  };

  const toggleGender = (gender: string) => {
    const current = localFilters.gender || [];
    if (current.includes(gender)) {
      setLocalFilters({ ...localFilters, gender: current.filter((g: string) => g !== gender) });
    } else {
      setLocalFilters({ ...localFilters, gender: [...current, gender] });
    }
  };

  const toggleFilterItem = (field: string, item: string) => {
    const current = localFilters[field] || [];
    if (current.includes(item)) {
      setLocalFilters({ ...localFilters, [field]: current.filter((i: string) => i !== item) });
    } else {
      setLocalFilters({ ...localFilters, [field]: [...current, item] });
    }
  };

  const lookingForOptions = relationshipTypeOptions;
  const interestOptions = masterInterests;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={[styles.title, { color: colors.text }]}>Search filters</Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Basic Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>BASIC</Text>
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.text }]}>Distance</Text>
                  <Text style={[styles.valueText, { color: colors.text }]}>{localFilters.distance} km</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={500}
                  step={1}
                  value={localFilters.distance}
                  onValueChange={(val) => setLocalFilters({ ...localFilters, distance: val })}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={[styles.row, { paddingVertical: 10 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Show me only within {localFilters.distance} km</Text>
                  <Switch
                    value={localFilters.showMeOnly}
                    onValueChange={(val) => setLocalFilters({ ...localFilters, showMeOnly: val })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.premiumRow}>
                  <View style={styles.premiumLabelContainer}>
                    <Globe size={20} color="#3b82f6" />
                    <View style={styles.premiumTextContainer}>
                      <View style={styles.row}>
                        <Text style={[styles.label, { color: colors.text }]}>Explorer Mode</Text>
                        {userData.subscription?.planName?.toLowerCase() !== 'ultimate' && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>ULTIMATE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.explorerDesc, { color: colors.textSecondary }]}>Change your location and discover people from around the world</Text>
                      {localFilters.explorerMode && (
                        <TouchableOpacity onPress={() => setIsLocationSearchOpen(true)}>
                          <Text style={[styles.locationLink, { color: colors.primary }]}>
                            {localFilters.selectedLocation ?
                              `${localFilters.selectedLocation.city}${localFilters.selectedLocation.country ? `, ${localFilters.selectedLocation.country}` : ''}` :
                              'Select Location'
                            } • <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <Switch
                    value={localFilters.explorerMode}
                    onValueChange={handleToggleExplorerMode}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              </View>
            </View>

            {/* Age & Gender */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>AGE & GENDER</Text>
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.text }]}>Age range</Text>
                  <Text style={[styles.valueText, { color: colors.text }]}>{localFilters.ageRange[0]}-{localFilters.ageRange[1]}</Text>
                </View>
                <View style={styles.multiSliderContainer}>
                  <MultiSlider
                    values={[localFilters.ageRange[0], localFilters.ageRange[1]]}
                    sliderLength={width - 100}
                    onValuesChange={(values) => setLocalFilters({ ...localFilters, ageRange: values })}
                    min={10}
                    max={80}
                    step={1}
                    allowOverlap={false}
                    snapped
                    selectedStyle={{ backgroundColor: colors.primary }}
                    unselectedStyle={{ backgroundColor: colors.border }}
                    trackStyle={{ height: 4 }}
                    markerStyle={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, height: 24, width: 24, borderRadius: 12 }}
                  />
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.genderSection}>
                  <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
                  <View style={styles.genderGrid}>
                    {genders.map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => toggleGender(opt.id)}
                        style={[
                          styles.genderBtn,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          localFilters.gender.includes(opt.id) && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                      >
                        <Text style={styles.genderEmoji}>{opt.icon || '👤'}</Text>
                        <Text style={[
                          styles.genderLabel,
                          { color: colors.text },
                          localFilters.gender.includes(opt.id) && styles.activeGenderLabel
                        ]}>
                          {opt.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Advanced Filters */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ADVANCED FILTERS</Text>

              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                {/* Height Range */}
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.text }]}>Height</Text>
                  <Text style={[styles.valueText, { color: colors.text }]}>{localFilters.heightRange[0]}-{localFilters.heightRange[1]} cm</Text>
                </View>
                <View style={styles.multiSliderContainer}>
                  <MultiSlider
                    values={[localFilters.heightRange[0], localFilters.heightRange[1]]}
                    sliderLength={width - 100}
                    onValuesChange={(values) => setLocalFilters({ ...localFilters, heightRange: values })}
                    min={140}
                    max={220}
                    step={1}
                    allowOverlap={false}
                    snapped
                    selectedStyle={{ backgroundColor: colors.primary }}
                    unselectedStyle={{ backgroundColor: colors.border }}
                    trackStyle={{ height: 4 }}
                    markerStyle={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, height: 24, width: 24, borderRadius: 12 }}
                  />
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Looking For */}
                <View style={styles.advancedSubSection}>
                  <Text style={[styles.label, { color: colors.text }]}>Looking for</Text>
                  <View style={styles.chipContainer}>
                    {lookingForOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => toggleFilterItem('lookingFor', opt.id)}
                        style={[
                          styles.chip,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          localFilters.lookingFor?.includes(opt.id) && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
                        ]}
                      >
                        <Text style={[
                          styles.chipText,
                          { color: colors.textSecondary },
                          localFilters.lookingFor?.includes(opt.id) && { color: colors.primary }
                        ]}>
                          {opt.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Interests */}
                <View style={styles.advancedSubSection}>
                  <Text style={[styles.label, { color: colors.text }]}>Interests</Text>
                  <View style={styles.chipContainer}>
                    {interestOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => toggleFilterItem('interests', opt.id)}
                        style={[
                          styles.chip,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          localFilters.interests?.includes(opt.id) && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
                        ]}
                      >
                        {opt.icon && <Text style={styles.chipEmoji}>{opt.icon} </Text>}
                        <Text style={[
                          styles.chipText,
                          { color: colors.textSecondary },
                          localFilters.interests?.includes(opt.id) && { color: colors.primary }
                        ]}>
                          {opt.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button title="Apply Filters" onPress={handleApply} />
          </View>

          <LocationSearchModal
            isOpen={isLocationSearchOpen}
            onClose={() => setIsLocationSearchOpen(false)}
            onSelectLocation={(location) => {
              setLocalFilters({
                ...localFilters,
                explorerMode: true,
                selectedLocation: { city: location.city, country: location.country }
              });
            }}
            currentLocation={localFilters.selectedLocation}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 20,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 10,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  premiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  premiumLabelContainer: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  premiumTextContainer: {
    flex: 1,
  },
  badge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  explorerDesc: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  locationLink: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  changeText: {
    fontWeight: 'bold',
  },
  genderSection: {
    marginTop: 5,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  genderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  genderEmoji: {
    fontSize: 18,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeGenderLabel: {
    color: 'white',
  },
  advancedSubSection: {
    paddingVertical: 5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  multiSliderContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
});
