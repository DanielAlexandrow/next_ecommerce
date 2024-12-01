import React, { useEffect } from 'react';
import { StoreLayout } from '@/layouts/store-layout';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useUserOrdersStore } from '@/stores/userOrdersStore';
import { userOrdersApi } from '@/api/userOrdersApi';
import { OrderDetailsModal } from '@/components/Store/OrderDetails/OrderDetailsModal';
import { toast } from 'react-toastify';
import moment from 'moment';

const UserOrders = () => {
    const {
        orders,
        setOrders,
        setSelectedOrder,
        setIsModalOpen,
        setIsLoading
    } = useUserOrdersStore();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            console.log('Loading orders...');
            const data = await userOrdersApi.getOrders();
            console.log('Orders loaded:', data);
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        }
    };

    const handleViewDetails = async (orderId: number) => {
        setIsLoading(true);
        setIsModalOpen(true);
        try {
            console.log('Loading order details for ID:', orderId);
            const details = await userOrdersApi.getOrderDetails(orderId);
            console.log('Order details loaded:', details);
            setSelectedOrder(details);
        } catch (error) {
            console.error('Error loading order details:', error);
            toast.error('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Orders</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>#{order.id}</TableCell>
                            <TableCell>
                                {moment(order.created_at).format('DD/MM/YYYY HH:mm')}
                            </TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    onClick={() => handleViewDetails(order.id)}
                                >
                                    View Details
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <OrderDetailsModal />
        </div>
    );
};

UserOrders.layout = (page: React.ReactNode) => <StoreLayout>{page}</StoreLayout>;

export default UserOrders; 