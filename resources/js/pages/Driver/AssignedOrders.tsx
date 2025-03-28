import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';
import { updateLinks } from '@/lib/utils';
import Paginate from '@/components/pagination';
import OrderDetailsModal from '@/components/Admin/OrderDetailsModal/OrderDetailsModal';
import moment from 'moment';

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
    created_at: string;
}

const AssignedOrders = () => {
    const pageProps: any = usePage().props;
    const [orders, setOrders] = useState<Order[]>(pageProps.orders.data);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderDetailsModal, setOrderDetailsModal] = useState(false);

    const { sortConfig, getSortedUrl } = useTableSort({
        key: pageProps.sortkey || 'id',
        direction: pageProps.sortdirection || 'desc'
    }, pageProps.orders?.current_page || 1);

    const [links, setLinks] = useState(updateLinks(pageProps.orders?.links || [], sortConfig.key, sortConfig.direction));

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
        
        const filteredOrders = pageProps.orders.data.filter((order: Order) => 
            order.customer.name.toLowerCase().includes(value.toLowerCase()) ||
            order.id.toString().includes(value) ||
            order.customer.addressInfo.street.toLowerCase().includes(value.toLowerCase()) ||
            order.status.toLowerCase().includes(value.toLowerCase())
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
                    label="Customer"
                    sortKey="customer.name"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Address"
                    sortKey="customer.addressInfo.street"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Items"
                    sortKey="items_count"
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
                    label="Created"
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
            <h1 className="text-3xl font-bold text-center mb-8">Assigned Orders</h1>

            <div className="max-w-6xl mx-auto space-y-6">
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
                                    <DropdownMenuItem>Update Status</DropdownMenuItem>
                                    <DropdownMenuItem>Mark as Delivered</DropdownMenuItem>
                                    <DropdownMenuItem>Print Delivery Notes</DropdownMenuItem>
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
                                    <TableCell>{order.customer.name}</TableCell>
                                    <TableCell>
                                        {`${order.customer.addressInfo.street}, ${order.customer.addressInfo.city}, ${order.customer.addressInfo.country} - ${order.customer.addressInfo.postcode}`}
                                    </TableCell>
                                    <TableCell>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                                    <TableCell>{order.status}</TableCell>
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
                                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                                <DropdownMenuItem>View on Map</DropdownMenuItem>
                                                <DropdownMenuItem>Mark as Delivered</DropdownMenuItem>
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

            {orderDetailsModal && selectedOrder && (
                <OrderDetailsModal
                    orderId={selectedOrder.id}
                    setOpen={setOrderDetailsModal}
                    open={orderDetailsModal}
                    customer={true}
                />
            )}
        </div>
    );
};

AssignedOrders.layout = (page: any) => <AdminLayout children={page} />;

export default AssignedOrders;