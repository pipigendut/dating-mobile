import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../shared/hooks/useTheme';

// ─── Constants ───────────────────────────────────────────────────────────────

// Default size if not provided
const DEFAULT_SIZE = 44;

const COLORS = {
  purple: '#7B2FFF',
  pink: '#FF6B9D',
  magenta: '#C850C0',
  amber: '#FFD23F',
  orange: '#FF8C42',
  white: '#ffffff',
};

const SPARK_CONFIGS = [
  { angle: 90, speed: 2.6, size: 7, color: COLORS.amber, delay: 0 },
  { angle: 68, speed: 3.1, size: 6, color: COLORS.pink, delay: 120 },
  { angle: 112, speed: 2.9, size: 6, color: COLORS.purple, delay: 240 },
  { angle: 80, speed: 3.5, size: 8, color: COLORS.orange, delay: 60 },
  { angle: 100, speed: 2.4, size: 5, color: COLORS.magenta, delay: 180 },
  { angle: 55, speed: 3.8, size: 5, color: COLORS.amber, delay: 300 },
  { angle: 125, speed: 3.2, size: 6, color: COLORS.pink, delay: 90 },
  { angle: 90, speed: 2.8, size: 7, color: COLORS.orange, delay: 400 },
];

// ─── Spark particle ──────────────────────────────────────────────────────────

interface SparkProps {
  angle: number;
  speed: number;
  size: number;
  color: string;
  delay: number;
  active: boolean;
  originX: number;
  originY: number;
}

const Spark: React.FC<SparkProps> = ({
  angle, size, color, delay, active, originX, originY,
}) => {
  const progress = useSharedValue(0);

  const rad = (angle * Math.PI) / 180;
  const maxDist = 180 + Math.random() * 100;
  const tx = Math.cos(rad) * maxDist;
  const ty = Math.sin(rad) * maxDist;

  useEffect(() => {
    if (active) {
      progress.value = 0;
      progress.value = withDelay(
        delay,
        withRepeat(
          withTiming(1, {
            duration: 800 + Math.random() * 300,
            easing: Easing.out(Easing.quad),
          }),
          -1,
          false,
        ),
      );
    } else {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 200 });
    }
  }, [active]);

  const animStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const gravityY = 15 * p * p;
    return {
      opacity: interpolate(p, [0, 0.1, 0.8, 1], [0, 1, 0.8, 0]),
      transform: [
        { translateX: interpolate(p, [0, 1], [0, tx]) },
        { translateY: interpolate(p, [0, 1], [0, ty]) + gravityY },
        { scale: interpolate(p, [0, 0.1, 1], [0.4, 1.5, 0.2]) },
      ] as any,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: originX - size / 2,
          top: originY - size / 2,
        },
        animStyle,
      ]}
    />
  );
};

// ─── Rotating ring ────────────────────────────────────────────────────────────

const RotatingRing: React.FC<{ active: boolean; wrapperSize: number }> = ({ active, wrapperSize }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, {
        duration: active ? 4000 : 6000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [active]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 1 : 0.3,
    transform: [
      {
        rotate: interpolate(rotation.value, [0, 360], [0, 360]) + 'deg',
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: wrapperSize,
          height: wrapperSize,
          borderRadius: wrapperSize / 2,
          borderWidth: 2,
          borderTopColor: COLORS.purple,
          borderRightColor: COLORS.pink,
          borderBottomColor: COLORS.magenta,
          borderLeftColor: COLORS.purple,
        },
        style,
      ]}
    />
  );
};

const PulseGlow: React.FC<{ active: boolean }> = ({ active }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      opacity.value = withRepeat(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(0);
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: 999,
          backgroundColor: COLORS.purple,
        },
        style,
      ]}
    />
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

export interface BoostButtonProps {
  isActive: boolean;
  isChecking?: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
}

export const BoostButton: React.FC<BoostButtonProps> = ({
  isActive,
  isChecking,
  onPress,
  disabled,
  size = DEFAULT_SIZE
}) => {
  const { colors, isDark } = useTheme();
  const pressScale = useSharedValue(1);
  const zapScale = useSharedValue(1);

  const btnSize = size;
  const ringPad = size * 0.13;
  const wrapperSize = size + ringPad * 2;

  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 400;
  const originX = CANVAS_WIDTH / 2;
  const originY = CANVAS_HEIGHT / 2 + (wrapperSize / 2);

  const handlePress = () => {
    if (disabled || isChecking) return;

    pressScale.value = withSequence(
      withTiming(0.88, { duration: 90 }),
      withTiming(1.07, { duration: 150 }),
      withTiming(1, { duration: 110 }),
    );
    zapScale.value = withSequence(
      withTiming(0.65, { duration: 80 }),
      withTiming(1.35, { duration: 160 }),
      withTiming(1, { duration: 110 }),
    );

    onPress();
  };

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const zapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zapScale.value }],
  }));

  const gradientColors: [string, string, string] = isActive
    ? [COLORS.purple, COLORS.magenta, COLORS.pink]
    : [isDark ? colors.surface : '#f3f4f6', isDark ? colors.surface : '#f3f4f6', isDark ? colors.surface : '#f3f4f6'];

  return (
    <View style={styles.container}>
      {/* Spark canvas */}
      <View pointerEvents="none" style={styles.sparkCanvas}>
        {SPARK_CONFIGS.map((cfg, i) => (
          <Spark
            key={i}
            {...cfg}
            active={isActive}
            originX={originX}
            originY={originY}
          />
        ))}
      </View>

      <Animated.View style={[styles.btnWrapper, pressStyle, { width: wrapperSize, height: wrapperSize }]}>
        <PulseGlow active={isActive} />
        <RotatingRing active={isActive} wrapperSize={wrapperSize} />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePress}
          disabled={disabled || isChecking}
          style={[styles.touchable, { width: btnSize, height: btnSize, borderRadius: btnSize / 2 }]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.btnInner, { width: btnSize, height: btnSize, borderRadius: btnSize / 2 }]}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Animated.View style={zapStyle}>
                <Zap
                  size={btnSize * 0.45}
                  color={isActive ? COLORS.white : colors.primary}
                  fill={isActive ? COLORS.white : 'transparent'}
                  strokeWidth={2.5}
                />
              </Animated.View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkCanvas: {
    position: 'absolute',
    width: 300,
    height: 400,
    zIndex: 1,
    overflow: 'visible',
  },
  touchable: {
    overflow: 'hidden',
  },
  btnInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BoostButton;
