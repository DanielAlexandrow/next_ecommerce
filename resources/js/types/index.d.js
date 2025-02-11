// Base Types
export interface BaseModel {
	id: number;
	created_at?: string;
	updated_at?: string;
}

// Product Types
export interface ProductImage extends BaseModel {
	name: string;
	url: string;
	path: string;
	product_id: number;
	pivot?: {
		product_id: number;
		image_id: number;
		order?: number;
	};
}

export interface Product extends BaseModel {
	name: string;
	description: string;
	price: number;
	images: ProductImage[];
	categories: Category[];
	available: boolean;
	brand: Brand;
	subproducts: Subproduct[];
	category_id?: number;
}

export interface Category extends BaseModel {
	name: string;
	description?: string;
	parent_id?: number;
	children?: Category[];
}

export interface Brand extends BaseModel {
	name: string;
	logo?: string;
}

export interface Subproduct extends BaseModel {
	name: string;
	price: number;
	product_id: number;
	sku?: string;
	stock?: number;
}

// Form Types
export interface ProductFormData {
	mode: 'new' | 'edit';
	product?: Product;
}

// Component Props
export interface ProductFormProps extends ProductFormData {
	onSubmit?: (data: Partial<Product>) => void;
	onCancel?: () => void;
}

export interface ProductListProps {
	products: Product[];
	onDelete?: (id: number) => void;
	onEdit?: (product: Product) => void;
}

export interface ImageUploadProps {
	onUpload?: (image: ProductImage) => void;
	onError?: (error: Error) => void;
	maxFiles?: number;
	accept?: string[];
	multiple?: boolean;
}

// Re-export store types for compatibility
export type {
	CartItem,
	CartStore,
	CheckoutStore,
	Address,
	PaymentDetails,
	CheckoutData,
	ProductStore,
	ProductSearchStore
} from './stores';
