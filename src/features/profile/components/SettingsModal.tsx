import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Linking, Alert, TextInput } from 'react-native';
import { X, ChevronRight, LogOut, Bell, Shield, HelpCircle, Eye, Trash2, Smartphone } from 'lucide-react-native';
import { useUserStore } from '../../../store/useUserStore';
import { authService } from '../../../services/api/auth';
import { userService } from '../../../services/api/user';
import { signOutWithGoogle } from '../../auth/services/googleAuth';
import { useToastStore } from '../../../store/useToastStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { resetUser, userData } = useUserStore();
  const [notifications, setNotifications] = useState(true);
  const [isAppIconModalOpen, setIsAppIconModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { showToast } = useToastStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
          } catch (e) {
            console.error('Logout error:', e);
          } finally {
            await signOutWithGoogle();
            await resetUser();
            onClose();
          }
        }
      },
    ]);
  };

  const confirmDelete = async () => {
    if (deleteConfirmText === 'DELETE') {
      try {
        await userService.deleteAccount();
        // Only run these on success
        await signOutWithGoogle();
        await resetUser();
        setIsDeleteModalOpen(false);
        onClose();
        showToast('Account deleted successfully', 'success');
      } catch (e: any) {
        console.error('Delete account error:', e);
        showToast(e.response?.data?.message || 'Failed to delete account', 'error');
      }
    }
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  const appIcons = [
    { id: 'default', label: 'Default', color: '#ef4444' },
    { id: 'dark', label: 'Dark', color: '#1f2937' },
    { id: 'gold', label: 'Gold', color: '#fbbf24' },
  ];

  return (
    <>
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Account Settings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
                <View style={styles.card}>
                  <View style={styles.item}>
                    <View style={styles.itemLeft}>
                      <Shield size={20} color="#4b5563" />
                      <Text style={styles.itemLabel}>Email</Text>
                    </View>
                    <Text style={styles.itemValue}>{userData.email || 'maul@example.com'}</Text>
                  </View>

                  <View style={styles.item}>
                    <View style={styles.itemLeft}>
                      <Bell size={20} color="#4b5563" />
                      <Text style={styles.itemLabel}>Push Notifications</Text>
                    </View>
                    <Switch
                      value={notifications}
                      onValueChange={setNotifications}
                      trackColor={{ false: '#e5e7eb', true: '#ef4444' }}
                    />
                  </View>
                </View>
              </View>

              {/* App Settings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>APP SETTINGS</Text>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.item} onPress={() => setIsAppIconModalOpen(true)}>
                    <View style={styles.itemLeft}>
                      <Smartphone size={20} color="#4b5563" />
                      <Text style={styles.itemLabel}>Change App Icon</Text>
                    </View>
                    <ChevronRight size={18} color="#9ca3af" />
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.item, styles.lastItem]} onPress={() => setIsDeleteModalOpen(true)}>
                    <View style={styles.itemLeft}>
                      <Trash2 size={20} color="#ef4444" />
                      <Text style={[styles.itemLabel, { color: '#ef4444' }]}>Delete Account</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Support */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SUPPORT</Text>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.item} onPress={() => openURL('https://google.com')}>
                    <View style={styles.itemLeft}>
                      <HelpCircle size={20} color="#4b5563" />
                      <Text style={styles.itemLabel}>Help & Support</Text>
                    </View>
                    <ChevronRight size={18} color="#9ca3af" />
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.item, styles.lastItem]} onPress={() => openURL('https://google.com')}>
                    <View style={styles.itemLeft}>
                      <Shield size={20} color="#4b5563" />
                      <Text style={styles.itemLabel}>Terms of Service</Text>
                    </View>
                    <ChevronRight size={18} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <LogOut size={20} color="#ef4444" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.version}>Version 1.0.0</Text>
                <Text style={styles.copyright}>© 2024 Swipee Inc.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Change App Icon Modal */}
      <Modal visible={isAppIconModalOpen} transparent animationType="fade">
        <View style={styles.subModalOverlay}>
          <View style={styles.subModalContent}>
            <View style={styles.subModalHeader}>
              <Text style={styles.subModalTitle}>Change App Icon</Text>
              <TouchableOpacity onPress={() => setIsAppIconModalOpen(false)}>
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.iconGrid}>
              {appIcons.map((icon) => (
                <TouchableOpacity key={icon.id} style={styles.iconItem} onPress={() => setIsAppIconModalOpen(false)}>
                  <View style={[styles.iconBox, { backgroundColor: icon.color }]} />
                  <Text style={styles.iconLabel}>{icon.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={isDeleteModalOpen} transparent animationType="fade">
        <View style={styles.subModalOverlay}>
          <View style={styles.subModalContent}>
            <View style={styles.subModalHeader}>
              <Text style={styles.subModalTitle}>Confirm Deletion</Text>
              <TouchableOpacity onPress={() => setIsDeleteModalOpen(false)}>
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.deleteBody}>
              <Text style={styles.deleteText}>
                Data will be deleted permanently, please type word <Text style={{ fontWeight: 'bold' }}>DELETE</Text> in the text field below to confirm deletion of an object.
              </Text>
              <TextInput
                style={styles.deleteInput}
                placeholder="DELETE"
                placeholderTextColor="#9ca3af"
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                autoCapitalize="characters"
              />
              <View style={styles.subModalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsDeleteModalOpen(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteConfirmBtn, deleteConfirmText !== 'DELETE' && styles.disabledBtn]}
                  disabled={deleteConfirmText !== 'DELETE'}
                  onPress={confirmDelete}
                >
                  <Text style={styles.deleteConfirmBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    height: '80%',
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 14,
    color: '#9ca3af',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    gap: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#9ca3af',
  },
  subModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subModalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  subModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  iconItem: {
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  iconLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  deleteBody: {
    gap: 20,
  },
  deleteText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  deleteInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  subModalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  deleteConfirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  deleteConfirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
