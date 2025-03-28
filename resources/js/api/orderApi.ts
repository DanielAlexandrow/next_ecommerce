import axios from 'axios';
import { Order } from '@/types/orders';

const validateOrderId = (orderId: number | null): string | null => {
    if (!orderId) {
        return 'Order ID is required but was not provided';
    }
    if (typeof orderId !== 'number') {
        return 'Order ID must be a number';
    }
    if (orderId <= 0) {
        return 'Order ID must be a positive number';
    }
    return null;
};

const validateOrderStatus = (status: string | null): string | null => {
    if (!status) {
        return 'Order status is required but was not provided';
    }
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return `Invalid order status. Must be one of: ${validStatuses.join(', ')}`;
    }
    return null;
};

export const orderApi = {
    getUserOrders: async (): Promise<Order[]> => {
        try {
            const response = await axios.get('/profile/orders/get');
            if (!response.data) {
                throw new Error('No data received from user orders endpoint');
            }
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user orders:', error);
            throw new Error('Failed to fetch user orders');
        }
    },

    getOrderDetails: async (orderId: number | null): Promise<Order> => {
        const error = validateOrderId(orderId);
        if (error) {
            throw new Error(error);
        }

        try {
            const response = await axios.get(`/profile/orders/getitems/${orderId}`);
            if (!response.data) {
                throw new Error('No data received from order details endpoint');
            }
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch order details for order ${orderId}:`, error);
            throw new Error('Failed to fetch order details');
        }
    },

    updateOrderStatus: async (orderId: number | null, status: string | null): Promise<Order> => {
        const orderError = validateOrderId(orderId);
        if (orderError) {
            throw new Error(orderError);
        }

        const statusError = validateOrderStatus(status);
        if (statusError) {
            throw new Error(statusError);
        }

        try {
            const response = await axios.put(`/orders/${orderId}/status`, { status });
            if (!response.data) {
                throw new Error('No data received from update status endpoint');
            }
            return response.data;
        } catch (error) {
            console.error(`Failed to update status for order ${orderId}:`, error);
            throw new Error('Failed to update order status');
        }
    },

    generatePdf: async (orderId: number | null): Promise<Blob> => {
        const error = validateOrderId(orderId);
        if (error) {
            throw new Error(error);
        }

        try {
            const response = await axios.get(`/orders/generatepdf/${orderId}`, {
                responseType: 'blob'
            });
            if (!response.data) {
                throw new Error('No PDF data received');
            }
            return response.data;
        } catch (error) {
            console.error(`Failed to generate PDF for order ${orderId}:`, error);
            throw new Error('Failed to generate order PDF');
        }
    }
};