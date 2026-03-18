import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/api/client';
import { SubscriptionPlan, ConsumableItem } from '../../../shared/types/monetization';

export const subscriptionKeys = {
  all: ['subscription'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  consumables: () => [...subscriptionKeys.all, 'consumables'] as const,
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const response = await apiClient.get('/monetization/plans');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useConsumableItems = () => {
  return useQuery({
    queryKey: subscriptionKeys.consumables(),
    queryFn: async (): Promise<ConsumableItem[]> => {
      const response = await apiClient.get('/monetization/consumables');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
