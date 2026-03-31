import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import type { NotificationData, NotificationType } from './FCMService';
import { useNotificationStore } from '../../store/useNotificationStore';

// ─── Channel IDs ─────────────────────────────────────────────────────────────
export const CHANNEL_ID = {
  MESSAGES: 'channel_messages',
  MATCHES:  'channel_matches',
  LIKES:    'channel_likes',
  CRUSHES:  'channel_crushes',
} as const;

// ─── Channel config per type ──────────────────────────────────────────────────
const CHANNEL_CONFIG: Record<
  typeof CHANNEL_ID[keyof typeof CHANNEL_ID],
  { name: string; importance: AndroidImportance; lightColor: string; vibration: boolean }
> = {
  [CHANNEL_ID.MESSAGES]: {
    name: 'Messages',
    importance: AndroidImportance.HIGH,
    lightColor: '#6C63FF',
    vibration: true,
  },
  [CHANNEL_ID.MATCHES]: {
    name: 'New Matches',
    importance: AndroidImportance.HIGH,
    lightColor: '#FF6584',
    vibration: true,
  },
  [CHANNEL_ID.LIKES]: {
    name: 'Likes',
    importance: AndroidImportance.DEFAULT,
    lightColor: '#FF9F43',
    vibration: false,
  },
  [CHANNEL_ID.CRUSHES]: {
    name: 'Crushes',
    importance: AndroidImportance.HIGH,
    lightColor: '#FF6B6B',
    vibration: true,
  },
};

// Map notification_type → channel id
function channelForType(type: NotificationType): typeof CHANNEL_ID[keyof typeof CHANNEL_ID] {
  switch (type) {
    case 'new_match':   return CHANNEL_ID.MATCHES;
    case 'new_like':    return CHANNEL_ID.LIKES;
    case 'new_crush':   return CHANNEL_ID.CRUSHES;
    case 'new_message':
    default:            return CHANNEL_ID.MESSAGES;
  }
}

// Map notification_type → emoji prefix for title (Android only, iOS ignores)
const EMOJI_PREFIX: Record<NotificationType, string> = {
  new_message: '💬',
  new_match:   '💘',
  new_like:    '❤️',
  new_crush:   '🔥',
};

export class NotifeeService {
  /**
   * Create all notification channels. Call once on app startup.
   * Safe to call multiple times (Notifee skips existing channels).
   */
  static async createChannels(): Promise<void> {
    const channelIds = Object.values(CHANNEL_ID) as string[];
    for (const id of channelIds) {
      const cfg = CHANNEL_CONFIG[id as keyof typeof CHANNEL_CONFIG];
      await notifee.createChannel({
        id,
        name: cfg.name,
        importance: cfg.importance,
        visibility: AndroidVisibility.PUBLIC,
        lights: true,
        lightColor: cfg.lightColor,
        vibration: cfg.vibration,
        vibrationPattern: cfg.vibration ? [300, 500] : undefined,
        sound: 'default',
      });
    }
  }

  /**
   * Display a local notification via Notifee. Use this in foreground to
   * replace the suppressed FCM system tray notification.
   * Respects per-channel user preferences from useNotificationStore.
   */
  static async displayNotification(
    title: string,
    body: string,
    data: NotificationData,
  ): Promise<void> {
    const type = data.notification_type ?? 'new_message';

    // Check master + per-channel preference
    const { pushEnabled, isTypeEnabled } = useNotificationStore.getState();
    if (!pushEnabled) return;
    if (!isTypeEnabled(type)) return;

    const channelId = channelForType(type);
    const emoji = EMOJI_PREFIX[type] ?? '';

    await notifee.displayNotification({
      title: `${emoji} ${title}`,
      body,
      data: data as Record<string, string>,
      android: {
        channelId,
        pressAction: { id: 'default' },
        // Group messages by conversation so they collapse neatly in tray
        ...(type === 'new_message' && data.conversation_id
          ? {
              groupId: `conv_${data.conversation_id}`,
              groupSummary: false,
            }
          : {}),
        // Badge for matches & crushes
        badgeCount: type === 'new_match' || type === 'new_crush' ? 1 : undefined,
      },
      ios: {
        sound: 'default',
        badgeCount: type === 'new_match' || type === 'new_crush' ? 1 : undefined,
        threadId: type === 'new_message' && data.conversation_id
          ? `conv_${data.conversation_id}`
          : undefined,
      },
    });
  }

  /**
   * Register a Notifee foreground event handler.
   * Returns an unsubscribe function.
   *
   * NOTE: Navigation must be passed in from the component that has access to it.
   * Use this ONLY for "press" actions on foreground notifications.
   */
  static setupForegroundEventHandler(
    onPress: (data: NotificationData) => void,
  ): () => void {
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const data = detail.notification?.data as NotificationData | undefined;
        if (data) {
          onPress(data);
        }
      }
    });
  }

  /**
   * Register the Notifee background event handler.
   * Must be called at the app root (index.js) BEFORE registerRootComponent.
   */
  static registerBackgroundHandler(
    onPress: (data: NotificationData) => void,
  ): void {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        const data = detail.notification?.data as NotificationData | undefined;
        if (data) {
          onPress(data);
        }
      }
    });
  }
}
