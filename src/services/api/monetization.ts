import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { SubscriptionPlan, ConsumableItem, MonetizationStatus } from '../../shared/types/monetization';

export const monetizationKeys = {
  all: ['monetization'] as const,
  plans: () => [...monetizationKeys.all, 'plans'] as const,
  consumables: () => [...monetizationKeys.all, 'consumables'] as const,
  status: () => [...monetizationKeys.all, 'status'] as const,
};

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: monetizationKeys.plans(),
    queryFn: async () => {
      const response = await apiClient.get('/monetization/plans');
      return response.data as SubscriptionPlan[];
    },
    staleTime: STALE_TIME,
  });
};

export const useConsumableItems = () => {
  return useQuery({
    queryKey: monetizationKeys.consumables(),
    queryFn: async () => {
      const response = await apiClient.get('/monetization/consumables');
      return response.data as ConsumableItem[];
    },
    staleTime: STALE_TIME,
  });
};

export const usePurchaseConsumable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemID: string) => {
      const response = await apiClient.post('/monetization/purchase/consumable', {
        item_id: itemID,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monetizationKeys.consumables() });
    },
  });
};

export const usePurchasePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ planID, priceID }: { planID: string; priceID: string }) => {
      const response = await apiClient.post('/monetization/purchase/plan', {
        plan_id: planID,
        price_id: priceID,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monetizationKeys.status() });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    },
  });
};

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: monetizationKeys.status(),
    queryFn: async () => {
      const response = await apiClient.get('/monetization/status');
      return response.data as MonetizationStatus;
    },
    staleTime: STALE_TIME,
  });
};
