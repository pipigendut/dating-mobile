import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Users, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react-native';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { useTheme } from '../../../shared/hooks/useTheme';
import apiClient from '../../../services/api/client';
import { useUserStore } from '../../../store/useUserStore';

export default function InviteAcceptScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { token } = route.params || {};
  const { refreshUser } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }
    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/group-invites/validate?token=${token}`);
      if (res.data && res.data.success) {
        setInviteData(res.data.data);
      } else {
        setError(res.data.message || 'Invitation is no longer valid');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to validate invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      const res = await apiClient.post('/group-invites/accept', { token });
      if (res.data && res.data.success) {
        // Refresh user store to get new active_entity_id
        await refreshUser();
        // Go to Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        setError(res.data.message || 'Failed to accept invitation');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Validating invitation...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color={colors.text} size={28} />
          </TouchableOpacity>
          <View style={styles.content}>
            <XCircle size={80} color="#ef4444" strokeWidth={1.5} />
            <Text style={[styles.title, { color: colors.text }]}>Oops!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.actionBtnText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Users size={60} color={colors.primary} strokeWidth={1.5} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>Double Date Invite!</Text>
          
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{inviteData?.inviter_name}</Text> invited you to join their group:
            </Text>
            <Text style={[styles.groupName, { color: colors.primary }]}>{inviteData?.group_name}</Text>
          </View>

          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            By joining this group, you will be able to swipe together with your friend. You can only be in one group at a time.
          </Text>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <CheckCircle2 color="white" size={20} />
                <Text style={styles.actionBtnText}>Accept & Join Group</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Main')}
            disabled={isAccepting}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  backBtn: {
    marginTop: 10,
    marginLeft: -10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  actionBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryBtn: {
    marginTop: 20,
    padding: 10,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
