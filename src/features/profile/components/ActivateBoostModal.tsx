import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X, Zap, CheckCircle, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../shared/components/ui/Button';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useBoostAvailability, useActivateBoost } from '../../../services/api/boost';

interface ActivateBoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetMore: () => void;
}

type ModalStatus = 'idle' | 'success' | 'error';

export default function ActivateBoostModal({ isOpen, onClose, onGetMore }: ActivateBoostModalProps) {
  const { colors, isDark } = useTheme();
  const { data: boostData } = useBoostAvailability();
  const activateMutation = useActivateBoost();
  const boostAmount = boostData?.boost_amount ?? 0;
  const isBoostActive = boostData?.is_boosted ?? false;
  const isLoading = activateMutation.isPending;
  const [status, setStatus] = useState<ModalStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync();
      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to activate boost');
      setStatus('error');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  const renderContent = () => {
    if (status === 'success') {
      return (
        <View style={styles.container}>
          <View style={[styles.successIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <CheckCircle size={60} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Boost Activated!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            You're now more visible to people around you.
          </Text>
          <Button
            title="Done"
            onPress={handleClose}
            style={styles.actionBtn}
          />
        </View>
      );
    }

    if (status === 'error') {
      return (
        <View style={styles.container}>
          <View style={[styles.errorIconContainer, { backgroundColor: '#fee2e2' }]}>
            <AlertCircle size={60} color="#ef4444" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Activation Failed</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {errorMessage}
          </Text>
          <Button
            title="Try Again"
            onPress={() => setStatus('idle')}
            style={styles.actionBtn}
          />
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleClose}>
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#9333ea', '#ec4899']}
          style={styles.iconContainer}
        >
          <Zap size={40} color="white" fill="white" />
        </LinearGradient>

        <Text style={[styles.title, { color: colors.text }]}>Activate Boost</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Increase your visibility for 1 hour and get more matches!
        </Text>

        <View style={[styles.balanceBox, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }]}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Available Boosts</Text>
          <Text style={[styles.balanceValue, { color: colors.primary }]}>{boostAmount}</Text>
        </View>

        <Button
          title={isBoostActive ? "Boost is Already Active" : "Activate Now"}
          onPress={handleActivate}
          loading={isLoading}
          disabled={isBoostActive}
          style={styles.actionBtn}
        />

        <TouchableOpacity style={styles.secondaryBtn} onPress={onGetMore}>
          <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Get more boosts</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}
            onPress={handleClose}
          >
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {renderContent()}
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
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    borderRadius: 30,
    padding: 30,
    position: 'relative',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  balanceBox: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  actionBtn: {
    width: '100%',
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
