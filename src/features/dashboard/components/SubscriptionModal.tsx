import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Check, Star, Zap, Eye, Globe, ShieldOff, RotateCcw, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../shared/components/ui/Button';
import { useUser } from '../../../app/providers/UserContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: 'plus' | 'premium' | 'ultimate';
}

const subscriptionPlans = [
  { id: 'plus', name: 'Plus', price: 'Rp 54.000', period: '/month', color: ['#ec4899', '#ef4444'], icon: Heart },
  { id: 'premium', name: 'Premium', price: 'Rp 129.000', period: '/month', color: ['#9333ea', '#ec4899'], icon: Star },
  { id: 'ultimate', name: 'Ultimate', price: 'Rp 199.000', period: '/month', color: ['#2563eb', '#9333ea'], icon: Zap },
];

const allBenefits = [
  {
    category: 'Match+',
    items: [
      { id: 'unlimited-likes', icon: Star, title: 'Unlimited Likes', plans: ['plus', 'premium', 'ultimate'] },
      { id: 'see-who-likes', icon: Eye, title: 'See who likes you', plans: ['premium', 'ultimate'] },
      { id: 'priority-likes', icon: Star, title: 'Priority Likes', plans: ['premium', 'ultimate'] },
    ],
  },
  {
    category: 'Take Control',
    items: [
      { id: 'free-boost', icon: Zap, title: '1 free boost per month', plans: ['premium', 'ultimate'] },
      { id: 'passport-mode', icon: Globe, title: 'Passport Mode', plans: ['ultimate'] },
      { id: 'hide-ads', icon: X, title: 'Hide Ads', plans: ['plus', 'premium', 'ultimate'] },
    ],
  },
];

export default function SubscriptionModal({ isOpen, onClose, initialPlan = 'premium' }: SubscriptionModalProps) {
  const { userData, setUserData } = useUser();
  const [selected, setSelected] = useState(initialPlan);

  const currentPlan = subscriptionPlans.find(p => p.id === selected)!;
  const PlanIcon = currentPlan.icon;

  const handleSubscribe = () => {
    setUserData({
      ...userData,
      subscriptionPlan: selected as any
    });
    alert(`Success! You have subscribed to ${currentPlan.name}.`);
    onClose();
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
              {subscriptionPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.tab, selected === plan.id && styles.activeTab]}
                  onPress={() => setSelected(plan.id as any)}
                >
                  <Text style={[styles.tabText, selected === plan.id && styles.activeTabText]}>
                    {plan.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <LinearGradient
              colors={currentPlan.color as any}
              style={styles.heroCard}
            >
              <View style={styles.iconBg}>
                <PlanIcon size={32} color="white" />
              </View>
              <Text style={styles.planName}>{currentPlan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>{currentPlan.price}</Text>
                <Text style={styles.pricePeriod}>{currentPlan.period}</Text>
              </View>
              <Button
                title={`Subscribe to ${currentPlan.name}`}
                variant="outline"
                onPress={handleSubscribe}
                style={styles.heroBtn}
                textStyle={{ color: 'white' }}
              />
            </LinearGradient>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>What's included in {currentPlan.name}</Text>
              {allBenefits.map((cat) => {
                const filtered = cat.items.filter(i => i.plans.includes(selected));
                if (filtered.length === 0) return null;
                return (
                  <View key={cat.category} style={styles.category}>
                    <Text style={styles.catTitle}>{cat.category}</Text>
                    {filtered.map(item => (
                      <View key={item.id} style={styles.benefitItem}>
                        <View style={styles.benefitIconBg}>
                          <item.icon size={18} color="#374151" />
                        </View>
                        <Text style={styles.benefitBtnText}>{item.title}</Text>
                        <Check size={20} color="#22c55e" />
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
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
  },
  content: {
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
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 25,
  },
  category: {
    marginBottom: 20,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
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
  benefitBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});
