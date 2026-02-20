import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { MapPin, Navigation, Check } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { UserData } from '../../context/UserContext';

interface StepLocationProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepLocation({ userData, onNext }: StepLocationProps) {
  const [city, setCity] = useState(userData.location?.city || '');
  const [country, setCountry] = useState(userData.location?.country || '');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      let { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      if (permissionStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'We need your permission to find nearby matches. Please enable location in your device settings.',
          [{ text: 'Open Settings', onPress: () => Platform.OS === 'ios' ? Location.requestForegroundPermissionsAsync() : {} }, { text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please turn on your device\'s Location Services (GPS) to find your current city.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch (locError: any) {
        console.error('Core Location Error:', locError);
        // Specifically handle Code 2 / kCLErrorLocationUnknown
        if (locError.code === 2 || locError.message?.includes('unavailable')) {
          Alert.alert(
            'Location Unavailable',
            'We couldn\'t determine your precise location. This can happen if:\n\n' +
            '• You are indoors or have a weak signal\n' +
            '• GPS is still warming up\n' +
            '• If using a simulator, location is set to "None"\n\n' +
            'Please try moving near a window or check your toggle, then try again.',
            [{ text: 'Try Again', onPress: handleGetCurrentLocation }, { text: 'Cancel' }]
          );
        } else {
          Alert.alert('Location Error', 'Something went wrong while fetching your location. Please try once more.');
        }
        setLoading(false);
        setErrorStatus('Detection failed. Please try again.');
        return;
      }

      let cityFound = '';
      let countryFound = '';

      const tryNativeGeocode = async () => {
        try {
          if (Platform.OS === 'web') return null;
          let results = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          return results && results.length > 0 ? results[0] : null;
        } catch (e) {
          return null;
        }
      };

      const tryFallbackGeocode = async () => {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&localityLanguage=en`
          );
          const data = await response.json();
          if (data) {
            return {
              city: data.city || data.locality || data.principalSubdivision || '',
              country: data.countryName || ''
            };
          }
        } catch (e) {
          console.error('Fallback geocoding failed:', e);
        }
        return null;
      };

      let place = await tryNativeGeocode();
      if (place) {
        cityFound = place.city || place.subregion || place.district || '';
        countryFound = place.country || '';
      }

      if (!cityFound || !countryFound) {
        const fallbackPlace = await tryFallbackGeocode();
        if (fallbackPlace) {
          cityFound = fallbackPlace.city;
          countryFound = fallbackPlace.country;
        }
      }

      if (cityFound || countryFound) {
        setCity(cityFound);
        setCountry(countryFound);
        setErrorStatus(null);
      } else {
        Alert.alert(
          'Location Found, Address Not Found',
          'We found your coordinates but couldn\'t name the city. Please check your internet connection and try again.'
        );
        setErrorStatus('Could not resolve address.');
      }
    } catch (error) {
      console.error(error);
      setErrorStatus('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (city && country) {
      onNext({ location: { city, country } });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MapPin size={32} color="#ef4444" />
        </View>
        <Text style={styles.title}>Enable Location</Text>
        <Text style={styles.subtitle}>We'll use your current location to find matches nearby</Text>
      </View>

      <View style={styles.form}>
        <Button
          title={loading ? "Getting location..." : "Allow Location"}
          variant="outline"
          onPress={handleGetCurrentLocation}
          loading={loading}
          icon={!loading && <Navigation size={20} color="#ef4444" style={{ marginRight: 10 }} />}
          style={styles.locationButton}
        />

        {!!(city || country) && !loading && (
          <View style={styles.detectedLocation}>
            <Check size={20} color="#10b981" />
            <Text style={styles.detectedText}>
              Detected: {city}{city && country ? ', ' : ''}{country}
            </Text>
          </View>
        )}

        {!!errorStatus && (
          <Text style={styles.errorText}>{errorStatus}</Text>
        )}

        <View style={styles.infoBox}>
          <MapPin size={16} color="#1e40af" style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            Your location will be used to show you people nearby. You can change this anytime in settings.
          </Text>
        </View>
      </View>

      <Button
        title="Continue"
        onPress={handleSubmit}
        disabled={!city || !country || loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#fee2e2',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  locationButton: {
    marginBottom: 10,
  },
  detectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    gap: 10,
    marginTop: 10,
  },
  detectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: -5,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 10,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
});
