import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { X, Navigation, MapPin } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { useTheme } from '../../../shared/hooks/useTheme';

const { width } = Dimensions.get('window');

// Simple Raster OSM Style to avoid external dependency issues
const osmStyle = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: { 
    city: string; 
    country: string; 
    latitude: number; 
    longitude: number; 
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

export default function MapLocationPicker({ 
  isOpen, 
  onClose, 
  onSelectLocation, 
  initialLocation 
}: MapLocationPickerProps) {
  const { colors, isDark } = useTheme();
  const [coordinates, setCoordinates] = useState<[number, number]>([
    initialLocation?.longitude || 106.8456, // Default Jakarta
    initialLocation?.latitude || -6.2088,
  ]);
  const [isMoving, setIsMoving] = useState(false);
  const [addressPreview, setAddressPreview] = useState(
    initialLocation?.city ? `${initialLocation.city}${initialLocation.country ? `, ${initialLocation.country}` : ''}` : 'Jakarta, Indonesia'
  );
  
  const cameraRef = useRef<any>(null);

  const handleRegionChange = async (feature: any) => {
    const coords = feature.geometry.coordinates;
    setCoordinates(coords);
    setIsMoving(false);
    
    // Optional: Simple mock reverse geocoding for now
    // In a real app, you'd call a Geocoding API here
    // setAddressPreview(`${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
  };

  const handleApply = () => {
    onSelectLocation({
      city: addressPreview.split(',')[0].trim(),
      country: addressPreview.split(',')[1]?.trim() || '',
      latitude: coordinates[1],
      longitude: coordinates[0],
    });
    onClose();
  };

  const handleUseCurrentLocation = async () => {
    // This would use expo-location
    // For now, let's just animate back to Jakarta as a demo
    cameraRef.current?.setCamera({
      centerCoordinate: [106.8456, -6.2088],
      zoomLevel: 12,
      animationDuration: 1000,
    });
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Select Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <MapLibreGL.MapView
              style={styles.map}
              mapStyle={JSON.stringify(osmStyle)}
              onRegionWillChange={() => setIsMoving(true)}
              onRegionDidChange={handleRegionChange}
            >
              <MapLibreGL.Camera
                ref={cameraRef}
                zoomLevel={12}
                centerCoordinate={coordinates}
              />
            </MapLibreGL.MapView>

            {/* Fixed Center Pin Overlay */}
            <View style={styles.pinOverlay} pointerEvents="none">
              <View style={styles.pinContainer}>
                {isMoving && (
                  <View style={styles.movingIndicator}>
                    <ActivityIndicator size="small" color="white" />
                  </View>
                )}
                <MapPin size={48} color={colors.primary} fill={colors.primary + '33'} strokeWidth={2.5} />
                <View style={[styles.pinShadow, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
              </View>
            </View>

            {/* Floating Top Info */}
            <View style={[styles.coordsBadge, { backgroundColor: colors.surface + 'CC' }]}>
              <Navigation size={14} color={colors.primary} />
              <Text style={[styles.coordsText, { color: colors.text }]}>
                {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
              </Text>
            </View>

            {/* Use Current Location Floating Btn */}
            <TouchableOpacity 
              style={[styles.currentLocationBtn, { backgroundColor: colors.surface }]}
              onPress={handleUseCurrentLocation}
            >
              <Navigation size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.locationPreview}>
              <Text style={[styles.locLabel, { color: colors.textSecondary }]}>SELECTED AREA</Text>
              <Text style={[styles.locValue, { color: colors.text }]}>{addressPreview}</Text>
            </View>
            <Button 
              title="Apply Location" 
              onPress={handleApply}
              loading={isMoving}
            />
          </View>
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
    height: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  pinOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 48, // Offset the pin so the tip is at center
  },
  pinShadow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -2,
  },
  movingIndicator: {
    position: 'absolute',
    top: -30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 10,
  },
  coordsBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  coordsText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentLocationBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  locationPreview: {
    marginBottom: 20,
  },
  locLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  locValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
