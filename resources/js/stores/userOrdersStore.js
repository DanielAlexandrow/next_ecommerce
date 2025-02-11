import { create } from 'zustand';
import { OrderDetails } from '@/types';

interface Order {
    id: number;
    created_at: string;
    status: string;
    user_id: number;
    // Add other relevant fields
}

interface UserOrdersState {
    orders: Order[];
    setOrders: (orders: Order[]) => void;
    selectedOrder: OrderDetails | null;
    setSelectedOrder: (order: OrderDetails | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    sortKey: string;
    setSortKey: (key: string) => void;
    sortDirection: string;
    setSortDirection: (direction: string) => void;
    links: any[];
    setLinks: (links: any[]) => void;
}

export const useUserOrdersStore = create<UserOrdersState>((set) => ({
    orders: [],
    setOrders: (orders) => set({ orders }),
    selectedOrder: null,
    setSelectedOrder: (order) => set({ selectedOrder: order }),
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    isModalOpen: false,
    setIsModalOpen: (open) => set({ isModalOpen: open }),
    sortKey: '',
    setSortKey: (key) => set({ sortKey: key }),
    sortDirection: 'asc',
    setSortDirection: (direction) => set({ sortDirection: direction }),
    links: [],
    setLinks: (links) => set({ links }),
}));