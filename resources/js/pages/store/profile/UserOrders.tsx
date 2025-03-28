import { StoreLayout } from "@/layouts/store-layout";
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import ProfileTabs from "./ProfileTabs";
import { updateLinks } from "@/lib/utils";
import OrderDetailsModal from "@/components/Admin/OrderDetailsModal/OrderDetailsModal";
import Paginate from "@/components/pagination";
import moment from "moment";
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function UserOrders() {
    const pageProps: any = usePage().props;
    const [orders, setOrders] = useState(pageProps.orders.data);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderDetailsModal, setOrderDetailsModal] = useState(false);

    const { sortConfig, getSortedUrl } = useTableSort({
        key: pageProps.sortkey,
        direction: pageProps.sortdirection
    }, pageProps.orders.current_page);

    const [links, setLinks] = useState(updateLinks(pageProps.orders.links, sortConfig.key, sortConfig.direction));

    useEffect(() => {
        if (pageProps.orders) {
            setOrders(pageProps.orders.data);
            setLinks(updateLinks(pageProps.orders.links, sortConfig.key, sortConfig.direction));
        }
    }, [pageProps]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        
        if (value === '') {
            setOrders(pageProps.orders.data);
            return;
        }
        
        const filteredOrders = pageProps.orders.data.filter((order: any) => 
            order.id.toString().includes(value) || 
            order.status?.toLowerCase().includes(value.toLowerCase())
        );
        
        setOrders(filteredOrders);
    };

    const handleSelectOrder = (orderId: number, checked: boolean) => {
        if (checked) {
            setSelectedOrders([...selectedOrders, orderId]);
        } else {
            setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedOrders(orders.map(order => order.id));
        } else {
            setSelectedOrders([]);
        }
    };

    const tableFields = (
        <TableRow>
            <TableCell className="w-[40px] p-2">
                <Checkbox 
                    checked={selectedOrders.length === orders.length}
                    onCheckedChange={handleSelectAll}
                    role="checkbox"
                    aria-label="Select all orders"
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Order ID"
                    sortKey="id"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Status"
                    sortKey="status"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Total"
                    sortKey="total"
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
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <ProfileTabs selected="Orders" />

            <div className="max-w-6xl mx-auto space-y-6 mt-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8"
                            role="textbox"
                            aria-label="Search orders"
                        />
                    </div>

                    {selectedOrders.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                                {selectedOrders.length} selected
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Bulk Actions
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Download Invoices</DropdownMenuItem>
                                    <DropdownMenuItem>Export Details</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                <div className="bg-card rounded-lg shadow-sm p-6">
                    <Table className="w-full">
                        <TableHeader>{tableFields}</TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="p-2">
                                        <Checkbox 
                                            checked={selectedOrders.includes(order.id)}
                                            onCheckedChange={(checked) => handleSelectOrder(order.id, checked === true)}
                                            role="checkbox"
                                            aria-label={`Select order ${order.id}`}
                                        />
                                    </TableCell>
                                    <TableCell>#{order.id}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell>${order.total}</TableCell>
                                    <TableCell>{moment(order.created_at).format('HH:mm DD.MM.YYYY')}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center gap-2">
                                                Actions
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setOrderDetailsModal(true);
                                                    }}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => window.open(window.location.origin + `/orders/generatepdf/${order.id}`, '_blank')}
                                                >
                                                    Download Invoice
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Track Order
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
