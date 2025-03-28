import * as React from 'react';
import { StoreLayout } from '@/layouts/store-layout';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/api/orderApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'paid':
        case 'delivered':
            return 'bg-green-500';
        case 'pending':
            return 'bg-yellow-500';
        case 'cancelled':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
};

const OrdersList = () => {
    const queryResult = useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: orderApi.getUserOrders
    });
    const orders = queryResult?.data ?? [];
    const isLoading = queryResult?.isLoading ?? true;
    const error = queryResult?.error;

    if (isLoading) {
        return <div className="container mx-auto p-4" data-testid="orders-loading">Loading orders...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4" data-testid="orders-error">Error loading orders</div>;
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="container mx-auto p-4" data-testid="orders-empty">
                <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
                <p>No orders found.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4" data-testid="orders-container">
            <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
            <div className="space-y-4" data-testid="orders-list">
                {orders.map((order) => (
                    <Card key={order.id} data-testid={`order-card-${order.id}`}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span data-testid={`order-id-${order.id}`}>Order #{order.id}</span>
                                <span className="text-sm font-normal" data-testid={`order-date-${order.id}`}>
                                    {format(new Date(order.created_at), 'PPP')}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Order Status</span>
                                        <Badge className={getStatusColor(order.status)} data-testid={`order-status-${order.id}`}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Payment Status</span>
                                        <Badge className={getStatusColor(order.payment_status)} data-testid={`payment-status-${order.id}`}>
                                            {order.payment_status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Shipping Status</span>
                                        <Badge className={getStatusColor(order.shipping_status)} data-testid={`shipping-status-${order.id}`}>
                                            {order.shipping_status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-2">Items</h3>
                                    <div className="space-y-2" data-testid={`order-items-${order.id}`}>
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm" data-testid={`order-item-${order.id}-${index}`}>
                                                <span data-testid={`item-name-${order.id}-${index}`}>
                                                    {item.quantity}x {item.name} ({item.variant})
                                                </span>
                                                <span className="font-medium" data-testid={`item-total-${order.id}-${index}`}>
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between border-t pt-4">
                                    <span className="font-medium">Total:</span>
                                    <span className="font-medium" data-testid={`order-total-${order.id}`}>
                                        ${order.total.toFixed(2)}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => window.open(window.location.origin + `/orders/generatepdf/${order.id}`, '_blank')}
                                    data-testid={`download-invoice-${order.id}`}
                                >
                                    Download Invoice
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const OrdersPage = () => {
    return (
        <ErrorBoundary>
            <OrdersList />
        </ErrorBoundary>
    );
};

OrdersPage.layout = (page: React.ReactNode) => <StoreLayout>{page}</StoreLayout>;

export default OrdersPage;