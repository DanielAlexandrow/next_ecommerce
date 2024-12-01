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
}

export const navigationStore = create<NavigationStore>((set) => ({
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
}));
