import { create } from 'zustand';
import { Header, NavigationItem } from '@/types';

interface NavigationMakerState {
  headers: Header[];
  selectedHeader: Header | null;
  selectedNavigationItem: NavigationItem | null;
  
  setHeaders: (headers: Header[]) => void;
  setSelectedHeader: (header: Header | null) => void;
  setSelectedNavigationItem: (item: NavigationItem | null) => void;
  
  updateHeaderOrder: (headerId: number, direction: 'up' | 'down') => void;
  updateItemOrder: (itemId: number, headerId: number, direction: 'up' | 'down') => void;
}

const useNavigationMakerStore = create<NavigationMakerState>((set) => ({
  headers: [],
  selectedHeader: null,
  selectedNavigationItem: null,
  
  setHeaders: (headers) => set({ headers }),
  setSelectedHeader: (header) => set({ selectedHeader: header }),
  setSelectedNavigationItem: (item) => set({ selectedNavigationItem: item }),
  
  updateHeaderOrder: (headerId, direction) => 
    set((state) => {
      const headerIndex = state.headers.findIndex(h => h.id === headerId);
      if (headerIndex === -1) return state;
      
      const newHeaders = [...state.headers];
      
      if (direction === 'up' && headerIndex > 0) {
        [newHeaders[headerIndex - 1], newHeaders[headerIndex]] = 
          [newHeaders[headerIndex], newHeaders[headerIndex - 1]];
      } else if (direction === 'down' && headerIndex < newHeaders.length - 1) {
        [newHeaders[headerIndex], newHeaders[headerIndex + 1]] = 
          [newHeaders[headerIndex + 1], newHeaders[headerIndex]];
      }
      
      return { headers: newHeaders };
    }),
    
  updateItemOrder: (itemId, headerId, direction) =>
    set((state) => {
      const headerIndex = state.headers.findIndex(h => h.id === headerId);
      if (headerIndex === -1) return state;
      
      const header = state.headers[headerIndex];
      const navigationItems = header.navigation_items || [];
      const itemIndex = navigationItems.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return state;
      
      const newNavigationItems = [...navigationItems];
      
      if (direction === 'up' && itemIndex > 0) {
        [newNavigationItems[itemIndex - 1], newNavigationItems[itemIndex]] = 
          [newNavigationItems[itemIndex], newNavigationItems[itemIndex - 1]];
      } else if (direction === 'down' && itemIndex < newNavigationItems.length - 1) {
        [newNavigationItems[itemIndex], newNavigationItems[itemIndex + 1]] = 
          [newNavigationItems[itemIndex + 1], newNavigationItems[itemIndex]];
      }
      
      const newHeaders = [...state.headers];
      newHeaders[headerIndex] = {
        ...header,
        navigation_items: newNavigationItems,
      };
      
      return { headers: newHeaders };
    }),
}));

export default useNavigationMakerStore;
