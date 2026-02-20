import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView } from 'react-native';
import { X, Zap, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../ui/Button';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const boostPackages = [
  { id: 1, multiplier: 1, price: 'Rp 89.000', pricePer: 'per one' },
  { id: 2, multiplier: 5, price: 'Rp 249.000', pricePer: 'per one', popular: true },
  { id: 3, multiplier: 15, price: 'Rp 499.000', pricePer: 'per one' },
];

export default function BoostModal({ isOpen, onClose }: BoostModalProps) {
  const [selected, setSelected] = useState(2);

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color="#374151" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Boost your profile</Text>
            <Text style={styles.subtitle}>Stay at the top of the search and attract more matches</Text>

            <View style={styles.previewContainer}>
              <View style={styles.imageRing}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }}
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.zapBadge}>
                <Zap size={28} color="white" fill="white" />
              </View>
            </View>

            <View style={styles.benefits}>
              {[
                'Be at the top of the search',
                'Get noticed by everyone',
                'Enjoy likes and matches',
              ].map((benefit, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View style={styles.checkIcon}>
                    <Check size={14} color="white" />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.packagesGrid}>
              {boostPackages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    selected === pkg.id && styles.activeCard
                  ]}
                  onPress={() => setSelected(pkg.id)}
                >
                  {pkg.popular && (
                    <LinearGradient
                      colors={['#9333ea', '#ec4899']}
                      style={styles.bestBadge}
                    >
                      <Text style={styles.bestText}>BEST</Text>
                    </LinearGradient>
                  )}
                  <Text style={[styles.multiplier, selected === pkg.id && styles.activeMultiplier]}>
                    {pkg.multiplier}x
                  </Text>
                  <Text style={styles.price}>{pkg.price}</Text>
                  <Text style={styles.pricePer}>{pkg.pricePer}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Get Boost" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 30,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  previewContainer: {
    marginBottom: 30,
    position: 'relative',
  },
  imageRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ef4444',
    padding: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  zapBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 50,
    height: 50,
    backgroundColor: '#ef4444',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  benefits: {
    width: '100%',
    marginBottom: 30,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  packagesGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  packageCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeCard: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  bestBadge: {
    position: 'absolute',
    top: -10,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bestText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  multiplier: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 4,
  },
  activeMultiplier: {
    color: '#111827',
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  pricePer: {
    fontSize: 10,
    color: '#6b7280',
  },
});
