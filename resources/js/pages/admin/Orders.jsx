import { AdminLayout } from "@/layouts/app-layout";
import { usePage, Link } from "@inertiajs/react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { router } from '@inertiajs/react';
import { Input } from "@/components/ui/input";
import { updateLinks } from "@/lib/utils";
import Paginate from "@/components/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import OrderDetailsModal from "@/components/Admin/OrderDetailsModal/OrderDetailsModal";


const Orders = () => {
	const pageProps: any = usePage().props;
	const [orders, setOrders] = useState<any[]>(pageProps.orders.data);
	const [sortKey, setSortKey] = useState<string>(pageProps.sortkey);
	const [sortDirection, setSortDirection] = useState<string>(pageProps.sortdirection);
	const [links, setLinks] = useState(updateLinks(pageProps.orders.links, sortKey, sortDirection));
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const [orderDetailsModal, setOrderDetailsModal] = useState(false);


	const handleSortChange = (key: string) => {
		const newSortDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
		const newUrl = `${window.location.protocol}//${window.location.host}/orders?sortkey=${key}&sortdirection=${newSortDirection}`;
		return newUrl;
	};

	const handleSearch = async (value) => {
		try {
			router.visit('/orders', {
				method: 'get',
				data: { search: value, sortkey: sortKey, sortdirection: sortDirection },
				preserveState: true,
				preserveScroll: true,
				only: ['orders'],
				onSuccess(reponse: any) {
					setOrders(reponse.props.orders.data);
				},
			});

		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold text-center mb-8">Orders</h1>

			<div className="max-w-6xl mx-auto space-y-6">
				<Input
					type="text"
					onChange={(e) => handleSearch(e.target.value)}
					placeholder="Search by name"
					className="max-w-md mx-auto"
				/>

				<div className="bg-card rounded-lg shadow-sm p-6">
					<Table className="w-full">
						<TableHeader>
							<TableRow>
								<TableCell>
									<Link href={handleSortChange('orders.id')}>
										<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											No.{sortKey === 'id' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
										</span>
									</Link>
								</TableCell>
								<TableCell>
									<Link href={handleSortChange('name')}>
										<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											Customer Name {sortKey === 'guest.name' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
										</span>
									</Link>
								</TableCell>
								<TableCell>
									<Link href={handleSortChange('item_count')}>
										<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											Total Items {sortKey === 'orderitems_count' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
										</span>
									</Link>
								</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.map((order) => (
								<TableRow key={order.order_id}>
									<TableCell>{order.order_id}</TableCell>
									<TableCell>{order.name || 'N/A'}</TableCell>
									<TableCell>{order.item_count}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger>Open</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem
													onClick={() => {
														setSelectedOrder(order);
														setOrderDetailsModal(true);
													}}>
													View Details
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>								</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<div className="flex justify-center mt-4">
					<Paginate links={links} />
				</div>
			</div>

			{orderDetailsModal && (
				<OrderDetailsModal
					orderId={selectedOrder.order_id}
					setOpen={setOrderDetailsModal}
					open={orderDetailsModal}
					customer={false}
				/>
			)}
		</div>
	);
}

Orders.layout = (page: any) => <AdminLayout children={page} />;

export default Orders;
