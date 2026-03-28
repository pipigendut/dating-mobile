import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { useUserStore } from '../../store/useUserStore';

export interface BoostAvailabilityResponse {
  has_boost: boolean;
  boost_amount: number;
  is_boosted: boolean;
  expired_at: string | null;
}

export interface BoostActivationResponse {
  message: string;
  expired_at: string;
}

export const boostKeys = {
  all: ['boost'] as const,
  availability: () => [...boostKeys.all, 'availability'] as const,
};

export const boostService = {
  /**
   * Check if user has boosts available and current boost status
   */
  getAvailability: async (entityId: string) => {
    const response = await apiClient.get('/boosts/availability', {
      params: { entity_id: entityId }
    });
    return response.data as BoostAvailabilityResponse;
  },

  /**
   * Activate a boost for the user
   */
  activate: async (entityId: string) => {
    const response = await apiClient.post('/boosts/activate', {
      entity_id: entityId
    });
    return (response.data?.data || response.data) as BoostActivationResponse;
  },
};

export const useBoostAvailability = (entityId?: string) => {
  return useQuery({
    queryKey: [...boostKeys.availability(), entityId],
    queryFn: () => boostService.getAvailability(entityId!),
    enabled: !!entityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useActivateBoost = (entityId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => boostService.activate(entityId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boostKeys.availability() });
      // Optimistically decrement boost count in profile
      useUserStore.getState().decrementConsumable('boost', 1);
    },
  });
};
