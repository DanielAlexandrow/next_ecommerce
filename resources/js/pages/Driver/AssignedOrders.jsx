import React from 'react';
import { AdminLayout } from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';

interface Order {
    id: number;
    customer: {
        name: string;
        addressInfo: {
            postcode: string;
            city: string;
            country: string;
            street: string;
        };
    };
    items: Array<{
        id: number;
        subproduct: {
            name: string;
            price: number;
            product: {
                name: string;
            };
        };
        quantity: number;
    }>;
    status: string;
}

const AssignedOrders = () => {
    const pageProps: any = usePage().props;
    const orders: Order[] = pageProps.orders;

    return (
        <>
            <h1 className="text-center">Assigned Orders</h1>
            <div className="mt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Customer Name</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Total Items</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.customer.name}</TableCell>
                                <TableCell>
                                    {`${order.customer.addressInfo.street}, ${order.customer.addressInfo.city}, ${order.customer.addressInfo.country} - ${order.customer.addressInfo.postcode}`}
                                </TableCell>
                                <TableCell>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                                <TableCell>{order.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};

AssignedOrders.layout = (page: any) => <AdminLayout children={page} />;

export default AssignedOrders; 