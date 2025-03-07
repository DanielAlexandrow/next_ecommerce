import { NavigationHeader, NavigationIt } from "@/types";
import { create } from "zustand";

interface NavigationStore {
	headers: NavigationHeader[];
	setHeaders: (headers: NavigationHeader[]) => void;

	openEditNavigationItemModal: boolean;
	setOpenEditNavigationItemModal: (open: boolean) => void;

	selectedNavigationItem: NavigationIt | null;
	setSelectedNavigationItem: (selectedNavigationItem: NavigationIt | null) => void;

	openDeleteNavigationItemModal: boolean;
	setOpenDeleteNavigationItemModal: (open: boolean) => void;

	openNewHeaderModal: boolean;
	setOpenNewHeaderModal: (open: boolean) => void;

	selectedHeader: NavigationHeader | null;
	setSelectedHeader: (selectedHeader: NavigationHeader | null) => void;

	openDeleteHeaderModal: boolean;
	setOpenDeleteHeaderModal: (open: boolean) => void;

	deleteItem: (itemId: number) => void;
	setEditItem: (item: NavigationIt) => void;
}

export const navigationStore = create<NavigationStore>((set, get) => ({
	headers: [],
	setHeaders: (headers) => set({ headers }),

	openEditNavigationItemModal: false,
	setOpenEditNavigationItemModal: (open) => set({ openEditNavigationItemModal: open }),

	selectedNavigationItem: null,
	setSelectedNavigationItem: (selectedNavigationItem) => set({ selectedNavigationItem }),

	openDeleteNavigationItemModal: false,
	setOpenDeleteNavigationItemModal: (open) => set({ openDeleteNavigationItemModal: open }),

	openNewHeaderModal: false,
	setOpenNewHeaderModal: (open) => set({ openNewHeaderModal: open }),

	selectedHeader: null,
	setSelectedHeader: (selectedHeader) => set({ selectedHeader }),

	openDeleteHeaderModal: false,
	setOpenDeleteHeaderModal: (open) => set({ openDeleteHeaderModal: open }),

	deleteItem: (itemId) => {
		set((state) => {
			const updatedHeaders = state.headers.map(header => ({
				...header,
				navigation_items: header.navigation_items.filter(item => item.id !== itemId)
			}));
			return { headers: updatedHeaders };
		});
		set({ openDeleteNavigationItemModal: true });
	},

	setEditItem: (item) => {
		set({ 
			selectedNavigationItem: item,
			openEditNavigationItemModal: true 
		});
	}
}));
