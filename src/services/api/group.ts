import apiClient from '../../lib/api';

export interface ValidateInviteResponse {
  group_id: string;
  group_name: string;
  is_valid: boolean;
}

export const groupService = {
  /**
   * Validate a group invitation token
   */
  validateInvite: async (token: string) => {
    const response = await apiClient.get(`/group-invites/validate?token=${token}`);
    return response.data;
  },

  /**
   * Accept a group invitation
   */
  acceptInvite: async (token: string) => {
    const response = await apiClient.post('/group-invites/accept', { token });
    return response;
  },

  /**
   * Kick a member from the group. Only owner can do this.
   */
  kickMember: async (groupId: string, userId: string) => {
    const response = await apiClient.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  /**
   * Leave a group. Non-owners can do this.
   */
  leaveGroup: async (groupId: string) => {
    const response = await apiClient.post(`/groups/${groupId}/leave`);
    return response.data;
  },

  /**
   * Disband the entire group. Only owner can do this.
   */
  disbandGroup: async (groupId: string) => {
    const response = await apiClient.delete(`/groups/${groupId}`);
    return response.data;
  },
};
