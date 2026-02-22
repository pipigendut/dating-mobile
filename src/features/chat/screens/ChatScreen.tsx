import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';

export default function ChatScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle}>
            Once you start matching, your chats will appear here!
          </Text>
          <Text style={styles.emoji}>👋</Text>
        </View>
      </View>

      <View style={styles.illustrationContainer}>
        <View style={styles.circleBgLeft} />
        <View style={styles.circleBgRight} />

        <View style={styles.profileContainer}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.chatBubble}>
            <Text style={styles.bubbleText}>Hey! 👋</Text>
          </View>

          <View style={styles.notificationBadge}>
            <MessageCircle size={24} color="white" fill="white" />
            <View style={styles.countBadge}>
              <Text style={styles.countText}>24</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Want More Chats?</Text>
        <Text style={styles.ctaSubtitle}>
          Get Premium to grow your chat list 4x faster!
        </Text>
        <Button
          title="Get x4 more chats"
          onPress={() => { }}
          style={styles.ctaButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
  },
  illustrationContainer: {
    height: 250,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 40,
  },
  circleBgLeft: {
    position: 'absolute',
    left: 20,
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    borderRadius: 30,
    opacity: 0.6,
  },
  circleBgRight: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    borderRadius: 30,
    opacity: 0.6,
  },
  profileContainer: {
    position: 'relative',
  },
  profileImageWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    backgroundColor: '#eee',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  chatBubble: {
    position: 'absolute',
    top: -10,
    right: -20,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  notificationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 50,
    height: 50,
    backgroundColor: '#ef4444',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  countBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  countText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ctaSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  ctaButton: {
    borderRadius: 30,
  },
});
