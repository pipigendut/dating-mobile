import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FCMService } from '../../services/notifications/FCMService';
import { NotifeeService } from '../../services/notifications/NotifeeService';

/**
 * NotificationHandler — mount this component inside NavigationContainer
 * so it has access to navigation. It sets up all FCM + Notifee listeners.
 *
 * Handles 4 app states:
 *   1. Foreground  — app is open, FCM message arrives → display Notifee local notif
 *   2. Foreground  — user taps Notifee local notif → route via Notifee press handler
 *   3. Background  — user taps FCM notification from system tray → route
 *   4. Quit        — user taps FCM notification when app was closed → route
 */
export default function NotificationHandler() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // 0. Create Notifee channels (safe to call repeatedly; Notifee deduplicates)
    NotifeeService.createChannels();

    // 1. Handle quit-state FCM tap (one-time on mount)
    FCMService.handleQuitStateNotification(navigation);

    // 2. Handle foreground FCM messages → display Notifee local notification
    const unsubForeground = FCMService.setupForegroundHandler();

    // 3. Handle background FCM tap (notification opened from system tray)
    const unsubBackground = FCMService.setupBackgroundTapHandler(navigation);

    // 4. Handle tap on Notifee local notification while app is in foreground
    const unsubNotifeeFg = NotifeeService.setupForegroundEventHandler((data) => {
      FCMService.handleNotificationNavigation(data, navigation);
    });

    return () => {
      unsubForeground();
      unsubBackground();
      unsubNotifeeFg();
    };
  }, [navigation]);

  return null;
}

