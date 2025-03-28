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