// Base Types
export interface BaseModel {
	id: number;
	created_at?: string;
	updated_at?: string;
}

// Re-export Header type
export { Header } from './types';

// Product Types
export interface ProductImage extends BaseModel {
	name: string;
	url: string;
	path: string;
	full_path: string;
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
	products_count?: number;  // Add this property
}

export interface Subproduct extends BaseModel {
	name: string;
	price: number;
	product_id: number;
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


export interface Category {
    id: number;
    name: string;
}

export interface NavigationIt {
    id: number;
    name: string;
    order_num: number;
    header_id: number;
    description?: string;
    categories: Category[];
    isTemporary?: boolean;
}

export interface NavigationHeader {
    id: number;
    name: string;
    order_num: number;
    navigation_items: NavigationIt[];
}

export interface StoreProduct {
    id: number;
    name: string;
    description: string;
    available: boolean;
    images: ProductImage[];
    subproducts: Subproduct[];
    categories: ProductCategory[];
    brand: Brand;
    reviews: Review[];
    average_rating: number;
    discount: number;
    original_price?: number;
}

export interface ProductImage {
    id: number;
    name: string;
    path: string;
    full_path: string;
    pivot?: {
        image_id: number;
        order_num?: number;
    };
}

export interface ProductCategory {
    id: number;
    name: string;
    pivot: {
        category_id: number;
    };
}

export interface Brand {
    id: number;
    name: string;
    description?: string;
    products_count?: number;  // Add this property
}

export interface Subproduct {
    id: number;
    name: string;
    price: number;
    available: boolean;
    product_id: number;
    stock?: number;
}

export interface Review {
    id: number;
    rating: number;
    content?: string;
    title?: string;
    user_id: number;
    created_at: string;
    user: {
        name: string;
        avatar: string;
        id: number;
    };
}

export interface OrderItem {
    product_id: number;
    subproduct_id: number;
    quantity: number;
    price: number;
    name: string;
    variant: string;
}

export interface Order {
    id: number;
    user_id: number | null;
    guest_id: number | null;
    total: number;
    status: string;
    payment_status: string;
    shipping_status: string;
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}

// Alias to ensure backward compatibility
export type StoreOrder = Order;

export interface CustomImage {
    id: number;
    name?: string;
    path: string;
    full_path?: string;
    created_at?: string; // Add this line
    pivot?: {
        id?: number;
        image_id: number;
        order_num: number;
    };
}

export interface Product {
    id: number;
    name: string;
    description: string;
    available: boolean;
    brand_id: number;
    price?: number; // Adding price property
    brand?: Brand | null; // Adding brand relation
    categories?: Category[]; // Adding categories relation
    images?: CustomImage[]; // Adding images relation
    subproducts?: Subproduct[];
    reviews?: Array<{
        id: number;
        rating: number;
        comment: string;
    }>;
    created_at?: string;
    updated_at?: string;
    average_rating?: number;
}

// Add the Image type if it's missing
export interface Image {
  id: number;
  name: string;
  path: string;
  full_path: string; // Based on the models, this is an appended attribute
  created_at?: string;
  updated_at?: string;
  pivot?: {
    product_id: number;
    image_id: number;
    order_num: number;
  };
}

// Add NavigationItem if it doesn't exist
export interface NavigationItem {
  id: number;
  name: string;
  order_num: number;
  description?: string;
  header_id: number;
  header?: Header;
  categories?: Category[];
}

export interface Deal {
    id: number;
    name: string;
    description: string | null;
    discount_amount: number;
    discount_type: 'percentage' | 'fixed';
    start_date: string;
    end_date: string;
    active: boolean;
    deal_type: 'product' | 'category' | 'brand' | 'cart';
    conditions: {
        minimum_amount?: number;
        required_items?: number;
        [key: string]: any;
    } | null;
    metadata: any | null;
    products?: Array<{ id: number; name: string }>;
    categories?: Array<{ id: number; name: string }>;
    brands?: Array<{ id: number; name: string }>;
    subproducts?: Array<{ id: number; name: string }>;
    created_at: string;
    updated_at: string;
}

// Add to existing types
export interface CartItem extends BaseModel {
    cart_id: number;
    subproduct_id: number;
    quantity: number;
    subproduct: Subproduct & {
        product: Product;
    };
}