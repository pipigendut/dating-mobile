import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface AdminSubscribePayload {
  user_id: string;
  plan_id: string;
}

export interface AdminConsumablePayload {
  user_id: string;
  package_id: string;
}

/**
 * Fetch admin configs directly from backend.
 * This checks implicitly if the user is whitelisted.
 */
export const useAdminConfigs = () => {
  return useQuery({
    queryKey: ['admin-configs'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/configs');
      return response.data as Record<string, string>;
    },
    retry: false, // Do not retry on 403 Forbidden
  });
};

/**
 * Reloads all configs from DB into RAM on backend.
 */
export const useAdminReloadConfigs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/admin/configs/reload');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-configs'] });
    },
  });
};

/**

 * Simulates subscribing a user to a given subscription plan.
 * Requires the current user to be whitelisted in the backend's `whitelist_emails` config.
 */
export const useAdminSubscribe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminSubscribePayload) => {
      const response = await apiClient.post('/admin/subscribe', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monetization-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    },
  });
};

/**
 * Simulates adding boost consumable units for a user.
 * Requires the current user to be whitelisted in the backend's `whitelist_emails` config.
 */
export const useAdminAddBoost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminConsumablePayload) => {
      const response = await apiClient.post('/admin/consumables/boost', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monetization-status'] });
    },
  });
};

/**
 * Simulates adding crush consumable units for a user.
 * Requires the current user to be whitelisted in the backend's `whitelist_emails` config.
 */
export const useAdminAddCrush = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminConsumablePayload) => {
      const response = await apiClient.post('/admin/consumables/crush', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monetization-status'] });
    },
  });
};
