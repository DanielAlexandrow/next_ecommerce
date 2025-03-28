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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OrderFilters {
    search: string;
    orderStatus: string;
    paymentStatus: string;
    shippingStatus: string;
    dateRange: DateRange | undefined;
    minTotal: string;
    maxTotal: string;
}

const Orders = () => {
	const pageProps: any = usePage().props;
	const [orders, setOrders] = useState<any[]>(pageProps.orders.data);
	const [sortKey, setSortKey] = useState<string>(pageProps.sortkey);
	const [sortDirection, setSortDirection] = useState<string>(pageProps.sortdirection);
	const [links, setLinks] = useState(updateLinks(pageProps.orders.links, sortKey, sortDirection));
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const [orderDetailsModal, setOrderDetailsModal] = useState(false);
	const [filters, setFilters] = useState<OrderFilters>({
		search: "",
		orderStatus: "",
		paymentStatus: "",
		shippingStatus: "",
		dateRange: undefined,
		minTotal: "",
		maxTotal: ""
	});

	const handleSortChange = (key: string) => {
		const newSortDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
		const newUrl = `${window.location.protocol}//${window.location.host}/orders?sortkey=${key}&sortdirection=${newSortDirection}`;
		return newUrl;
	};

	const applyFilters = () => {
		const queryParams = {
			search: filters.search,
			orderStatus: filters.orderStatus,
			paymentStatus: filters.paymentStatus,
			shippingStatus: filters.shippingStatus,
			startDate: filters.dateRange?.from?.toISOString(),
			endDate: filters.dateRange?.to?.toISOString(),
			minTotal: filters.minTotal,
			maxTotal: filters.maxTotal
		};

		router.get('/orders', queryParams);
	};

	const resetFilters = () => {
		setFilters({
			search: "",
			orderStatus: "",
			paymentStatus: "",
			shippingStatus: "",
			dateRange: undefined,
			minTotal: "",
			maxTotal: ""
		});
		applyFilters();
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold text-center mb-8">Orders</h1>

			<div className="max-w-6xl mx-auto space-y-6">
				<Card>
					<CardContent className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<Input
									type="text"
									value={filters.search}
									onChange={(e) => setFilters({...filters, search: e.target.value})}
									placeholder="Search order ID, customer..."
									className="w-full"
								/>
							</div>

							<Select value={filters.orderStatus} onValueChange={(value) => setFilters({...filters, orderStatus: value})}>
								<SelectTrigger>
									<SelectValue placeholder="Order Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Statuses</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="processing">Processing</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>

							<Select value={filters.paymentStatus} onValueChange={(value) => setFilters({...filters, paymentStatus: value})}>
								<SelectTrigger>
									<SelectValue placeholder="Payment Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Payment Statuses</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="paid">Paid</SelectItem>
									<SelectItem value="failed">Failed</SelectItem>
								</SelectContent>
							</Select>

							<Select value={filters.shippingStatus} onValueChange={(value) => setFilters({...filters, shippingStatus: value})}>
								<SelectTrigger>
									<SelectValue placeholder="Shipping Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Shipping Statuses</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="shipped">Shipped</SelectItem>
									<SelectItem value="delivered">Delivered</SelectItem>
								</SelectContent>
							</Select>

							<div>
								<DatePickerWithRange 
									date={filters.dateRange}
									setDate={(range) => setFilters({...filters, dateRange: range})}
								/>
							</div>

							<div className="flex gap-2">
								<Input
									type="number"
									value={filters.minTotal}
									onChange={(e) => setFilters({...filters, minTotal: e.target.value})}
									placeholder="Min Total"
									className="w-full"
								/>
								<Input
									type="number"
									value={filters.maxTotal}
									onChange={(e) => setFilters({...filters, maxTotal: e.target.value})}
									placeholder="Max Total"
									className="w-full"
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2 mt-4">
							<Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
							<Button onClick={applyFilters}>Apply Filters</Button>
						</div>
					</CardContent>
				</Card>

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
											Customer Name {sortKey === 'name' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
										</span>
									</Link>
								</TableCell>
								<TableCell>
									<Link href={handleSortChange('total')}>
										<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											Total {sortKey === 'total' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
										</span>
									</Link>
								</TableCell>
								<TableCell>
									<Link href={handleSortChange('status')}>
										<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											Status {sortKey === 'status' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
										</span>
									</Link>
								</TableCell>
								<TableCell>
									<Link href={handleSortChange('created_at')}>
										<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											Date {sortKey === 'created_at' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
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
									<TableCell>${order.total}</TableCell>
									<TableCell>{order.status}</TableCell>
									<TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
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
										</DropdownMenu>
									</TableCell>
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
