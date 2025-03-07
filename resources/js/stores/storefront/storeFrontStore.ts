import { create } from 'zustand';
import { NavigationHeader } from '@/types';
import { navigationApi } from '@/api/navigationApi';

interface StoreFrontState {
  headers: NavigationHeader[];
  loading: boolean;
  error: string | null;
  fetchNavData: () => Promise<any>;
  saveNavigation: (headers: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useStoreFront = create<StoreFrontState>((set) => ({
  headers: [],
  loading: false,
  error: null,

  fetchNavData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await navigationApi.fetchNavData();
      set({ headers: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: 'Failed to fetch navigation data', loading: false });
      throw error;
    }
  },

  saveNavigation: async (headers) => {
    set({ loading: true, error: null });
    try {
      await navigationApi.saveNavigation(headers);
      set({ headers, loading: false });
    } catch (error) {
      set({ error: 'Failed to save navigation', loading: false });
      throw error;
    }
  },
  
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await navigationApi.logout();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to logout', loading: false });
      throw error;
    }
  }
}));