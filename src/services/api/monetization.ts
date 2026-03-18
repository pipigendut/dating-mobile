import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { SubscriptionPlan, ConsumableItem, MonetizationStatus } from '../../shared/types/monetization';

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await apiClient.get('/monetization/plans');
      return response.data as SubscriptionPlan[];
    },
  });
};

export const useConsumableItems = () => {
  return useQuery({
    queryKey: ['consumable-items'],
    queryFn: async () => {
      const response = await apiClient.get('/monetization/consumables');
      return response.data as ConsumableItem[];
    },
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
      queryClient.invalidateQueries({ queryKey: ['user-consumables'] });
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
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['monetization-status'] });
    },
  });
};

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: ['monetization-status'],
    queryFn: async () => {
      const response = await apiClient.get('/monetization/status');
      return response.data as MonetizationStatus;
    },
  });
};
