import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../../shared/hooks/useTheme';
import { X, CheckCircle2, ShieldCheck, AlertTriangle, Camera as CameraIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../store/useUserStore';
import * as ImageManipulator from 'expo-image-manipulator';
import apiClient from '../../../services/api/client';
import { mapUserResponseToData } from '../../../utils/userMapper';

export default function FaceVerificationScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { userData, setUserData } = useUserStore();

  const mainPhoto = userData.photos?.find((p: any) => p.isMain);

  const [status, setStatus] = useState<'align' | 'countdown' | 'matching' | 'verified' | 'failed' | 'limit_exceeded'>('align');
  const [countdown, setCountdown] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0);

  // Handle countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        handleCompleteVerification();
      }
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  const startCountdown = () => {
    setCountdown(3);
    setStatus('countdown');
  };

  const handleCompleteVerification = async () => {
    if (isProcessing) return;
    setStatus('matching');
    setIsProcessing(true);
    setMatchProgress(10);

    try {
      if (!cameraRef.current) throw new Error("Camera not ready");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        shutterSound: false,
      });

      setMatchProgress(30);

      const manipulated = await ImageManipulator.manipulateAsync(
        photo!.uri,
        [{ resize: { width: 400 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      setMatchProgress(50);

      const formData = new FormData();
      // @ts-ignore
      formData.append('photo', {
        uri: manipulated.uri,
        name: 'verification.jpg',
        type: 'image/jpeg',
      });

      setMatchProgress(70);

      const response = await apiClient.post('/users/verify-face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMatchProgress(100);

      if (response.data && response.data.is_match) {
        setStatus('verified');
        if (response.data.user) {
          setUserData(mapUserResponseToData(response.data.user));
        } else {
          setUserData({ verifiedAt: new Date().toISOString() });
        }
      } else {
        setStatus('failed');
      }
    } catch (error: any) {
      console.error('Verification API error:', error);
      
      if (error.response?.status === 429) {
        setStatus('limit_exceeded');
      } else {
        setStatus('failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission || !permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Camera permission is required</Text>
        <TouchableOpacity onPress={requestPermission} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <ShieldCheck size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Identity Verification</Text>
        </View>
      </View>
      
      {status === 'verified' ? (
        <View style={styles.resultContainer}>
          <View style={styles.successIconBg}>
            <CheckCircle2 size={80} color="#10b981" />
          </View>
          <Text style={[styles.resultTitle, { color: colors.text }]}>Verification Successful!</Text>
          <TouchableOpacity 
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>Return to Profile</Text>
          </TouchableOpacity>
        </View>
      ) : status === 'failed' ? (
        <View style={styles.resultContainer}>
          <View style={[styles.successIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <X size={80} color="#ef4444" />
          </View>
          <Text style={[styles.resultTitle, { color: colors.text }]}>Verification Failed</Text>
          <Text style={[styles.resultSub, { color: colors.textSecondary }]}>
            The face captured does not match your profile photo. Please try again in better lighting.
          </Text>
          <TouchableOpacity 
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setStatus('align');
              setMatchProgress(0);
            }}
          >
            <Text style={styles.doneBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : status === 'limit_exceeded' ? (
        <View style={styles.resultContainer}>
          <View style={[styles.successIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <AlertTriangle size={80} color="#f59e0b" />
          </View>
          <Text style={[styles.resultTitle, { color: colors.text }]}>Daily Limit Reached</Text>
          <Text style={[styles.resultSub, { color: colors.textSecondary }]}>
            You have exceeded the maximum number of face verification attempts allowed for today. Please come back and try again tomorrow.
          </Text>
          <TouchableOpacity 
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>Understood</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.cameraContainer}>
            <View style={styles.cameraFrame}>
              <CameraView 
                // @ts-ignore
                ref={cameraRef}
                style={styles.camera} 
                facing="front"
                mode="picture"
                flash="off"
                animateShutter={false}
              >
                <View style={styles.overlay}>
                  <View style={[
                    styles.guide, 
                    { borderColor: status === 'countdown' ? colors.primary : 'rgba(255,255,255,0.5)' }
                  ]} />
                </View>
                
                {mainPhoto && (
                  <View style={styles.referenceContainer}>
                    <Text style={styles.referenceLabel}>Matching with:</Text>
                    <Image source={{ uri: mainPhoto.url }} style={styles.referenceImage} />
                  </View>
                )}
              </CameraView>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={[styles.instruction, { color: colors.text }]}>
              {status === 'align' && "Align your face in the frame"}
              {status === 'countdown' && `Hold still... ${countdown}`}
              {status === 'matching' && `Analyzing Match: ${matchProgress}%`}
            </Text>
            
            {status === 'align' && (
              <TouchableOpacity 
                style={[styles.captureBtn, { backgroundColor: colors.primary }]}
                onPress={startCountdown}
              >
                <CameraIcon color="white" size={24} style={{ marginRight: 8 }} />
                <Text style={styles.captureBtnText}>I'm Ready</Text>
              </TouchableOpacity>
            )}
          </View>

          {status === 'matching' && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: 'white' }]}>Comparing biometric data...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 15 },
  closeBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  cameraContainer: { flex: 1, paddingHorizontal: 20 },
  cameraFrame: { flex: 1, borderRadius: 40, overflow: 'hidden', backgroundColor: 'black', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  guide: { width: 280, height: 380, borderWidth: 4, borderRadius: 140, borderStyle: 'dashed' },
  referenceContainer: { position: 'absolute', bottom: 20, right: 20, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  referenceLabel: { color: 'white', fontSize: 10, marginBottom: 5, fontWeight: '600' },
  referenceImage: { width: 60, height: 60, borderRadius: 10 },
  infoBox: { padding: 30, alignItems: 'center', minHeight: 180 },
  instruction: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  captureBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  captureBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIconBg: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  resultSub: { fontSize: 16, textAlign: 'center', marginTop: 15, marginBottom: 40, paddingHorizontal: 20 },
  doneBtn: { paddingHorizontal: 50, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center' },
  doneBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, fontSize: 16, fontWeight: '600' }
});
