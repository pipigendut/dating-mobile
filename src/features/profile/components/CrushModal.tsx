import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView } from 'react-native';
import { X, Star, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../shared/components/ui/Button';

interface CrushModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const crushPackages = [
  { id: 1, count: 3, price: 'Rp 49.000', pricePer: 'per one' },
  { id: 2, count: 15, price: 'Rp 149.000', pricePer: 'per one', popular: true },
  { id: 3, count: 30, price: 'Rp 249.000', pricePer: 'per one' },
];

export default function CrushModal({ isOpen, onClose }: CrushModalProps) {
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
            <Text style={styles.title}>Get Crush</Text>
            <Text style={styles.subtitle}>Stand out with Crush and get 3x more matches!</Text>

            <View style={styles.previewContainer}>
              <View style={styles.imageRing}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }}
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.starBadge}>
                <Star size={28} color="white" fill="white" />
              </View>
            </View>

            <View style={styles.benefits}>
              {[
                'Your like will be seen first',
                'Stand out from the crowd',
                '3x more likely to match',
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
              {crushPackages.map((pkg) => (
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
                      colors={['#2563eb', '#9333ea']}
                      style={styles.bestBadge}
                    >
                      <Text style={styles.bestText}>BEST</Text>
                    </LinearGradient>
                  )}
                  <Text style={[styles.count, selected === pkg.id && styles.activeCount]}>
                    {pkg.count}
                  </Text>
                  <Text style={styles.price}>{pkg.price}</Text>
                  <Text style={styles.pricePer}>{pkg.pricePer}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Get Crush" onPress={onClose} style={styles.ctaBtn} />
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
    borderColor: '#3b82f6',
    padding: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  starBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 50,
    height: 50,
    backgroundColor: '#3b82f6',
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
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
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
  count: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 4,
  },
  activeCount: {
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
  ctaBtn: {
    backgroundColor: '#3b82f6',
  },
});
