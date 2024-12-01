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