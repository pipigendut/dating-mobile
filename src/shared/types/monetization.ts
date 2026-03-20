export interface SubscriptionPlan {
  id: string;
  name: string;
  is_active: boolean;
  features: SubscriptionPlanFeature[];
  prices: SubscriptionPrice[];
}

export interface SubscriptionPlanFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  is_active: boolean;
  category?: string;
  icon?: string;
  display_title?: string;
  is_consumable?: boolean;
  amount?: number;
}

export interface SubscriptionPrice {
  id: string;
  plan_id: string;
  duration_type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  price: number;
  currency: string;
  external_slug: string;
}

export interface ConsumableItem {
  id: string;
  name: string;
  item_type: 'boost' | 'crush';
  amount: number;
  price: number;
  is_active: boolean;
}

export interface MonetizationStatus {
  is_premium: boolean;
  plan_name: string;
  features: Record<string, boolean>;
  consumables: Record<string, number>;
}
