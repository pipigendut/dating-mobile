import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface MatchModalProps {
  isVisible: boolean;
  onClose: () => void;
  userPhoto?: string;
  matchedUserPhoto: string;
  matchedUserName: string;
  onSendMessage?: () => void;
}

export default function MatchModal({
  isVisible,
  onClose,
  userPhoto,
  matchedUserPhoto,
  matchedUserName,
  onSendMessage,
}: MatchModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const userPhotoPos = useRef(new Animated.Value(-100)).current;
  const matchPhotoPos = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(userPhotoPos, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(matchPhotoPos, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      userPhotoPos.setValue(-100);
      matchPhotoPos.setValue(100);
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#16a34a', '#22c55e', '#4ade80']}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Heart Background Pattern (Abstract) */}
            <View style={styles.heartPatternContainer}>
              <View style={[styles.heartShape, styles.heart1]} />
              <View style={[styles.heartShape, styles.heart2]} />
              <View style={[styles.heartShape, styles.heart3]} />
            </View>

            <View style={styles.headerContainer}>
              <Text style={styles.titleStyle}>IT'S A</Text>
              <Text style={styles.matchText}>Match</Text>
            </View>

            <View style={styles.avatarContainer}>
              <Animated.View
                style={[
                  styles.avatarWrapper,
                  { transform: [{ translateX: userPhotoPos }] },
                ]}
              >
                <Image
                  source={{ uri: userPhoto || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39' }}
                  style={styles.avatar}
                />
              </Animated.View>
              <Animated.View
                style={[
                  styles.avatarWrapper,
                  { transform: [{ translateX: matchPhotoPos }] },
                ]}
              >
                <Image
                  source={{ uri: matchedUserPhoto }}
                  style={styles.avatar}
                />
              </Animated.View>
            </View>

            <Text style={styles.subtitle}>
              You matched with {matchedUserName}
            </Text>

            <View style={styles.btnContainer}>
              <TouchableOpacity
                style={styles.messageBtn}
                onPress={() => {
                  onSendMessage?.();
                  onClose();
                }}
              >
                <MessageCircle size={24} color="#16a34a" fill="#16a34a" />
                <Text style={styles.messageBtnText}>SEND MESSAGE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.keepSwipingBtn} onPress={onClose}>
                <Text style={styles.keepSwipingText}>KEEP SWIPING</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={30} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleStyle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 10,
    marginBottom: -10,
  },
  matchText: {
    color: 'white',
    fontSize: 80,
    fontWeight: '900',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: -30, // Overlap avatars
  },
  avatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: 'white',
    overflow: 'hidden',
    backgroundColor: '#eee',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 50,
    textAlign: 'center',
  },
  btnContainer: {
    width: '100%',
    paddingHorizontal: 30,
    gap: 15,
  },
  messageBtn: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  messageBtnText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  keepSwipingBtn: {
    paddingVertical: 18,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepSwipingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 30,
    padding: 10,
  },
  heartPatternContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
    opacity: 0.3,
  },
  heartShape: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 100,
  },
  heart1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    opacity: 0.1,
  },
  heart2: {
    width: width * 1.2,
    height: width * 1.2,
    top: -width * 0.3,
    opacity: 0.2,
  },
  heart3: {
    width: width * 0.9,
    height: width * 0.9,
    top: -width * 0.1,
    opacity: 0.3,
  },
});
