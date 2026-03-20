import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Zap, Crown, CreditCard, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useSubscriptionPlans, useConsumableItems } from '../../../services/api/monetization';
import {
  useAdminSubscribe,
  useAdminAddBoost,
  useAdminAddCrush,
  useAdminConfigs,
  useAdminReloadConfigs,
} from '../../../services/api/admin';
import { useUserStore } from '../../../store/useUserStore';
import { ConsumableItem } from '../../../shared/types/monetization';
import { mapUserResponseToData } from '../../../utils/userMapper';

interface AdminPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AdminPanel({ isVisible, onClose }: AdminPanelProps) {
  const { colors } = useTheme();
  const { userData } = useUserStore();

  const { data: adminConfigs, isSuccess: isAdminConfigsLoaded } = useAdminConfigs();
  const isWhitelisted = !!adminConfigs && isAdminConfigsLoaded;

  const { data: plans } = useSubscriptionPlans();
  const { data: consumableItems } = useConsumableItems();

  const boostPackages = (consumableItems ?? []).filter((item) => item.item_type === 'boost');
  const crushPackages = (consumableItems ?? []).filter((item) => item.item_type === 'crush');

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedBoostPackageId, setSelectedBoostPackageId] = useState<string>('');
  const [selectedCrushPackageId, setSelectedCrushPackageId] = useState<string>('');

  // Set defaults once packages are loaded
  useEffect(() => {
    if (boostPackages.length > 0 && !selectedBoostPackageId) {
      setSelectedBoostPackageId(boostPackages[0].id);
    }
  }, [boostPackages.length]);

  useEffect(() => {
    if (crushPackages.length > 0 && !selectedCrushPackageId) {
      setSelectedCrushPackageId(crushPackages[0].id);
    }
  }, [crushPackages.length]);

  const adminSubscribe = useAdminSubscribe();
  const adminAddBoost = useAdminAddBoost();
  const adminAddCrush = useAdminAddCrush();
  const adminReloadConfigs = useAdminReloadConfigs();

  const userId = userData.id;

  const handleReloadConfigs = () => {
    adminReloadConfigs.mutate(undefined, {
      onSuccess: () => Alert.alert('✅ Success', 'Configs reloaded successfully!'),
      onError: (e: any) =>
        Alert.alert('❌ Error', e?.response?.data?.message || e.message || 'Failed to reload configs'),
    });
  };

  const handleSubscribe = () => {
    if (!userId || !selectedPlanId) {
      Alert.alert('Error', 'Please select a plan and ensure you are logged in.');
      return;
    }
    adminSubscribe.mutate(
      { user_id: userId, plan_id: selectedPlanId },
      {
        onSuccess: (updatedUserResponse: any) => {
          const mappedData = mapUserResponseToData(updatedUserResponse);
          useUserStore.getState().setUserData(mappedData);
          Alert.alert('✅ Success', 'Subscribed successfully!');
        },
        onError: (e: any) =>
          Alert.alert('❌ Error', e?.response?.data?.message || e.message || 'Failed to subscribe'),
      }
    );
  };

  const handleAddBoost = () => {
    if (!userId) return;
    adminAddBoost.mutate(
      { user_id: userId, package_id: selectedBoostPackageId },
      {
        onSuccess: (updatedUserResponse: any) => {
          const mappedData = mapUserResponseToData(updatedUserResponse);
          useUserStore.getState().setUserData(mappedData);
          Alert.alert('✅ Success', 'Boost units added!');
        },
        onError: (e: any) =>
          Alert.alert('❌ Error', e?.response?.data?.message || e.message || 'Failed to add boosts'),
      }
    );
  };

  const handleAddCrush = () => {
    if (!userId) return;
    adminAddCrush.mutate(
      { user_id: userId, package_id: selectedCrushPackageId },
      {
        onSuccess: (updatedUserResponse: any) => {
          const mappedData = mapUserResponseToData(updatedUserResponse);
          useUserStore.getState().setUserData(mappedData);
          Alert.alert('✅ Success', 'Crush units added!');
        },
        onError: (e: any) =>
          Alert.alert('❌ Error', e?.response?.data?.message || e.message || 'Failed to add crushes'),
      }
    );
  };

  if (!isWhitelisted) {
    return null; // Completely hidden for non-whitelisted users
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.badge, { backgroundColor: '#FF6B35' }]}>
              <Text style={styles.badgeText}>DEV</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={handleReloadConfigs} 
              style={styles.headerBtn}
              disabled={adminReloadConfigs.isPending}
            >
              {adminReloadConfigs.isPending ? (
                <ActivityIndicator size="small" color={colors.textSecondary} />
              ) : (
                <RefreshCw size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* User info */}
          <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Logged in as</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userData.email}</Text>
            <Text style={[styles.infoLabel, { color: colors.textSecondary, marginTop: 2 }]}>User ID</Text>
            <Text style={[styles.infoValueSmall, { color: colors.textSecondary }]}>{userId ?? '—'}</Text>
          </View>

          {/* ── Subscribe ── */}
          <SectionHeader icon={<CreditCard size={16} color="#7C3FFF" />} title="Subscription" color="#7C3FFF" />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Select Plan</Text>
          <View style={styles.chipRow}>
            {(plans ?? []).map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      selectedPlanId === plan.id ? '#7C3FFF' : colors.surface,
                    borderColor: selectedPlanId === plan.id ? '#7C3FFF' : colors.border,
                  },
                ]}
                onPress={() => setSelectedPlanId(plan.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedPlanId === plan.id ? '#fff' : colors.text },
                  ]}
                >
                  {plan.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#7C3FFF', opacity: !selectedPlanId || adminSubscribe.isPending ? 0.6 : 1 }]}
            onPress={handleSubscribe}
            disabled={!selectedPlanId || adminSubscribe.isPending}
          >
            {adminSubscribe.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Apply Subscription</Text>
            )}
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ── Boost ── */}
          <SectionHeader icon={<Zap size={16} color="#F59E0B" />} title="Boost" color="#F59E0B" />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Select Package</Text>
          <View style={styles.chipRow}>
            {boostPackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedBoostPackageId === pkg.id ? '#F59E0B' : colors.surface,
                    borderColor: selectedBoostPackageId === pkg.id ? '#F59E0B' : colors.border,
                  },
                ]}
                onPress={() => setSelectedBoostPackageId(pkg.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedBoostPackageId === pkg.id ? '#fff' : colors.text },
                  ]}
                >
                  {pkg.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#F59E0B', opacity: adminAddBoost.isPending ? 0.6 : 1 }]}
            onPress={handleAddBoost}
            disabled={adminAddBoost.isPending}
          >
            {adminAddBoost.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Add Boosts</Text>
            )}
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ── Crush ── */}
          <SectionHeader icon={<Crown size={16} color="#EC4899" />} title="Crush" color="#EC4899" />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Select Package</Text>
          <View style={styles.chipRow}>
            {crushPackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedCrushPackageId === pkg.id ? '#EC4899' : colors.surface,
                    borderColor: selectedCrushPackageId === pkg.id ? '#EC4899' : colors.border,
                  },
                ]}
                onPress={() => setSelectedCrushPackageId(pkg.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedCrushPackageId === pkg.id ? '#fff' : colors.text },
                  ]}
                >
                  {pkg.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#EC4899', opacity: adminAddCrush.isPending ? 0.6 : 1 }]}
            onPress={handleAddCrush}
            disabled={adminAddCrush.isPending}
          >
            {adminAddCrush.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Add Crushes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function SectionHeader({
  icon,
  title,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    padding: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  infoBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  infoValueSmall: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
});
