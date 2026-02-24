import { create } from 'zustand';
import { masterService, MasterItem } from '../services/api/master';

interface MasterState {
  genders: MasterItem[];
  relationshipTypes: MasterItem[];
  interests: MasterItem[];
  languages: MasterItem[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchMasterData: () => Promise<void>;
}

export const useMasterStore = create<MasterState>((set, get) => ({
  genders: [],
  relationshipTypes: [],
  interests: [],
  languages: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchMasterData: async () => {
    // Prevent fetching if already loaded or loading
    if (get().isLoaded || get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const [gendersRes, relationsRes, interestsRes, languagesRes] = await Promise.all([
        masterService.getGenders(),
        masterService.getRelationshipTypes(),
        masterService.getInterests(),
        masterService.getLanguages(),
      ]);

      set({
        genders: gendersRes || [],
        relationshipTypes: relationsRes || [],
        interests: interestsRes || [],
        languages: languagesRes || [],
        isLoaded: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch master data:', error);
      set({ error: error.message || 'Failed to fetch master data', isLoading: false });
    }
  },
}));
