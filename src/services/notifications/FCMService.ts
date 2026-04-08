import {
  getMessaging,
  requestPermission,
  getToken,
  onTokenRefresh,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { deviceApi } from '../api/device';
import { NotifeeService } from './NotifeeService';

export type NotificationType = 'new_match' | 'new_message' | 'new_like' | 'new_crush';

export interface NotificationData {
  notification_type?: NotificationType;
  match_id?: string;
  conversation_id?: string;
  sender_id?: string;
  sender_name?: string;
  type?: string;
}

const messagingInstance = getMessaging();

export class FCMService {
  static async requestPermission(): Promise<boolean> {
    try {
      // ✅ Android 13+ — request POST_NOTIFICATIONS dulu sebelum FCM
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('[FCMService] POST_NOTIFICATIONS denied');
          return false;
        }
      }

      // iOS — register remote messages dulu
      if (Platform.OS === 'ios') {
        await registerDeviceForRemoteMessages(messagingInstance);
      }

      // iOS — request permission types
      const authStatus = await requestPermission(messagingInstance, {
        alert: true,
        badge: true,
        sound: true,
        announcement: true,
        criticalAlert: true,
      });

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      return enabled;
    } catch (error) {
      console.error('[FCMService] Permission request failed:', error);
      return false;
    }
  }



  static async registerDevice(fcmToken?: string) {
    try {
      const token = fcmToken || (await getToken(messagingInstance));
      const deviceId = await this.getUniqueDeviceId();

      await deviceApi.register({
        device_id: deviceId,
        device_name: Device.deviceName || 'Unknown Device',
        device_model: Device.modelName || 'Unknown Model',
        os_version: `${Device.osName} ${Device.osVersion}`,
        app_version: Application.nativeApplicationVersion || '1.0.0',
        fcm_token: token,
      });

      console.log('[FCMService] Device registered successfully');
    } catch (error) {
      console.error('[FCMService] Device registration failed:', error);
    }
  }

  static async updateToken(token: string) {
    try {
      const deviceId = await this.getUniqueDeviceId();
      await deviceApi.updateToken({
        device_id: deviceId,
        fcm_token: token,
      });
      console.log('[FCMService] FCM token updated successfully');
    } catch (error) {
      console.error('[FCMService] FCM token update failed:', error);
    }
  }

  static async getUniqueDeviceId(): Promise<string> {
    if (Platform.OS === 'android') {

      return await Application.getAndroidId();
    } else {
      const id = await Application.getIosIdForVendorAsync();
      return id || 'unknown-ios-device';
    }
  }

  static onTokenRefresh(callback: (token: string) => void) {
    return onTokenRefresh(messagingInstance, callback);
  }

  /**
   * Navigate to the correct screen based on notification_type.
   * Call this from both foreground tap and background/quit tap handlers.
   */
  static handleNotificationNavigation(
    data: NotificationData,
    navigation: any,
  ) {
    if (!data?.notification_type || !navigation) {
      console.warn('[FCMService] Missing data or navigation reference');
      return;
    }

    console.log('[FCMService] Handling navigation for:', data.notification_type, 'Data:', JSON.stringify(data));

    switch (data.notification_type) {
      case 'new_message':
        if (data.conversation_id) {
          // If we have conversation_id, go to ChatDetail
          navigation.navigate('ChatDetail', {
            conversationId: data.conversation_id,
            participantName: data.sender_name || 'Chat',
            type: data.type || 'individual',
          });
        } else {
          navigation.navigate('Main', { screen: 'Chats' });
        }
        break;

      case 'new_match':
        navigation.navigate('Main', { screen: 'Chats' });
        break;

      case 'new_like':
      case 'new_crush':
        navigation.navigate('Main', { screen: 'Likes' });
        break;

      default:
        break;
    }
  }

  /**
   * Setup foreground notification listener (app is open).
   * When a push arrives in the foreground, FCM suppresses the system tray —
   * we use Notifee to show a differentiated local notification in its place.
   * Returns an unsubscribe function — call it on component unmount.
   */
  static setupForegroundHandler(): () => void {
    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      const data = remoteMessage.data as NotificationData | undefined;
      const notif = remoteMessage.notification;

      console.log('[FCMService] Foreground message received:', data?.notification_type);

      // Show differentiated local notification via Notifee
      if (data?.notification_type) {
        const title = notif?.title ?? getTitleForType(data.notification_type);
        const body = notif?.body ?? getBodyForType(data.notification_type);
        await NotifeeService.displayNotification(title, body, data);
      }
    });

    return unsubscribe;
  }

  /**
   * Setup handler for when user taps a notification while app is in background.
   * Returns an unsubscribe function.
   */
  static setupBackgroundTapHandler(navigation: any): () => void {
    const unsubscribe = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
      const data = remoteMessage.data as NotificationData | undefined;
      console.log('[FCMService] Background tap:', data?.notification_type);
      if (data) {
        FCMService.handleNotificationNavigation(data, navigation);
      }
    });

    return unsubscribe;
  }

  /**
   * Handle the case when the app was CLOSED (quit) and user taps a notification.
   * Must be called once on app mount.
   */
  static async handleQuitStateNotification(navigation: any): Promise<void> {
    const initialMessage = await getInitialNotification(messagingInstance);
    if (initialMessage?.data) {
      console.log('[FCMService] Quit-state tap:', initialMessage.data);
      FCMService.handleNotificationNavigation(
        initialMessage.data as NotificationData,
        navigation,
      );
    }
  }
}


// ─── Fallback title/body helpers ─────────────────────────────────────────────
// Used when the FCM payload is data-only (no notification block from backend).

function getTitleForType(type: NotificationType): string {
  switch (type) {
    case 'new_match': return "It's a Match!";
    case 'new_like': return 'Someone liked you!';
    case 'new_crush': return 'You got a Crush!';
    case 'new_message':
    default: return 'New Message';
  }
}

function getBodyForType(type: NotificationType): string {
  switch (type) {
    case 'new_match': return 'You have a new match! Start the conversation.';
    case 'new_like': return 'Someone liked your profile. Go check them out!';
    case 'new_crush': return 'Someone sent you a Crush! They really like you.';
    case 'new_message':
    default: return 'You have a new message.';
  }
}
