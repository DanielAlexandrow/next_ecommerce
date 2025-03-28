// Types for cart-related interfaces
import { StoreProduct, Subproduct } from './index';

// Define StoreSubproduct with product relation
export interface StoreSubproduct {
    id: number;
    name: string;
    price: number;
    product_id: number;
    available: boolean;
    stock?: number;
    product: StoreProduct;
}

// CartItem definition that matches the application's structure
export interface CartItem {
    id: number;
    cart_id: number;
    subproduct_id: number;
    quantity: number;
    subproduct: StoreSubproduct;
    created_at?: string;
    updated_at?: string;
}

// Alias to maintain backward compatibility 
export type CartItemType = CartItem;