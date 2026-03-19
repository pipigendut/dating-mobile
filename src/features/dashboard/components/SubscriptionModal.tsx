import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { X, Check, Star, Zap, Crown, Heart, Eye, Globe, ShieldOff, Coins } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../shared/components/ui/Button';
import { useSubscriptionPlans } from '../../subscription/api/useSubscription';
import { SubscriptionPlanFeature } from '../../../shared/types/monetization';
import { spacing } from '../../../shared/theme/theme';

interface SubscriptionModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialPlanId?: string;
}

const { width } = Dimensions.get('window');

const IconMap: Record<string, any> = {
  Heart,
  Eye,
  Star,
  Zap,
  Globe,
  ShieldOff,
  Check,
  Crown,
  Coins
};

const getPlanTheme = (name: string) => {
  const n = name.toLowerCase();
  if (n === 'plus') return { color: ['#ec4899', '#ef4444'], icon: Heart };
  if (n === 'premium') return { color: ['#9333ea', '#ec4899'], icon: Star };
  if (n === 'ultimate') return { color: ['#2563eb', '#9333ea'], icon: Zap };
  return { color: ['#9ca3af', '#4b5563'], icon: Star };
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isVisible, onClose, initialPlanId }) => {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const [selectedId, setSelectedId] = useState<string>();

  useEffect(() => {
    if (plans && plans.length > 0 && !selectedId) {
      const initial = initialPlanId || plans.find(p => (p.name || (p as any).Name)?.toLowerCase() === 'premium')?.id || (plans[0].id || (plans[0] as any).ID);
      setSelectedId(initial);
    }
  }, [plans, initialPlanId]);

  const currentPlan = plans?.find(p => (p.id || (p as any).ID) === selectedId);

  // Group features by category
  const groupedFeatures = currentPlan?.features?.reduce((acc: any, feature: SubscriptionPlanFeature) => {
    const category = feature.category || (feature as any).Category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, SubscriptionPlanFeature[]>) || {};

  if (isLoading || !plans) {
    return (
      <Modal visible={isVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </Modal>
    );
  }

  const theme = getPlanTheme(currentPlan?.name || '');
  const PlanIcon = theme.icon;

  const handleSubscribe = () => {
    if (!currentPlan) return;
    alert(`Success! You have selected ${currentPlan.name}. Proceed to payment...`);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <LinearGradient
            colors={['#111827', '#1f2937']}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>Upgrade your plan</Text>
                <Text style={styles.headerSubtitle}>Choose the plan that's right for you</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id || (plan as any).ID}
                  style={[styles.tab, selectedId === (plan.id || (plan as any).ID) && styles.activeTab]}
                  onPress={() => setSelectedId(plan.id || (plan as any).ID)}
                >
                  <Text style={[styles.tabText, selectedId === (plan.id || (plan as any).ID) && styles.activeTabText]}>
                    {plan.name || (plan as any).Name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {currentPlan && (
              <>
                <LinearGradient
                  colors={theme.color as any}
                  style={styles.heroCard}
                >
                  <View style={styles.iconBg}>
                    <PlanIcon size={32} color="white" />
                  </View>
                  <Text style={styles.planName}>{currentPlan.name || (currentPlan as any).Name}</Text>
                  
                  {/* Show first price as primary or handle multiple prices */}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceValue}>
                      {(currentPlan.prices || (currentPlan as any).Prices)?.[0]?.currency || (currentPlan.prices || (currentPlan as any).Prices)?.[0]?.Currency} {(currentPlan.prices || (currentPlan as any).Prices)?.[0]?.price || (currentPlan.prices || (currentPlan as any).Prices)?.[0]?.Price}
                    </Text>
                    <Text style={styles.pricePeriod}>/{(currentPlan.prices || (currentPlan as any).Prices)?.[0]?.duration_type || (currentPlan.prices || (currentPlan as any).Prices)?.[0]?.DurationType || 'month'}</Text>
                  </View>

                  <Button
                    title={`Subscribe to ${currentPlan.name || (currentPlan as any).Name}`}
                    variant="outline"
                    onPress={handleSubscribe}
                    style={styles.heroBtn}
                    textStyle={{ color: 'white' }}
                  />
                </LinearGradient>

                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsTitle}>What's included in {currentPlan.name || (currentPlan as any).Name}</Text>
                  
                  {Object.entries(groupedFeatures).map(([category, features]: [string, any[]]) => (
                    <View key={category} style={styles.categoryGroup}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      {features.map((feature: any) => {
                        const iconName = feature.icon || feature.Icon;
                        const IconComponent = IconMap[iconName] || (feature.is_consumable || feature.IsConsumable ? Coins : Check);
                        return (
                          <View key={feature.id || feature.ID} style={styles.benefitItem}>
                            <View style={styles.benefitIconBg}>
                              <IconComponent size={18} color="#6366f1" />
                            </View>
                            <View style={styles.benefitTextContainer}>
                              <Text style={styles.benefitBtnText}>
                                {feature.display_title || feature.DisplayTitle || feature.feature_key?.replace(/_/g, ' ')}
                              </Text>
                              {(feature.is_consumable || feature.IsConsumable) && (
                                <Text style={styles.consumableBadge}>Consumable</Text>
                              )}
                            </View>
                            <View style={{ flex: 1 }} />
                            { (feature.is_active || feature.IsActive) && <Check size={18} color="#22c55e" /> }
                          </View>
                        );
                      })}
                    </View>
                  ))}
                  
                  {/* If more than 1 price, show options */}
                  {(currentPlan.prices || (currentPlan as any).Prices) && (currentPlan.prices || (currentPlan as any).Prices).length > 1 && (
                    <View style={styles.otherPrices}>
                      <Text style={styles.otherPricesTitle}>Other options:</Text>
                      {(currentPlan.prices || (currentPlan as any).Prices).slice(1).map((p: any) => (
                        <TouchableOpacity key={p.id || p.ID} style={styles.priceOption} onPress={handleSubscribe}>
                          <Text style={styles.priceOptionText}>{p.duration_type || p.DurationType}: {p.currency || p.Currency} {p.price || p.Price}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    height: '95%',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    paddingTop: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
  },
  heroCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  iconBg: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  pricePeriod: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  heroBtn: {
    borderColor: 'white',
    borderWidth: 2,
    width: '100%',
  },
  benefitsSection: {
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryGroup: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  benefitTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  benefitBtnText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  consumableBadge: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 2,
  },
  benefitIconBg: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  otherPrices: {
    marginTop: 20,
    gap: 10,
  },
  otherPricesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 5,
  },
  priceOption: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceOptionText: {
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
});
