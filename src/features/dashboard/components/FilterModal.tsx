import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { X, Globe, Lock, ShieldCheck, Wifi } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Button } from '../../../shared/components/ui/Button';
import { useUserStore } from '../../../store/useUserStore';
import LocationSearchModal from './LocationSearchModal';

const { width } = Dimensions.get('window');

const DEFAULT_FILTERS = {
  distance: 50,
  showMeOnly: false,
  ageRange: [18, 50],
  gender: ['female'],
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
  const [localFilters, setLocalFilters] = useState(filters);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);

  // Sync localFilters with filters prop when it changes (e.g. from LocationSearchModal)
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
      if (userData.subscriptionPlan !== 'ultimate') {
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

  const lookingForOptions = [
    'Long-term partner',
    'Short-term',
    'Short-term fun',
    'New friends',
    'Still figuring it out'
  ];

  const interestOptions = [
    { label: 'Travel', emoji: '✈️' },
    { label: 'Music', emoji: '🎵' },
    { label: 'Sports', emoji: '⚽' },
    { label: 'Photography', emoji: '📸' },
    { label: 'Cooking', emoji: '🍳' },
  ];

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>Search filters</Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Basic Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>BASIC</Text>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Distance</Text>
                  <Text style={styles.valueText}>{localFilters.distance} km</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={500}
                  step={1}
                  value={localFilters.distance}
                  onValueChange={(val) => setLocalFilters({ ...localFilters, distance: val })}
                  minimumTrackTintColor="#ef4444"
                />

                <View style={styles.divider} />

                <View style={[styles.row, { paddingVertical: 10 }]}>
                  <Text style={styles.label}>Show me only within {localFilters.distance} km</Text>
                  <Switch
                    value={localFilters.showMeOnly}
                    onValueChange={(val) => setLocalFilters({ ...localFilters, showMeOnly: val })}
                    trackColor={{ false: '#e5e7eb', true: '#ef4444' }}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.premiumRow}>
                  <View style={styles.premiumLabelContainer}>
                    <Globe size={20} color="#3b82f6" />
                    <View style={styles.premiumTextContainer}>
                      <View style={styles.row}>
                        <Text style={styles.label}>Explorer Mode</Text>
                        {userData.subscriptionPlan !== 'ultimate' && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>ULTIMATE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.explorerDesc}>Change your location and discover people from around the world</Text>
                      {localFilters.explorerMode && (
                        <TouchableOpacity onPress={() => setIsLocationSearchOpen(true)}>
                          <Text style={styles.locationLink}>
                            {localFilters.selectedLocation ?
                              `${localFilters.selectedLocation.city}${localFilters.selectedLocation.country ? `, ${localFilters.selectedLocation.country}` : ''}` :
                              'Select Location'
                            } • <Text style={styles.changeText}>Change</Text>
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <Switch
                    value={localFilters.explorerMode}
                    onValueChange={handleToggleExplorerMode}
                    trackColor={{ false: '#e5e7eb', true: '#ef4444' }}
                  />
                </View>
              </View>
            </View>

            {/* Age & Gender */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>AGE & GENDER</Text>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Age range</Text>
                  <Text style={styles.valueText}>{localFilters.ageRange[0]}-{localFilters.ageRange[1]}</Text>
                </View>
                <View style={styles.multiSliderContainer}>
                  <MultiSlider
                    values={[localFilters.ageRange[0], localFilters.ageRange[1]]}
                    sliderLength={width - 100}
                    onValuesChange={(values) => setLocalFilters({ ...localFilters, ageRange: values })}
                    min={18}
                    max={80}
                    step={1}
                    allowOverlap={false}
                    snapped
                    selectedStyle={{ backgroundColor: '#ef4444' }}
                    trackStyle={{ height: 4 }}
                    markerStyle={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', height: 24, width: 24, borderRadius: 12 }}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.genderSection}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.genderGrid}>
                    {[
                      { value: 'female', label: 'Female', emoji: '👩' },
                      { value: 'male', label: 'Male', emoji: '👨' },
                      { value: 'other', label: 'Other', emoji: '🧑' },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => toggleGender(opt.value)}
                        style={[
                          styles.genderBtn,
                          localFilters.gender.includes(opt.value) && styles.activeGenderBtn
                        ]}
                      >
                        <Text style={styles.genderEmoji}>{opt.emoji}</Text>
                        <Text style={[
                          styles.genderLabel,
                          localFilters.gender.includes(opt.value) && styles.activeGenderLabel
                        ]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Advanced Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ADVANCED FILTERS</Text>

              <View style={styles.card}>
                {/* Height Range */}
                <View style={styles.row}>
                  <Text style={styles.label}>Height</Text>
                  <Text style={styles.valueText}>{localFilters.heightRange[0]}-{localFilters.heightRange[1]} cm</Text>
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
                    selectedStyle={{ backgroundColor: '#ef4444' }}
                    trackStyle={{ height: 4 }}
                    markerStyle={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', height: 24, width: 24, borderRadius: 12 }}
                  />
                </View>

                <View style={styles.divider} />

                {/* Looking For */}
                <View style={styles.advancedSubSection}>
                  <Text style={styles.label}>Looking for</Text>
                  <View style={styles.chipContainer}>
                    {lookingForOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => toggleFilterItem('lookingFor', opt)}
                        style={[
                          styles.chip,
                          localFilters.lookingFor?.includes(opt) && styles.activeChip
                        ]}
                      >
                        <Text style={[
                          styles.chipText,
                          localFilters.lookingFor?.includes(opt) && styles.activeChipText
                        ]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Interests */}
                <View style={styles.advancedSubSection}>
                  <Text style={styles.label}>Interests</Text>
                  <View style={styles.chipContainer}>
                    {interestOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() => toggleFilterItem('interests', opt.label)}
                        style={[
                          styles.chip,
                          localFilters.interests?.includes(opt.label) && styles.activeChip
                        ]}
                      >
                        <Text style={styles.chipEmoji}>{opt.emoji} </Text>
                        <Text style={[
                          styles.chipText,
                          localFilters.interests?.includes(opt.label) && styles.activeChipText
                        ]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
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
    backgroundColor: 'white',
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
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  resetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
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
    color: '#9ca3af',
    marginBottom: 10,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#f9fafb',
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
    color: '#111827',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
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
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 20,
  },
  locationLink: {
    marginTop: 8,
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  changeText: {
    color: '#2563eb',
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
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeGenderBtn: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  genderEmoji: {
    fontSize: 18,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  activeGenderLabel: {
    color: 'white',
  },
  activateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ef4444',
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
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeChip: {
    backgroundColor: '#fff',
    borderColor: '#ef4444',
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeChipText: {
    color: '#ef4444',
  },
  multiSliderContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
});
