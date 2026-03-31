import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Bell, BellOff, MessageCircle, Heart, Flame, Sparkles, ChevronLeft, Info } from 'lucide-react-native';
import { getMessaging, hasPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useNotificationStore, NotificationSetting } from '../../../store/useNotificationStore';
import { FCMService } from '../../../services/notifications/FCMService';
import { useToastStore } from '../../../store/useToastStore';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SETTING_ICONS: Record<string, any> = {
  new_message: MessageCircle,
  new_match:   Flame,
  new_like:    Heart,
  new_crush:   Sparkles,
};

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const { showToast } = useToastStore();
  const { 
    pushEnabled, 
    setPushEnabled, 
    settings, 
    setSetting, 
    initialize, 
    isLoading 
  } = useNotificationStore();

  // Sync state with OS permission on open
  useEffect(() => {
    if (!isOpen) return;
    
    initialize();

    (async () => {
      const status = await hasPermission(getMessaging());
      const granted =
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL;
      setPushEnabled(granted);
    })();
  }, [isOpen]);

  const handleMasterToggle = async (value: boolean) => {
    if (!value) {
      setPushEnabled(false);
      return;
    }

    const currentStatus = await hasPermission(getMessaging());

    if (
      currentStatus === AuthorizationStatus.AUTHORIZED ||
      currentStatus === AuthorizationStatus.PROVISIONAL
    ) {
      setPushEnabled(true);
      return;
    }

    if (currentStatus === AuthorizationStatus.NOT_DETERMINED) {
      const granted = await FCMService.requestPermission();
      if (granted) {
        setPushEnabled(true);
        await FCMService.registerDevice();
        showToast('Push notifications enabled', 'success');
      }
      return;
    }

    // Still Denied
    Alert.alert(
      'Allow Notifications',
      'Notifications are currently blocked. Please enable them in your device settings to receive updates.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
  };

  const renderSettingItem = (setting: NotificationSetting) => {
    const Icon = SETTING_ICONS[setting.type] || Bell;
    const isChannelDisabled = !pushEnabled;

    return (
      <View key={setting.id} style={[styles.settingItem, { borderBottomColor: isDark ? '#2e2e2e' : '#f3f4f6' }]}>
        <View style={styles.settingInfo}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2e2e2e' : '#f9fafb' }]}>
            <Icon size={20} color={isChannelDisabled ? colors.textSecondary : colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.settingTitle, { color: isChannelDisabled ? colors.textSecondary : colors.text }]}>
              {setting.title}
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {setting.description}
            </Text>
          </View>
        </View>
        <Switch
          value={setting.is_user_enable}
          onValueChange={(val) => setSetting(setting.id, val)}
          disabled={isChannelDisabled}
          trackColor={{ false: isDark ? '#3f3f3f' : '#e5e7eb', true: colors.primary + '40' }}
          thumbColor={setting.is_user_enable ? colors.primary : '#9ca3af'}
        />

      </View>
    );
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: isDark ? '#2e2e2e' : '#f3f4f6' }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={[styles.masterCard, { backgroundColor: isDark ? colors.surface : '#fff', borderColor: isDark ? '#2e2e2e' : '#f3f4f6' }]}>
              <View style={styles.masterInfo}>
                <View style={[styles.masterIcon, { backgroundColor: pushEnabled ? colors.primary + '15' : (isDark ? '#2e2e2e' : '#f3f4f6') }]}>
                  {pushEnabled ? (
                    <Bell size={24} color={colors.primary} />
                  ) : (
                    <BellOff size={24} color={colors.textSecondary} />
                  )}
                </View>
                <View style={styles.masterText}>
                  <Text style={[styles.masterTitle, { color: colors.text }]}>
                    Push Notifications
                  </Text>
                  <Text style={[styles.masterDescription, { color: colors.textSecondary }]}>
                    {pushEnabled ? 'Currently receiving notifications' : 'Notifications are paused'}
                  </Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={handleMasterToggle}
                  trackColor={{ false: isDark ? '#3f3f3f' : '#e5e7eb', true: colors.primary + '40' }}
                  thumbColor={pushEnabled ? colors.primary : '#9ca3af'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CHANNELS</Text>
            <View style={[styles.settingsList, { backgroundColor: isDark ? colors.surface : '#fff', borderColor: isDark ? '#2e2e2e' : '#f3f4f6' }]}>
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : (
                settings.map(renderSettingItem)
              )}
            </View>
            
            <View style={styles.infoBox}>
              <Info size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Choose exactly which activities you want to be notified about.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  masterCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  masterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  masterText: {
    flex: 1,
    marginLeft: 16,
  },
  masterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  masterDescription: {
    fontSize: 13,
  },
  settingsList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
