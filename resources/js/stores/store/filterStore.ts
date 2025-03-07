import { create } from 'zustand';

interface FilterState {
  filters: {
    minPrice?: number;
    maxPrice?: number;
    sortBy: string;
    category?: string;
    brand?: string;
    search?: string;
  };
  setFilters: (filters: Partial<FilterState['filters']>) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {
    sortBy: 'newest',
  },
  setFilters: (newFilters) => set((state) => ({
    filters: {
      ...state.filters,
      ...newFilters
    }
  })),
}));