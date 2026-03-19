import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Settings as SettingsIcon, Edit2, Shield, ChevronRight, Zap, Star, Check, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../../store/useUserStore';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useSubscriptionPlans } from '../../../services/api/monetization';
import { useTheme } from '../../../shared/hooks/useTheme';

// Modals
import BoostModal from '../components/BoostModal';
import CrushModal from '../components/CrushModal';
import { SubscriptionModal } from '../../dashboard/components/SubscriptionModal';
import VerifyAccountModal from '../components/VerifyAccountModal';
import SettingsModal from '../components/SettingsModal';

export default function ProfileScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { userData } = useUserStore();
  const { data: plans } = useSubscriptionPlans();
  const [showBoost, setShowBoost] = useState(false);
  const [showCrush, setShowCrush] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getFeatureValue = (planName: string, featureKey: string) => {
    const plan = plans?.find(p => p.name.toLowerCase() === planName.toLowerCase());
    if (!plan) return false;
    const feature = plan.features?.find(f => f.feature_key === featureKey);
    if (!feature || !feature.is_active) return false;

    if (feature.is_consumable && feature.amount > 0) {
      return `${feature.amount}/mo`;
    }
    return true;
  };

  const benefits = [
    { label: 'Unlimited Likes', key: 'unlimited_likes' },
    { label: 'See Who Likes', key: 'see_likes' },
    { label: 'Free Boost', key: 'monthly_boost' },
    { label: 'Free Crush', key: 'monthly_crush' },
    { label: 'Undo Swipe', key: 'undo_swipe' },
    { label: 'Hide Ads', key: 'hide_ads' },
  ].map(item => ({
    label: item.label,
    plus: getFeatureValue('Plus', item.key),
    premium: getFeatureValue('Premium', item.key),
    ultimate: getFeatureValue('Ultimate', item.key),
  }));

  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
            <SettingsIcon size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </ScreenWithHeader>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.profileSection}>
          <View style={[styles.imageContainer, { borderColor: colors.border }]}>
            <Image
              source={{ uri: userData.photos?.[0]?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.nameContainer}>
            <Text style={[styles.userName, { color: colors.text }]}>{userData.fullName || 'User Name'}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Edit2 size={16} color={colors.textSecondary} />
              <Text style={[styles.editText, { color: colors.textSecondary }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification Card */}
        <TouchableOpacity
          style={[styles.verifyCard, { backgroundColor: isDark ? colors.surface : '#f0fdfa' }]}
          onPress={() => setShowVerify(true)}
        >
          <View style={styles.verifyLeft}>
            <View style={[styles.verifyIconBg, { backgroundColor: '#0d9488' }]}>
              <Shield size={20} color="white" />
            </View>
            <View>
              <Text style={[styles.verifyTitle, { color: colors.text }]}>Verify account</Text>
              <Text style={[styles.verifySubtitle, { color: colors.textSecondary }]}>to get more attention</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: isDark ? colors.surface : '#fff1f2' }]}
            onPress={() => setShowBoost(true)}
          >
            <View style={[styles.actionIconBg, { backgroundColor: isDark ? colors.border : '#fee2e2' }]}>
              <Zap size={20} color="#ef4444" />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Boost profile</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>to get noticed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: isDark ? colors.surface : '#eff6ff' }]}
            onPress={() => setShowCrush(true)}
          >
            <View style={[styles.actionIconBg, { backgroundColor: isDark ? colors.border : '#dbeafe' }]}>
              <Star size={20} color="#3b82f6" />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Get Crush</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Send super likes</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Table Card */}
        <LinearGradient
          colors={['#111827', '#1f2937']}
          style={styles.premiumCard}
        >
          <View style={styles.premiumHeader}>
            <View style={styles.premiumLogoRow}>
              <Text style={styles.premiumLogo}>Swipee</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>FREE</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => setShowSubscription(true)}>
              <LinearGradient
                colors={['#ec4899', '#ef4444']}
                style={styles.upgradeBtnGradient}
              >
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColTitle}>What's included</Text>
              <Text style={styles.tablePlanTitle}>Plus</Text>
              <Text style={styles.tablePlanTitle}>Premium</Text>
              <Text style={styles.tablePlanTitle}>Ultimate</Text>
            </View>

            {benefits.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <View style={styles.rowItem}>
                  {typeof item.plus === 'boolean' ? (
                    item.plus ? <Check size={14} color="white" /> : <Lock size={14} color="rgba(255,255,255,0.4)" />
                  ) : <Text style={styles.rowText}>{item.plus}</Text>}
                </View>
                <View style={styles.rowItem}>
                  {typeof item.premium === 'boolean' ? (
                    item.premium ? <Check size={14} color="white" /> : <Lock size={14} color="rgba(255,255,255,0.4)" />
                  ) : <Text style={styles.rowText}>{item.premium}</Text>}
                </View>
                <View style={styles.rowItem}>
                  {typeof item.ultimate === 'boolean' ? (
                    item.ultimate ? <Check size={14} color="white" /> : <Lock size={14} color="rgba(255,255,255,0.4)" />
                  ) : <Text style={styles.rowText}>{item.ultimate}</Text>}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.seeAllBtn} onPress={() => setShowSubscription(true)}>
            <Text style={styles.seeAllText}>See all benefits</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Modals */}
        <BoostModal isOpen={showBoost} onClose={() => setShowBoost(false)} />
        <CrushModal isOpen={showCrush} onClose={() => setShowCrush(false)} />
        <SubscriptionModal
          isVisible={showSubscription}
          onClose={() => setShowSubscription(false)}
        />
        <VerifyAccountModal isOpen={showVerify} onClose={() => setShowVerify(false)} />
        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeSection: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  verifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  verifyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifyIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifySubtitle: {
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
  },
  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
  },
  premiumCard: {
    borderRadius: 24,
    padding: 20,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  premiumLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumLogo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  planBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  planBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  upgradeBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  upgradeBtnGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  upgradeBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tableColTitle: {
    flex: 2,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  tablePlanTitle: {
    flex: 1,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  rowLabel: {
    flex: 2,
    fontSize: 13,
    color: 'white',
  },
  rowItem: {
    flex: 1,
    alignItems: 'center',
  },
  rowText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  seeAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  seeAllText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
