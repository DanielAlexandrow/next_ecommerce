import { create } from 'zustand';
import { User } from '@/types';

interface UserStore {
    users: User[];
    openDeleteModal: boolean;
    openEditModal: boolean;
    modalUser: User | null;
    modalMode: 'add' | 'update' | null;
    setUsers: (users: User[]) => void;
    setOpenDeleteModal: (open: boolean) => void;
    setOpenEditModal: (open: boolean) => void;
    setModalUser: (user: User | null) => void;
    setModalMode: (mode: 'add' | 'update' | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    users: [],
    openDeleteModal: false,
    openEditModal: false,
    modalUser: null,
    modalMode: null,
    setUsers: (users) => set({ users }),
    setOpenDeleteModal: (open) => set({ openDeleteModal: open }),
    setOpenEditModal: (open) => set({ openEditModal: open }),
    setModalUser: (user) => set({ modalUser: user }),
    setModalMode: (mode) => set({ modalMode: mode }),
}));