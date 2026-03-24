import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X, ShieldCheck, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../shared/components/ui/Button';
import { useTheme } from '../../../shared/hooks/useTheme';

interface VerifyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerifyAccountModal({ isOpen, onClose }: VerifyAccountModalProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const handleVerify = () => {
    onClose();
    navigation.navigate('FaceVerification');
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
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.innerContent}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={48} color="white" />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Get Verified</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Verified users get up to 2x more matches and show others you're real.
            </Text>

            <View style={[styles.benefits, { backgroundColor: isDark ? colors.background : '#f0fdfa' }]}>
              {[
                'Blue checkmark on your profile',
                'Appear higher in search results',
                'Build trust with potential matches',
              ].map((benefit, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View style={[styles.checkInner, { backgroundColor: isDark ? colors.surface : 'white' }]}>
                    <Check size={12} color="#0d9488" strokeWidth={3} />
                  </View>
                  <Text style={[styles.benefitText, { color: isDark ? '#5eead4' : '#0f766e' }]} numberOfLines={0}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.instructionCard}>
              <Text style={[styles.instructionTitle, { color: colors.text }]}>How it works:</Text>
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                A quick real-time face scan to verify your identity. Fully on-device and secure.
              </Text>
            </View>

            <Button title="Verify Now" onPress={handleVerify} style={styles.verifyBtn} />
            <TouchableOpacity onPress={onClose} style={styles.maybeLater}>
              <Text style={[styles.maybeLaterText, { color: colors.textSecondary }]}>Maybe later</Text>
            </TouchableOpacity>
          </View>
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
    padding: 24,
  },
  content: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  innerContent: {
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#0d9488',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  benefits: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 4,
  },
  checkInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  instructionCard: {
    width: '100%',
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  verifyBtn: {
    backgroundColor: '#0d9488',
    width: '100%',
  },
  maybeLater: {
    marginTop: 16,
  },
  maybeLaterText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
