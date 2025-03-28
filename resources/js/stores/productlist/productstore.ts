import { Product, Subproduct } from "@/types";
import { create } from "zustand";

interface ProductsStore {
    products: Product[];
    setProducts: (products: Product[] | null) => void;

    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;

    openSubproductsModal: boolean;
    setSubproductsModal: (open: boolean) => void;

    openDeleteProductModal: boolean;
    setOpenDeleteProductModal: (open: boolean) => void;

    openSubproductFormModal: boolean;
    setOpenSubproductFormModal: (open: boolean) => void;

    selectedSubproduct: Subproduct | null;
    setSelectedSubproduct: (subproduct: Subproduct | null) => void;

    subproducts: Subproduct[];
    setSubproducts: (subproducts: Subproduct[] | null) => void;

    openNewSubproductModal: boolean;
    setOpenNewSubproductModal: (open: boolean) => void;

    openDeleteSubproductModal: boolean;
    setOpenDeleteSubproductModal: (open: boolean) => void;

    openEditProductModal: boolean;
    setOpenEditProductModal: (open: boolean) => void;

    error: string | null;
}

export const productsStore = create<ProductsStore>((set, get) => ({
    products: [],
    setProducts: (products) => {
        if (!products) {
            console.error('productsStore: Attempted to set null products array');
            set({ error: 'Invalid products data received', products: [] });
            return;
        }
        if (!Array.isArray(products)) {
            console.error('productsStore: Products must be an array');
            set({ error: 'Invalid products data format', products: [] });
            return;
        }
        set({ products, error: null });
    },

    selectedProduct: null,
    setSelectedProduct: (product) => {
        if (product && (!product.id || !product.name)) {
            console.error('productsStore: Invalid product data', product);
            set({ error: 'Invalid product data', selectedProduct: null });
            return;
        }
        set({ selectedProduct: product, error: null });
    },

    openSubproductsModal: false,
    setSubproductsModal: (open) => {
        if (typeof open !== 'boolean') {
            console.error('productsStore: Modal state must be boolean');
            return;
        }
        set({ openSubproductsModal: open });
    },

    openDeleteProductModal: false,
    setOpenDeleteProductModal: (open) => {
        if (typeof open !== 'boolean') {
            console.error('productsStore: Modal state must be boolean');
            return;
        }
        set({ openDeleteProductModal: open });
    },

    openSubproductFormModal: false,
    setOpenSubproductFormModal: (open) => {
        if (typeof open !== 'boolean') {
            console.error('productsStore: Modal state must be boolean');
            return;
        }
        set({ openSubproductFormModal: open });
    },

    selectedSubproduct: null,
    setSelectedSubproduct: (subproduct) => {
        if (subproduct && (!subproduct.id || !subproduct.name)) {
            console.error('productsStore: Invalid subproduct data', subproduct);
            set({ error: 'Invalid subproduct data', selectedSubproduct: null });
            return;
        }
        set({ selectedSubproduct: subproduct, error: null });
    },

    subproducts: [],
    setSubproducts: (subproducts) => {
        if (!subproducts) {
            console.error('productsStore: Attempted to set null subproducts array');
            set({ error: 'Invalid subproducts data received', subproducts: [] });
            return;
        }
        if (!Array.isArray(subproducts)) {
            console.error('productsStore: Subproducts must be an array');
            set({ error: 'Invalid subproducts data format', subproducts: [] });
            return;
        }
        set({ subproducts, error: null });
    },

    openNewSubproductModal: false,
    setOpenNewSubproductModal: (open) => {
        if (typeof open !== 'boolean') {
            console.error('productsStore: Modal state must be boolean');
            return;
        }
        set({ openNewSubproductModal: open });
    },

    openDeleteSubproductModal: false,
    setOpenDeleteSubproductModal: (open) => {
        if (typeof open !== 'boolean') {
            console.error('productsStore: Modal state must be boolean');
            return;
        }
        set({ openDeleteSubproductModal: open });
    },

    openEditProductModal: false,
    setOpenEditProductModal: (open) => {
        if (typeof open !== 'boolean') {
            console.error('productsStore: Modal state must be boolean');
            return;
        }
        set({ openEditProductModal: open });
    },

    error: null
}));