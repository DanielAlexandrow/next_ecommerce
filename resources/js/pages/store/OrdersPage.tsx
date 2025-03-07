import * as React from 'react';
import { StoreLayout } from '@/layouts/store-layout';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/api/orderApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';

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

const OrdersPage = () => {
    const { data: orders, isLoading, error } = useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: orderApi.getUserOrders
    });

    if (isLoading) {
        return <div className="container mx-auto p-4">Loading orders...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4">Error loading orders</div>;
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
                <p>No orders found.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
            <div className="space-y-4">
                {orders.map((order) => (
                    <Card key={order.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Order #{order.id}</span>
                                <span className="text-sm font-normal">
                                    {format(new Date(order.created_at), 'PPP')}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Order Status</span>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Payment Status</span>
                                        <Badge className={getStatusColor(order.payment_status)}>
                                            {order.payment_status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Shipping Status</span>
                                        <Badge className={getStatusColor(order.shipping_status)}>
                                            {order.shipping_status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-2">Items</h3>
                                    <div className="space-y-2">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span>
                                                    {item.quantity}x {item.name} ({item.variant})
                                                </span>
                                                <span className="font-medium">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between border-t pt-4">
                                    <span className="font-medium">Total:</span>
                                    <span className="font-medium">
                                        ${order.total.toFixed(2)}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => window.open(window.location.origin + `/orders/generatepdf/${order.id}`, '_blank')}
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

OrdersPage.layout = (page: React.ReactNode) => <StoreLayout>{page}</StoreLayout>;

export default OrdersPage;