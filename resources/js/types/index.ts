export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'driver' | 'customer';
    created_at: string;
    updated_at: string;
    isAdmin: boolean;
    avatar: string;
    acronym: string;
    status: 'Verified' | 'Unverified';
    joined: string;
}

export interface Product {
    brand_id: number | null;
}
