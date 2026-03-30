import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Share,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Users, Plus, UserPlus, Check, X, Share2, Crown, LogOut, Trash2 } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';
import { DEFAULT_IMAGES } from '../../../shared/constants/images';
import { getImageSource } from '../../../shared/utils/image';
import { useUserStore } from '../../../store/useUserStore';
import { useGroupStore } from '../../../store/useGroupStore';
import { userService } from '../../../services/api/user';
import { groupService } from '../../../services/api/group';
import { EntityResponse } from '../../../shared/types/entity';

export default function GroupManagementScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { userData } = useUserStore();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { group, setGroup, setIsLoading: setStoreLoading } = useGroupStore();
  const isOwner = group?.created_by === userData?.id;

  // Fetch user group
  const { refetch, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['user-group'],
    queryFn: async () => {
      const data = await userService.getMyGroup();
      setGroup(data);
      return data;
    },
    enabled: !group, // Don't fetch if already in store
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Create Group mutation
  const createGroupMutation = useMutation({
    mutationFn: (name: string) => userService.createGroup(name),
    onSuccess: (data: EntityResponse) => {
      setShowCreateModal(false);
      setGroupName('');
      setGroup(data.group || null);
      queryClient.invalidateQueries({ queryKey: ['user-group'] });
      Alert.alert(
        '🎉 Group Created!',
        `"${data.group?.name ?? 'Your group'}" is ready. You can now invite friends and swipe as a squad!`,
        [
          { text: 'Got it', style: 'cancel' },
        ]
      );
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create group');
    },
  });


  // Generate Invite Link mutation
  const inviteLinkMutation = useMutation({
    mutationFn: (groupId: string) => userService.generateInviteLink(groupId),
    onSuccess: async (inviteLink: string) => {
      try {
        await Share.share({
          message: `Join my dating group on Swipee! 🚀\n\nInvite Link: ${inviteLink}`,
          title: 'Swipee Group Invite',
        });
      } catch (error) {
        console.error('Sharing failed', error);
      }
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to generate invite link');
    },
  });
  // Kick Member mutation
  const kickMemberMutation = useMutation({
    mutationFn: (memberId: string) => groupService.kickMember(group!.id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-group'] });
      refetch();
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to kick member');
    },
  });

  // Leave Group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: () => groupService.leaveGroup(group!.id),
    onSuccess: () => {
      setGroup(null);
      queryClient.invalidateQueries({ queryKey: ['user-group'] });
      navigation.navigate('Home');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to leave group');
    },
  });

  // Disband Group mutation
  const disbandGroupMutation = useMutation({
    mutationFn: () => groupService.disbandGroup(group!.id),
    onSuccess: () => {
      setGroup(null);
      queryClient.invalidateQueries({ queryKey: ['user-group'] });
      navigation.navigate('Home');
      Alert.alert('Group Disbanded', 'Your group and all its matches have been removed.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to disband group');
    },
  });


  const handleKick = (memberId: string, memberName: string) => {
    Alert.alert(
      'Kick Member',
      `Are you sure you want to remove ${memberName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => kickMemberMutation.mutate(memberId) }
      ]
    );
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave this group? You won't be able to undo this.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => leaveGroupMutation.mutate() }
      ]
    );
  };

  const handleDisband = () => {
    Alert.alert(
      'Disband Group',
      `Are you sure? This will delete the group, along with all its matches and active conversations forever.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disband', style: 'destructive', onPress: () => disbandGroupMutation.mutate() }
      ]
    );
  };
  return (
    <ScreenLayout>
      <ScreenWithHeader>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color={colors.text} size={28} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Group Management</Text>
          <View style={{ width: 36 }} />
        </View>
      </ScreenWithHeader>

      <ScrollView
        contentContainerStyle={[styles.content, group && { paddingBottom: 110 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        {/* My Group Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>YOUR GROUP</Text>

          {isLoadingGroup ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : !group ? (
            <TouchableOpacity
              style={[styles.createCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowCreateModal(true)}
            >
              <View style={[styles.createIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Plus size={28} color={colors.primary} />
              </View>
              <View style={styles.createCardText}>
                <Text style={[styles.createCardTitle, { color: colors.text }]}>Start a New Group</Text>
                <Text style={[styles.createCardSub, { color: colors.textSecondary }]}>
                  Create a group to swipe and match as a squad
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.groupCardHeader}>
                <View style={[styles.groupIconContainer, { backgroundColor: colors.primary + '10' }]}>
                  <Users size={24} color={colors.primary} />
                </View>
                <View style={styles.groupInfo}>
                  <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
                  <View style={styles.groupBadgeContainer}>
                    {group.created_by === userData.id && (
                      <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}>
                        <Crown size={12} color="#d97706" />
                        <Text style={[styles.badgeText, { color: '#d97706' }]}>Owner</Text>
                      </View>
                    )}
                  </View>
                </View>
                {isOwner && (
                  <TouchableOpacity
                    style={[styles.disbandBtn, { backgroundColor: colors.error + '10' }]}
                    onPress={handleDisband}
                    disabled={disbandGroupMutation.isPending}
                  >
                    {disbandGroupMutation.isPending ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Trash2 size={20} color={colors.error} />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Members List */}
              <View style={styles.membersList}>
                <Text style={[styles.membersTitle, { color: colors.textSecondary }]}>Members ({group.members?.length || 0})</Text>
                {group.members?.map((member: any) => (
                  <View key={member.id} style={styles.memberRow}>
                    <Image
                      source={getImageSource(member.photos?.[0]?.url, DEFAULT_IMAGES.USER_AVATAR)}
                      style={styles.memberAvatar}
                    />
                    <Text style={[styles.memberName, { color: colors.text, flex: 1 }]}>
                      {member.full_name} {member.id === userData.id && '(You)'}
                    </Text>
                    {member.id === group.created_by ? (
                      <Crown size={18} color="#d97706" style={{ marginLeft: 6 }} />
                    ) : isOwner && member.id !== userData.id ? (
                      <TouchableOpacity
                        style={styles.kickBtn}
                        onPress={() => handleKick(member.id, member.full_name)}
                        disabled={kickMemberMutation.isPending}
                      >
                         <X size={20} color={colors.error} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>HOW GROUPS WORK</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { icon: '🎯', title: 'Unified Swiping', desc: 'Swipe and discover as a group.' },
              { icon: '🤝', title: 'Group Matching', desc: 'Match with other groups or solo users.' },
              { icon: '💬', title: 'Group Messages', desc: 'All group members can see conversations.' },
            ].map((item, idx) => (
              <View key={idx} style={[styles.infoRow, idx < 3 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <Text style={styles.infoIcon}>{item.icon}</Text>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer with Primary Action */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {!group ? null : isOwner ? (
          <TouchableOpacity
            style={[
              styles.inviteButton,
              { backgroundColor: colors.primary }
            ]}
            onPress={() => inviteLinkMutation.mutate(group.id)}
            disabled={inviteLinkMutation.isPending}
          >
            {inviteLinkMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Share2 size={20} color="white" />
                <Text style={styles.inviteButtonText}>
                  Invite to {group.name}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.inviteButton,
              { backgroundColor: colors.error }
            ]}
            onPress={handleLeave}
            disabled={leaveGroupMutation.isPending}
          >
            {leaveGroupMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <LogOut size={20} color="white" />
                <Text style={styles.inviteButtonText}>
                  Leave Group
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Create Group Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowCreateModal(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Name Your Group</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Choose a fun name that represents your squad!
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: isDark ? colors.background : '#f3f4f6', color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. The Adventure Squad"
              placeholderTextColor={colors.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn, { backgroundColor: isDark ? colors.background : '#f3f4f6' }]}
                onPress={() => setShowCreateModal(false)}
              >
                <X size={18} color={colors.textSecondary} />
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn, { backgroundColor: groupName.trim().length > 0 ? colors.primary : colors.border }]}
                onPress={() => groupName.trim() && createGroupMutation.mutate(groupName.trim())}
                disabled={!groupName.trim() || createGroupMutation.isPending}
              >
                {createGroupMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Check size={18} color="white" />
                    <Text style={[styles.modalBtnText, { color: 'white' }]}>Create</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24, // Optimized for modern devices
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  activeIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  activeIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeBanner: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 24,
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  activeBannerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  switchSoloButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  switchSoloText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  groupCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupInfo: { flex: 1 },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  groupBadgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  groupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  groupActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  groupActionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  membersList: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
  },
  membersTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  kickBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  disbandBtn: {
    padding: 8,
    borderRadius: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
  },
  addAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  addAnotherText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  createCardText: { flex: 1 },
  createCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  createCardSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoIcon: { fontSize: 22, marginRight: 14 },
  infoTextContainer: { flex: 1 },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalCancelBtn: {},
  modalConfirmBtn: {},
});
