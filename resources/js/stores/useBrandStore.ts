// src/store/useBrandStore.ts
import { create } from 'zustand';
import { Brand } from "@/types";

interface BrandStore {
	brands: Brand[];
	openDeleteModal: boolean;
	openAddBrandModal: boolean;
	modalBrand: Brand | null;
	modalMode: 'add' | 'update';
	setBrands: (brands: Brand[]) => void;
	setOpenDeleteModal: (open: boolean) => void;
	setOpenAddBrandModal: (open: boolean) => void;
	setModalBrand: (brand: Brand | null) => void;
	setModalMode: (mode: 'add' | 'update') => void;
}

export const useBrandStore = create<BrandStore>((set) => ({
	brands: [],
	sortDirection: 'asc',
	sortKey: '',
	links: [],
	openDeleteModal: false,
	openAddBrandModal: false,
	modalBrand: null,
	modalMode: 'add',
	setBrands: (brands) => set({ brands }),
	setOpenDeleteModal: (open) => set({ openDeleteModal: open }),
	setOpenAddBrandModal: (open) => set({ openAddBrandModal: open }),
	setModalBrand: (brand) => set({ modalBrand: brand }),
	setModalMode: (mode) => set({ modalMode: mode }),
}));
