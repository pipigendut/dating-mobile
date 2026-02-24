import apiClient from './client';

export const userService = {
  /**
   * Get presigned URL for profile image upload
   */
  getUploadUrl: async () => {
    const response = await apiClient.get('/users/upload-url');
    return response.data;
  },

  /**
   * Get presigned URL for profile image upload (Unauthenticated)
   */
  getUploadUrlPublic: async (clientId: string) => {
    const response = await apiClient.get('/users/upload-url/public', {
      params: { client_id: clientId }
    });
    return response.data;
  },

  /**
   * Update user profile data
   */
  updateProfile: async (profileData: any) => {
    const response = await apiClient.patch('/users/profile', profileData);
    return response.data;
  },

  /**
   * Get user profile by ID
   */
  getProfile: async (userId: string) => {
    const response = await apiClient.get(`/users/profile/${userId}`);
    return response.data;
  },

  /**
   * Delete user account
   */
  deleteAccount: async () => {
    const response = await apiClient.delete('/users/profile');
    return response.data;
  },
};
