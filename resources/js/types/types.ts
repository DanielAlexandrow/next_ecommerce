import { NavigationIt } from './index';

export interface Header {
    id: number;
    name: string;
    order_num: number;
    description?: string;
    navigation_items: NavigationIt[];
}