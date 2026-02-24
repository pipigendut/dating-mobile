import apiClient from './client';

export interface MasterItem {
  id: string;
  name: string;
  icon: string;
}

export const masterService = {
  /**
   * Get all active genders
   */
  getGenders: async (): Promise<MasterItem[]> => {
    const response = await apiClient.get('/master/genders');
    return response.data;
  },

  /**
   * Get all active relationship types
   */
  getRelationshipTypes: async (): Promise<MasterItem[]> => {
    const response = await apiClient.get('/master/relationship-types');
    return response.data;
  },

  /**
   * Get all active interests
   */
  getInterests: async (): Promise<MasterItem[]> => {
    const response = await apiClient.get('/master/interests');
    return response.data;
  },

  /**
   * Get all active languages
   */
  getLanguages: async (): Promise<MasterItem[]> => {
    const response = await apiClient.get('/master/languages');
    return response.data;
  },
};
