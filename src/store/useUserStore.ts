import { create } from 'zustand';
import { UserData } from '../shared/types/user';

interface UserState {
  userData: UserData;
  isLoggedIn: boolean;
  onboardingComplete: boolean;
  setUserData: (data: Partial<UserData> | ((prev: UserData) => UserData)) => void;
  setIsLoggedIn: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  resetUser: () => void;
}

const initialUserData: UserData = {
  subscriptionPlan: 'free'
};

export const useUserStore = create<UserState>((set) => ({
  userData: initialUserData,
  isLoggedIn: false,
  onboardingComplete: false,
  setUserData: (data) => set((state) => ({
    userData: typeof data === 'function' ? data(state.userData) : { ...state.userData, ...data }
  })),
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setOnboardingComplete: (value) => set({ onboardingComplete: value }),
  resetUser: () => set({ userData: initialUserData, isLoggedIn: false, onboardingComplete: false }),
}));
