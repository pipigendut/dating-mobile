import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 180;

const BannerSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.skeleton, { opacity }]} />
      <View style={styles.dotsContainer}>
        {[1, 2, 3].map((_, i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: BANNER_HEIGHT,
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E1E9EE',
  },
  skeleton: {
    flex: 1,
    backgroundColor: '#CFD8DC',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
    opacity: 0.5,
  },
});

export default BannerSkeleton;
