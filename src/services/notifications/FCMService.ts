import messaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { deviceApi } from '../api/device';

export class FCMService {
  static async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    } catch (error) {
      console.error('[FCMService] Permission request failed:', error);
      return false;
    }
  }

  static async registerDevice(fcmToken?: string) {
    try {
      const token = fcmToken || (await messaging().getToken());
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

  private static async getUniqueDeviceId(): Promise<string> {
    if (Platform.OS === 'android') {
      return await Application.getAndroidId();
    } else {
      const id = await Application.getIosIdForVendorAsync();
      return id || 'unknown-ios-device';
    }
  }

  static onTokenRefresh(callback: (token: string) => void) {
    return messaging().onTokenRefresh(callback);
  }
}
