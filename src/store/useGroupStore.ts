import { create } from 'zustand';
import { GroupResponse } from '../shared/types/entity';

interface GroupState {
  group: GroupResponse | null;
  lastFetched: number | null;
  isLoading: boolean;
  setGroup: (group: GroupResponse | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetGroup: () => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  group: null,
  lastFetched: null,
  isLoading: false,
  setGroup: (group) => set({ group, lastFetched: Date.now(), isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  resetGroup: () => set({ group: null, lastFetched: null, isLoading: false }),
}));
