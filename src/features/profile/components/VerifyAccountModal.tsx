import React from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, Alert } from 'react-native';
import { X, ShieldCheck, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../../shared/components/ui/Button';

interface VerifyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerifyAccountModal({ isOpen, onClose }: VerifyAccountModalProps) {
  const handleVerify = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your camera to verify your identity.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      // Simulate API call
      setTimeout(() => {
        Alert.alert(
          'Verification Sent',
          'Verifikasi wajah in progress. Result will info later',
          [{ text: 'OK', onPress: onClose }]
        );
      }, 500);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color="#374151" />
          </TouchableOpacity>

          <View style={styles.innerContent}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={48} color="white" />
            </View>

            <Text style={styles.title}>Get Verified</Text>
            <Text style={styles.subtitle}>
              Verified users get up to 2x more matches and show others you're real.
            </Text>

            <View style={styles.benefits}>
              {[
                'Blue checkmark on your profile',
                'Appear higher in search results',
                'Build trust with potential matches',
              ].map((benefit, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View style={styles.checkInner}>
                    <Check size={12} color="#0d9488" strokeWidth={3} />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>How it works:</Text>
              <Text style={styles.instructionText}>
                Take a quick selfie mimicking a specific pose. Our AI will compare it with your profile photos.
              </Text>
            </View>

            <Button title="Verify Now" onPress={handleVerify} style={styles.verifyBtn} />
            <TouchableOpacity onPress={onClose} style={styles.maybeLater}>
              <Text style={styles.maybeLaterText}>Maybe later</Text>
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
    backgroundColor: 'white',
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
    color: '#111827',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  benefits: {
    width: '100%',
    backgroundColor: '#f0fdfa',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '600',
  },
  instructionCard: {
    width: '100%',
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: '#6b7280',
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
    color: '#9ca3af',
    fontWeight: '600',
  },
});
