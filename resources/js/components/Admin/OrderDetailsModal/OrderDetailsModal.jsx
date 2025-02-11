import { orderApi } from '@/api/orderApi';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { OrderDetails } from '@/types';
import axios from 'axios';
import { useEffect, useState } from 'react';

const OrderDetailsModal: React.FC<{ open: boolean, setOpen: (open: boolean) => void, orderId: number | undefined, customer: boolean }> = ({ open, setOpen, orderId, customer }) => {
	const [orderItems, setOrderItems] = useState<OrderDetails | null>(null);

	useEffect(() => {
		if (open && orderId) {
			const fetchData = async () => {
				try {
					const data = await orderApi.getOrderItems(orderId, customer);
					setOrderItems(data);
				} catch (error) {
					console.error('Fetch error:', error);
				}
			}
			fetchData();
		}
	}, [open, orderId, customer]);

	const generatePDF = async () => {
		if (!orderId) return;
		try {
			const blob = await orderApi.generatePDF(orderId);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `order_${orderId}_invoice.pdf`);
			document.body.appendChild(link);
			link.click();
		} catch (error) {
			console.error('PDF generation error:', error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild></DialogTrigger>
			<DialogContent>
				<DialogTitle>Order {orderId}</DialogTitle>

				{orderItems && orderItems.customer && (
					<div className='mt-4'>
						<h3 className='text-xl font-semibold'>Customer Address Information</h3>
						<p><strong>Postcode:</strong> {orderItems.customer.address_info.postcode}</p>
						<p><strong>City:</strong> {orderItems.customer.address_info.city}</p>
						<p><strong>Country:</strong> {orderItems.customer.address_info.country}</p>
						<p><strong>Street:</strong> {orderItems.customer.address_info.street}</p>
					</div>
				)}
				<h3 className='text-xl font-semibold'>Items</h3>

				<Table className='text-center'>
					<TableHeader>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Quantity</TableCell>
							<TableCell>Price Single</TableCell>
							<TableCell>Total</TableCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orderItems?.items.map((item) => (
							<TableRow key={item.id}>
								<TableCell>{item.subproduct.product.name}</TableCell>
								<TableCell>{item.subproduct.name}</TableCell>
								<TableCell>{item.quantity}</TableCell>
								<TableCell>{item.subproduct.price}</TableCell>
								<TableCell>{item.subproduct.price * item.quantity}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				<div className='mt-4 flex justify-between items-center'>
					<p className='text-xl font-semibold'>Total Price: {orderItems?.items.reduce((acc, item) => acc + item.subproduct.price * item.quantity, 0)?.toFixed(2)}</p>
					<button onClick={generatePDF} className='btn btn-primary'>Generate PDF Invoice</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default OrderDetailsModal;
