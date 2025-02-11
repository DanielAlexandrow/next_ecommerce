import { StoreLayout } from "@/layouts/store-layout";
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import ProfileTabs from "./ProfileTabs";
import { updateLinks } from "@/lib/utils";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import OrderDetailsModal from "@/components/Admin/OrderDetailsModal/OrderDetailsModal";
import Paginate from "@/components/pagination";
import moment from "moment";
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';



export default function UserOrders() {
	const pageProps: any = usePage().props;
	const [orders, setOrders] = useState(pageProps.orders.data);
	const { sortConfig, getSortedUrl } = useTableSort({
		key: pageProps.sortkey,
		direction: pageProps.sortdirection
	}, pageProps.orders.current_page);
	const [links, setLinks] = useState(updateLinks(pageProps.orders.links, sortConfig.key, sortConfig.direction));
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const [orderDetailsModal, setOrderDetailsModal] = useState(false);
	console.log(orders);


	return (
		<div className="container mx-auto px-4 py-8">
			<ProfileTabs selected="Orders" />
			<div className="max-w-4xl mx-auto mt-8">
				<div className="bg-card rounded-lg shadow-sm p-6">
					<div className="mb-4">{<Paginate links={links} />}</div>
					<div style={{ width: "800px", margin: "auto" }}>
						<Table className='text-center'>
							<TableHeader>
								<TableRow>

									<TableCell>
										<SortableHeader
											label="No."
											sortKey="id"
											sortConfig={sortConfig}
											getSortedUrl={getSortedUrl}
										/>
									</TableCell>

									<TableCell>
										<SortableHeader
											label="Date"
											sortKey="created_at"
											sortConfig={sortConfig}
											getSortedUrl={getSortedUrl}
										/>
									</TableCell>

									<TableCell>Actions</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => (
									<TableRow key={order.id}>
										<TableCell>{order.id}</TableCell>
										<TableCell>{moment(order.created_at).format('HH:mm DD.MM.YYYY')}</TableCell>
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
					<div className="mt-4">{<Paginate links={links} />}</div>
				</div>
			</div>
			{orderDetailsModal && (
				<OrderDetailsModal
					orderId={selectedOrder.id}
					setOpen={setOrderDetailsModal}
					open={orderDetailsModal}
					customer={true}

				/>
			)}
		</div>
	);


}


UserOrders.layout = (page: any) => <StoreLayout children={page} />;
