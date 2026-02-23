import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'device_id_tracking';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
}

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

  if (!deviceId) {
    if (Platform.OS === 'ios') {
      deviceId = await Application.getIosIdForVendorAsync();
    } else if (Platform.OS === 'android') {
      deviceId = Application.getAndroidId();
    }

    // Fallback if APIs fail
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }

  return {
    deviceId,
    deviceName: Device.deviceName || 'Unknown Device',
    deviceModel: Device.modelName || 'Unknown Model',
    osVersion: `${Device.osName} ${Device.osVersion}`,
    appVersion: Application.nativeApplicationVersion || '1.0.0',
  };
};
