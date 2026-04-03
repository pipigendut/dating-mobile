import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { gifService } from '../../../services/api/gif';
import { Gif } from '../../../services/api/gif/types';
import { useTheme } from '../../../shared/hooks/useTheme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

interface GifPickerProps {
  onGifSelect: (gif: Gif) => void;
  onClose: () => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({ onGifSelect, onClose }) => {
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  useEffect(() => {
    loadGifs(true);
  }, []);

  const loadGifs = async (isNew = false) => {
    if (loading || (!isNew && !hasMore)) return;

    setLoading(true);
    try {
      const newOffset = isNew ? 0 : offset;
      const results = query
        ? await gifService.search(query, LIMIT, newOffset)
        : await gifService.getTrending(LIMIT, newOffset);

      if (isNew) {
        setGifs(results);
        setOffset(LIMIT);
        setHasMore(results.length === LIMIT);
      } else {
        setGifs(prev => [...prev, ...results]);
        setOffset(prev => prev + LIMIT);
        setHasMore(results.length === LIMIT);
      }
    } catch (error) {
      console.error('Error loading GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadGifs(true);
  };

  const renderGifItem = ({ item }: { item: Gif }) => (
    <TouchableOpacity
      style={styles.gifItem}
      onPress={() => onGifSelect(item)}
    >
      <View style={{ flex: 1 }}>
        <Image
          key={item.id}
          source={{ uri: item.preview }}
          style={styles.gifImage}
          resizeMode="cover"
        />
        <View style={styles.idLabel}>
          <Text style={styles.idLabelText}>{String(item.id).substring(0, 6)} - {String(item.preview).substring(0, 15)}...</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.background : '#f3f4f6' }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search GIFs..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          {!!query && (
            <TouchableOpacity onPress={() => { setQuery(''); loadGifs(true); }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {loading && gifs.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={gifs}
          renderItem={renderGifItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={COLUMN_COUNT}
          onEndReached={() => loadGifs()}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={() => (
            loading && gifs.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            ) : null
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.center}>
                <Text style={{ color: colors.textSecondary }}>No GIFs found</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  closeButton: {
    marginLeft: 12,
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  gifItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  gifImage: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
  },
  idLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 2,
    borderRadius: 4,
  },
  idLabelText: {
    color: 'white',
    fontSize: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  footerLoader: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
