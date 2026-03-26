import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X, Zap, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../shared/components/ui/Button';
import { useConsumableItems, usePurchaseConsumable } from '../../../services/api/monetization';
import { useTheme } from '../../../shared/hooks/useTheme';
import { boostKeys } from '../../../services/api/boost';
import { useQueryClient } from '@tanstack/react-query';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoostModal({ isOpen, onClose }: BoostModalProps) {
  const { data: items, isLoading } = useConsumableItems();
  const purchaseMutation = usePurchaseConsumable();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>();
  const { colors, isDark } = useTheme();

  const boosts = items?.filter(item => item.item_type === 'boost') || [];

  React.useEffect(() => {
    if (boosts.length > 0 && !selectedId) {
      const middleIndex = Math.floor(boosts.length / 2);
      setSelectedId(boosts[middleIndex].id);
    }
  }, [boosts]);

  const handlePurchase = async () => {
    if (!selectedId) return;

    try {
      await purchaseMutation.mutateAsync(selectedId);
      Alert.alert('Success', 'Boost purchased successfully!');
      queryClient.invalidateQueries({ queryKey: boostKeys.availability() });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to purchase boost');
    }
  };


  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]} onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.title, { color: colors.text }]}>Boost your profile</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Stay at the top of the search and attract more matches</Text>

            <View style={styles.previewContainer}>
              <View style={styles.imageRing}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1770364017468-e755d33941e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHh8MXx8eW91bmclMjB3b21hbiUyMGFzaWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHwxNzcxMzI3MjYxfDA&ixlib=rb-4.1.0&q=80&w=1080' }}
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
                  <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.packagesGrid}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#ef4444" style={{ flex: 1, padding: 40 }} />
              ) : (
                boosts.map((pkg, index) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[
                      styles.packageCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      selectedId === pkg.id && { borderColor: '#ef4444', backgroundColor: isDark ? '#2a1a1a' : '#fef2f2' }
                    ]}
                    onPress={() => setSelectedId(pkg.id)}
                  >
                    {index === Math.floor(boosts.length / 2) && (
                      <LinearGradient
                        colors={['#9333ea', '#ec4899']}
                        style={styles.bestBadge}
                      >
                        <Text style={styles.bestText}>BEST</Text>
                      </LinearGradient>
                    )}
                    <Text style={[styles.multiplier, { color: colors.textSecondary }, selectedId === pkg.id && { color: colors.text }]}>
                      {pkg.amount}x
                    </Text>
                    <Text style={[styles.price, { color: colors.text }]}>
                      IDR {pkg.price.toLocaleString('id-ID')}
                    </Text>
                    <Text style={[styles.pricePer, { color: colors.textSecondary }]}>per one</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <Button
              title="Get Boost"
              onPress={handlePurchase}
              loading={purchaseMutation.isPending}
            />
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
