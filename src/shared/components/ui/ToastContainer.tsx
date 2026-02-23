import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import { useToastStore } from '../../../store/useToastStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ToastContainer() {
  const { visible, message, type, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!message) return null;

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#f0fdf4',
          border: '#bbf7d0',
          text: '#166534',
          icon: <CheckCircle size={20} color="#166534" />,
        };
      case 'error':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
          icon: <AlertCircle size={20} color="#991b1b" />,
        };
      default:
        return {
          bg: '#eff6ff',
          border: '#bfdbfe',
          text: '#1e40af',
          icon: <Info size={20} color="#1e40af" />,
        };
    }
  };

  const theme = getTheme();

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          top: insets.top + 10,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <View style={styles.iconContainer}>{theme.icon}</View>
        <Text style={[styles.message, { color: theme.text }]} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
          <X size={16} color={theme.text} opacity={0.5} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeBtn: {
    marginLeft: 10,
    padding: 2,
  },
});
