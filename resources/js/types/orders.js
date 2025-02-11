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