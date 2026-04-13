import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height: screenHeight } = Dimensions.get('window');
const CARD_HEIGHT = screenHeight - 60;

interface ImmersiveCardWrapperProps {
  children: React.ReactNode;
  infoContent: React.ReactNode;
  topColor?: string;
  bottomColor?: string;
}

export default function ImmersiveCardWrapper({
  children,
  infoContent,
  topColor = 'rgba(0,0,0,1)',
  bottomColor = 'rgba(0,0,0,1)',
}: ImmersiveCardWrapperProps) {
  return (
    <View style={styles.card}>

      {/* Image full, jadi background */}
      <View style={StyleSheet.absoluteFill}>
        {children}
      </View>

      {/* TOP FADE — solid dulu, baru fade ke transparent */}
      {/* Solid = 50% dari height, fade = 50% sisanya masuk ke image */}
      <LinearGradient
        colors={[topColor, topColor, 'transparent']}
        locations={[0, 0.7, 1]}
        style={styles.topFade}
        pointerEvents="none"
      />

      {/* BOTTOM FADE — transparent dulu dari image, lalu fade ke solid hitam */}
      {/* Solid = bagian bawah, teks ditaruh di atas solid ini */}
      <LinearGradient
        colors={['transparent', bottomColor]}
        locations={[0, 0.7]}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      {/* Teks nama, bio, dll — di atas solid hitam bagian bawah */}
      <View style={styles.infoWrapper}>
        {infoContent}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: '#000',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,      // 80px solid + 80px fade masuk ke image
    zIndex: 2,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,      // fade mulai dari tengah image, solid di bawah
    zIndex: 2,
  },
  infoWrapper: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    padding: 24,
    zIndex: 3,        // di atas gradient
  },
});