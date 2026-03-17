import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../shared/components/ui/Button';
import { swipeService, IncomingLikeResponse } from '../../../services/api/swipe';

const { width } = Dimensions.get('window');
const columnWidth = (width - 48) / 3;

export default function LikesScreen() {
  const { data: likesPayload, isLoading, isError, refetch } = useQuery({
    queryKey: ['incomingLikes'],
    queryFn: swipeService.getIncomingLikes,
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const likesData = likesPayload || [];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = ({ item }: { item: IncomingLikeResponse }) => (
    <View style={styles.likeCard}>
      <Image 
        source={{ uri: item.user.photos && item.user.photos.length > 0 ? item.user.photos[0].url : 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39' }} 
        style={styles.likePhoto} 
        blurRadius={15} 
      />
      <View style={styles.overlay} />
      
      {/* Display Crush Badge if it's a super like */}
      {item.is_crush && (
        <View style={styles.crushBadge}>
          <Star size={12} color="white" fill="white" />
          <Text style={styles.crushText}>Crush</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={likesData}
        renderItem={renderItem}
        keyExtractor={(item) => item.user.id}
        numColumns={3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{likesData.length} Liked you</Text>
              <Text style={styles.subtitle}>
                When people are into you, they'll appear here. Enjoy!
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily likes</Text>
            </View>
          </>
        }
        ListFooterComponent={
          <>
            <View style={styles.premiumCardContainer}>
              <LinearGradient
                colors={['#ef4444', '#db2777']}
                style={styles.premiumCard}
              >
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>X4</Text>
                </View>
                <Text style={styles.premiumTitle}>Premium</Text>
                <Text style={styles.premiumSubtitle}>Flava Users</Text>
              </LinearGradient>

              <View style={styles.newBadge}>
                <Text style={styles.newBadgeTitle}>New</Text>
                <Text style={styles.newBadgeSubtitle}>Flava Users</Text>
              </View>
            </View>

            <View style={styles.ctaSection}>
              <Text style={styles.ctaTitle}>Want to get more likes?</Text>
              <Text style={styles.ctaSubtitle}>
                Premium members get x4 more likes daily than regular users.
              </Text>
              <Button
                title="Get x4 more likes"
                onPress={() => { }}
                style={styles.ctaButton}
              />
            </View>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  likeCard: {
    width: columnWidth,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
  },
  likePhoto: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  crushBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  crushText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  premiumCardContainer: {
    marginVertical: 30,
    position: 'relative',
    height: 160,
    justifyContent: 'center',
  },
  premiumCard: {
    height: 140,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadgeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  premiumSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  newBadge: {
    position: 'absolute',
    left: -10,
    top: '50%',
    marginTop: -35,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newBadgeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  newBadgeSubtitle: {
    fontSize: 12,
    color: '#374151',
  },
  ctaSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    borderRadius: 30,
  },
});
