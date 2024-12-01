import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useUserOrdersStore } from '@/stores/userOrdersStore';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export const OrderDetailsModal = () => {
    const { selectedOrder, isModalOpen, setIsModalOpen, isLoading } = useUserOrdersStore();

    if (!selectedOrder && !isLoading) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : selectedOrder ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Customer Information</h3>
                            <div className="text-sm">
                                <p>Name: {selectedOrder.customer.address_info.city}</p>
                                <p>Address: {selectedOrder.customer.address_info.street}</p>
                                <p>City: {selectedOrder.customer.address_info.city}</p>
                                <p>Country: {selectedOrder.customer.address_info.country}</p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Option</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Total</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedOrder.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.subproduct.product.name}</TableCell>
                                        <TableCell>{item.subproduct.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>${item.subproduct.price}</TableCell>
                                        <TableCell>
                                            ${(item.quantity * item.subproduct.price).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="text-right">
                            <p className="font-bold">
                                Total: $
                                {selectedOrder.items
                                    .reduce((sum, item) => sum + item.quantity * item.subproduct.price, 0)
                                    .toFixed(2)}
                            </p>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}; 