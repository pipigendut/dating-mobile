import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { X } from 'lucide-react-native';
import apiV1 from '../../../lib/api';
import { useTheme } from '../../../shared/hooks/useTheme';

const { width, height } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.85;
const MODAL_HEIGHT = height * 0.6;

type AdSource = 'internal' | 'sponsor' | 'admob';

interface AdItem {
  id: string;
  source: AdSource;
  placement: string;
  image_url: string;
  link: string;
  sponsor?: string;
  active: boolean;
  order: number;
}

interface AdsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AdsModal: React.FC<AdsModalProps> = ({ isVisible, onClose }) => {
  const { colors } = useTheme();
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<ICarouselInstance>(null);

  useEffect(() => {
    if (isVisible) {
      fetchAds();
    }
  }, [isVisible]);

  const fetchAds = async () => {
    try {
      const response = await apiV1.get('/advertisements', {
        params: { placement: 'popup_modal' },
      });
      setAds(response.data as AdItem[]);
    } catch (err) {
      console.error('[AdsModal] Failed to fetch ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (link: string) => {
    if (link) {
      Linking.openURL(link).catch((err) =>
        console.error('[AdsModal] Failed to open link:', err)
      );
      onClose(); // Auto close on click
    }
  };

  const renderItem = ({ item }: { item: AdItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePress(item.link)}
        style={styles.adContent}
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        {item.source === 'sponsor' && (
          <View style={styles.sponsoredLabel}>
            <Text style={styles.sponsoredText}>
              Sponsored{item.sponsor ? ` by ${item.sponsor}` : ''}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (ads.length === 0 && !loading) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Close Button */}
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: colors.surface + 'CC' }]} 
            onPress={onClose}
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>

          <Carousel
            ref={carouselRef}
            loop
            width={MODAL_WIDTH}
            height={MODAL_HEIGHT}
            autoPlay={ads.length > 1}
            autoPlayInterval={4000}
            data={ads}
            scrollAnimationDuration={1000}
            renderItem={renderItem}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 6,
    borderRadius: 20,
  },
  adContent: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sponsoredLabel: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  sponsoredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AdsModal;
