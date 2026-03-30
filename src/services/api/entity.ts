import apiClient from '../../lib/api';
import { EntityResponse } from '../../shared/types/entity';

export const entityApi = {
  getEntity: async (id: string) => {
    const response = await apiClient.get<EntityResponse>(`/entities/${id}`);
    return response.data;
  },
};
