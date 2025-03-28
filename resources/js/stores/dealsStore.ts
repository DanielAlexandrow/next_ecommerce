import { create } from 'zustand';
import { Deal } from '@/types';

interface DealsState {
    deals: Deal[];
    setDeals: (deals: Deal[]) => void;
    selectedDeal: Deal | null;
    setSelectedDeal: (deal: Deal | null) => void;
    isCreateModalOpen: boolean;
    setIsCreateModalOpen: (open: boolean) => void;
    isEditModalOpen: boolean;
    setIsEditModalOpen: (open: boolean) => void;
    filters: {
        search: string;
        dealType: string;
        active: boolean | null;
        dateRange: {
            from: Date | undefined;
            to: Date | undefined;
        };
    };
    setFilters: (filters: any) => void;
}

export const useDealsStore = create<DealsState>((set) => ({
    deals: [],
    setDeals: (deals) => set({ deals }),
    selectedDeal: null,
    setSelectedDeal: (deal) => set({ selectedDeal: deal }),
    isCreateModalOpen: false,
    setIsCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
    isEditModalOpen: false,
    setIsEditModalOpen: (open) => set({ isEditModalOpen: open }),
    filters: {
        search: '',
        dealType: '',
        active: null,
        dateRange: {
            from: undefined,
            to: undefined
        }
    },
    setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters }
    }))
}));