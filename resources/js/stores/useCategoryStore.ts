import create from 'zustand';

interface CategoryStoreState {
	// ...existing code...
	categories: string[];
	setCategories: (cats: string[]) => void;
}

export const useCategoryStore = create<CategoryStoreState>((set) => ({
	// ...existing code...
	categories: [],
	// ...existing code...
	setCategories: (cats) => set({ categories: cats })
}));
