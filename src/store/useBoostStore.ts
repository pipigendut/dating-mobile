import { create } from 'zustand';

interface BoostState {
  isBoostActive: boolean;
  boostExpiresAt: string | null;
  boostAmount: number;
  hasBoost: boolean;
  isLoaded: boolean;

  // Actions
  updateStatus: (isActive: boolean, expiresAt: string | null) => void;
  setBoostData: (amount: number, hasBoost: boolean) => void;
  reset: () => void;
}

export const useBoostStore = create<BoostState>((set) => ({
  isBoostActive: false,
  boostExpiresAt: null,
  boostAmount: 0,
  hasBoost: false,
  isLoaded: false,

  updateStatus: (isActive: boolean, expiresAt: string | null) => {
    set({ isBoostActive: isActive, boostExpiresAt: expiresAt, isLoaded: true });
  },

  setBoostData: (amount: number, hasBoost: boolean) => {
    set({ boostAmount: amount, hasBoost: hasBoost, isLoaded: true });
  },

  reset: () => {
    set({
      isBoostActive: false,
      boostExpiresAt: null,
      boostAmount: 0,
      hasBoost: false,
      isLoaded: false,
    });
  },
}));
