// Product Types
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    images: Image[];
    categories: Category[];
    available: boolean;
    brand: Brand;
    subproducts: Subproduct[];
    category_id?: number;
}

export interface Image {
    id: number;
    url: string;
    product_id: number;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Brand {
    id: number;
    name: string;
}

export interface Subproduct {
    id: number;
    name: string;
    price: number;
    product_id: number;
}

// Store Types
export interface ProductSearchStore {
    products: Product[];
    isLoading: boolean;
    filters: Record<string, any>;
    categories?: Category[];
    setProducts: (products: Product[]) => void;
    setIsLoading: (loading: boolean) => void;
    setFilters: (filters: Record<string, any>) => void;
}

export interface CartStore {
    items: CartItem[];
    total: number;
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface CheckoutStore {
    address: Address | null;
    paymentMethod: string | null;
    setAddress: (address: Address) => void;
    setPaymentMethod: (method: string) => void;
    processCheckout: (data: CheckoutData) => Promise<{ success: boolean }>;
}

export interface Address {
    street: string;
    city: string;
    postal_code: string;
    country: string;
}

export interface CheckoutData {
    items: CartItem[];
    address: Address;
    payment: PaymentDetails;
}

export interface PaymentDetails {
    method: string;
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
}

export interface ProductStore {
    products: Product[];
    isLoading: boolean;
    createProduct: (product: Partial<Product>) => Promise<Product>;
    updateProduct: (id: number, data: Partial<Product>) => Promise<Product>;
    deleteProduct: (id: number) => Promise<{ success: boolean }>;
}

export interface ImageStore {
    images: Image[];
    uploadImage: (file: File) => Promise<Image>;
    deleteImage: (id: number) => Promise<void>;
} 