import { create } from 'zustand';

export interface Image {
    id: number;
    name: string;
    path: string;
    full_path: string;
    created_at: string;
    updated_at: string;
}

export interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Pagination {
    links: PaginationLinks[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
}

interface ImageStoreState {
    images: Image[];
    pagination: Pagination;
    isLoading: boolean;
    deleteDialogOpen: boolean;
    selectedImageId: number | null;
    copyUrlDialogOpen: boolean;
    loadImages: () => void;
    deleteImage: (id: number) => void;
    setDeleteDialogOpen: (open: boolean) => void;
    setSelectedImageId: (id: number | null) => void;
    setCopyUrlDialogOpen: (open: boolean) => void;
    uploadImage: (file: File) => Promise<{success: boolean, image?: Image}>;
    searchImages: (term: string) => void;
    goToPage: (url: string) => void;
}

export const useImageStore = create<ImageStoreState>((set, get) => ({
    images: [],
    pagination: {
        links: [],
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0,
        per_page: 10
    },
    isLoading: false,
    deleteDialogOpen: false,
    selectedImageId: null,
    copyUrlDialogOpen: false,
    
    loadImages: async () => {
        set({ isLoading: true });
        
        try {
            const response = await fetch('/api/images');
            const data = await response.json();
            
            set({
                images: data.data,
                pagination: data.meta,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to load images:', error);
            set({ isLoading: false });
        }
    },
    
    deleteImage: async (id) => {
        try {
            await fetch(`/api/images/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
            
            // Refresh images after deletion
            get().loadImages();
            
            // Close dialog
            set({
                deleteDialogOpen: false,
                selectedImageId: null
            });
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    },
    
    setDeleteDialogOpen: (open) => set({ deleteDialogOpen: open }),
    setSelectedImageId: (id) => set({ selectedImageId: id }),
    setCopyUrlDialogOpen: (open) => set({ copyUrlDialogOpen: open }),
    
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch('/api/images', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Refresh image list after upload
                get().loadImages();
                return { success: true, image: data.image };
            }
            
            return { success: false };
        } catch (error) {
            console.error('Failed to upload image:', error);
            return { success: false };
        }
    },
    
    searchImages: async (term) => {
        set({ isLoading: true });
        
        try {
            const response = await fetch(`/api/images/search?term=${encodeURIComponent(term)}`);
            if (!response.ok) {
                throw new Error('Search request failed');
            }
            
            const data = await response.json();
            
            set({
                images: data.data || [],
                pagination: data.meta || {
                    links: [],
                    current_page: 1,
                    last_page: 1,
                    from: 0,
                    to: 0,
                    total: 0,
                    per_page: 10
                },
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to search images:', error);
            set({
                images: [],
                isLoading: false,
                pagination: {
                    links: [],
                    current_page: 1,
                    last_page: 1,
                    from: 0,
                    to: 0,
                    total: 0,
                    per_page: 10
                }
            });
        }
    },
    
    goToPage: async (url) => {
        set({ isLoading: true });
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            set({
                images: data.data,
                pagination: data.meta,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to navigate to page:', error);
            set({ isLoading: false });
        }
    }
}));
