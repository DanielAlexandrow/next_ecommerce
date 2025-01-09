export interface Category {
    id: number;
    name: string;
}

export interface NavigationIt {
    id: number;
    name: string;
    order_num: number;
    header_id: number;
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
    images: Array<{
        id: number;
        path: string;
    }>;
    subproducts: Array<{
        id: number;
        name: string;
        price: number;
        available: boolean;
    }>;
    average_rating?: number;
    reviews?: Array<{
        id: number;
        rating: number;
        comment: string;
    }>;
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

export interface Brand {
    id: number;
    name: string;
    description?: string;
    products_count?: number;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    available: boolean;
    brand_id: number;
    subproducts?: Array<{
        id: number;
        name: string;
        price: number;
        available: boolean;
    }>;
    reviews?: Array<{
        id: number;
        rating: number;
        comment: string;
    }>;
    created_at?: string;
    updated_at?: string;
} 