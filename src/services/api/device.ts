import apiClient from '../../lib/api';

export interface RegisterDeviceRequest {
  device_id: string;
  device_name?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  fcm_token?: string;
}

export interface UpdateFCMTokenRequest {
  device_id: string;
  fcm_token: string;
}

export const deviceApi = {
  register: (data: RegisterDeviceRequest) => 
    apiClient.post('/devices/register', data),
    
  updateToken: (data: UpdateFCMTokenRequest) =>
    apiClient.patch('/devices/fcm-token', data),

  deactivate: (deviceId: string) =>
    apiClient.post('/devices/deactivate', { device_id: deviceId }),
};

