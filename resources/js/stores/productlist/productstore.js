
import { Product, Subproduct } from "@/types";
import { create } from "zustand";

interface productsStore {
	products: Product[];
	setProducts: (products: Product[]) => void;

	selectedProduct: Product | null;
	setSelectedProduct: (product: Product) => void;

	openSubproductsModal: boolean;
	setSubproductsModal: (open: boolean) => void;

	openDeleteProductModal: boolean;
	setOpenDeleteProductModal: (open: boolean) => void;

	openSubproductFormModal: boolean;
	setOpenSubproductFormModal: (open: boolean) => void;

	selectedSubproduct: Subproduct | null;
	setSelectedSubproduct: (subproduct: Subproduct | null) => void;

	subproducts: Subproduct[];
	setSubproducts: (subproducts: Subproduct[]) => void;

	openNewSubproductModal: boolean;
	setOpenNewSubproductModal: (open: boolean) => void;

	openDeleteSubproductModal: boolean;
	setOpenDeleteSubproductModal: (open: boolean) => void;

	openEditProductModal: boolean;
	setOpenEditProductModal: (open: boolean) => void;

}

export const productsStore = create<productsStore>((set: any) => ({
	products: [],
	setProducts: (products) => set({ products }),

	selectedProduct: null,
	setSelectedProduct: (product) => set({ selectedProduct: product }),

	openSubproductsModal: false,
	setSubproductsModal: (open) => set({ openSubproductsModal: open }),

	openDeleteProductModal: false,
	setOpenDeleteProductModal: (open) => set({ openDeleteProductModal: open }),

	openSubproductFormModal: false,
	setOpenSubproductFormModal: (open) => set({ openSubproductFormModal: open }),

	selectedSubproduct: null,
	setSelectedSubproduct: (subproduct) => set({ selectedSubproduct: subproduct }),

	subproducts: [],
	setSubproducts: (subproducts) => set({ subproducts }),

	openNewSubproductModal: false,
	setOpenNewSubproductModal: (open) => set({ openNewSubproductModal: open }),

	openDeleteSubproductModal: false,
	setOpenDeleteSubproductModal: (open) => set({ openDeleteSubproductModal: open }),

	openEditProductModal: false,
	setOpenEditProductModal: (open) => set({ openEditProductModal: open }),

}));