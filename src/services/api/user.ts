import apiClient from './client';

export interface UpdateProfileRequest {
  full_name?: string;
  bio?: string;
  height_cm?: number;
  relationship_type?: string;
  interested_in?: string;
  location_city?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  interests?: string[];
  languages?: string[];
  photos?: any[];
}

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


  /**
   * Create a new dating group
   */
  createGroup: async (name: string) => {
    const response = await apiClient.post('/users/groups', { name });
    return response.data;
  },

  /**
   * Get the single dating group the user is a member of
   */
  getMyGroup: async () => {
    const response = await apiClient.get('/users/my-group');
    return response.data;
  },

  /**
   * Generate an invite link for a specific group
   */
  generateInviteLink: async (groupId: string) => {
    // Note: This endpoint is in the /groups bracket, not /users
    const response = await apiClient.post(`/groups/${groupId}/invite-link`);
    return response.data;
  },
};
