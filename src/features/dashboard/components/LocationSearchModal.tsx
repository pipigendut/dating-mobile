import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { X, Search, Navigation, Check } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';

const { width } = Dimensions.get('window');

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: { city: string; country: string; coords?: { lat: string; lng: string } }) => void;
  currentLocation?: { city: string; country: string };
}

const popularLocations = [
  { city: 'Jakarta', country: 'Indonesia', lat: '-6.2088°', lng: '106.8456°', flag: '🇮🇩' },
  { city: 'Bali', country: 'Indonesia', lat: '-8.3405°', lng: '115.0920°', flag: '🇮🇩' },
  { city: 'Singapore', country: '', lat: '1.3521°', lng: '103.8198°', flag: '🇸🇬' },
  { city: 'Bangkok', country: 'Thailand', lat: '13.7563°', lng: '100.5018°', flag: '🇹🇭' },
];

export default function LocationSearchModal({ isOpen, onClose, onSelectLocation, currentLocation }: LocationSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = popularLocations.filter(loc =>
    loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (city: string, country: string, lat?: string, lng?: string) => {
    onSelectLocation({
      city,
      country,
      coords: lat && lng ? { lat, lng } : undefined
    });
    // On select, we don't necessarily close immediately if we want to show the checkmark?
    // But usually for these modals it closes. The image shows it selected.
    // I'll add a small delay or just close as before.
    onClose();
  };

  const isSelected = (city: string) => {
    return currentLocation?.city === city;
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Search Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search city or country..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>


          {currentLocation && (
            <View style={styles.currentBanner}>
              <Navigation size={16} color="#ef4444" style={styles.bannerIcon} />
              <Text style={styles.bannerText}>
                Current: <Text style={styles.bannerValue}>{currentLocation.city}{currentLocation.country ? `, ${currentLocation.country}` : ''}</Text>
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <ScrollView style={styles.list}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'SEARCH RESULTS' : 'POPULAR LOCATIONS'}
            </Text>
            {filteredLocations.map((loc, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.locationItem,
                  isSelected(loc.city) && styles.selectedItem
                ]}
                onPress={() => handleSelect(loc.city, loc.country, loc.lat, loc.lng)}
              >
                <View style={[styles.flagContainer, isSelected(loc.city) && styles.selectedFlagContainer]}>
                  <Text style={styles.flagSymbol}>{loc.flag}</Text>
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>
                    {loc.city}{loc.country ? `, ${loc.country}` : ''}
                  </Text>
                  <Text style={styles.coordsText}>
                    {loc.lat}, {loc.lng}
                  </Text>
                </View>
                {isSelected(loc.city) && (
                  <View style={styles.checkCircle}>
                    <Check size={14} color="white" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    height: '85%',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ef4444', // As per image red border
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb', // Standard blue as per image
    paddingVertical: 14,
    borderRadius: 12,
  },
  navIcon: {
    marginRight: 8,
    transform: [{ rotate: '45deg' }],
  },
  currentLocationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 10,
  },
  currentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2', // Light red as per image
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    color: '#374151',
    fontSize: 16,
  },
  bannerValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  list: {
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 20,
    marginTop: 15,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedItem: {
    borderColor: '#ef4444',
    backgroundColor: '#fff',
  },
  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedFlagContainer: {
    backgroundColor: '#fef2f2',
  },
  flagSymbol: {
    fontSize: 32,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  coordsText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
