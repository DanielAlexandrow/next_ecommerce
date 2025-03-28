import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import Layout from '@/Layouts/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import axios from 'axios';
import { debounce } from 'lodash';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  order_id?: number; // Supporting both formats
  name: string;
  item_count: number;
  total: number;
  status: string;
  created_at: string;
  driver_id: number | null;
  items?: OrderItem[];
}
export interface Props {
  orders: {
    data: Order[];
    links?: any[];
    current_page?: number;
  };
  sortkey: string;
  sortdirection: string;
  search: string;
}

// Define possible badge variants
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

export default function OrdersPage({ orders, sortkey, sortdirection, search }: Props) {
  // State for order details modal
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState<string>(search);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // State for order status update
  const [newStatus, setNewStatus] = useState<string>('');

  // Handle view order details
  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsDetailsOpen(true);
    
    try {
      // Fetch order items
      const response = await axios.get(`/orders/getitems/${order.id || order.order_id}`);
      console.log('Order items:', response.data);
      if (response.data?.items) {
        setOrderItems(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  // Handle search
  const handleSearch = debounce((value: string) => {
    router.visit(window.location.pathname, {
      data: {
        search: value,
        sortkey,
        sortdirection,
        status: statusFilter !== 'all' ? statusFilter : undefined
      },
      preserveState: true,
      replace: true
    });
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    router.visit(window.location.pathname, {
      data: {
        search: searchTerm,
        sortkey,
        sortdirection,
        status: value !== 'all' ? value : undefined
      },
      preserveState: true,
      replace: true
    });
  };

  // Handle sorting
  const handleSort = (column: string) => {
    const newDirection = column === sortkey ? (sortdirection === 'asc' ? 'desc' : 'asc') : 'asc';
    router.visit(window.location.pathname, {
      data: {
        sortkey: column,
        sortdirection: newDirection,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      },
      preserveState: true,
      replace: true
    });
  };

  // Handle status update
  const handleUpdateStatus = () => {
    if (selectedOrder && newStatus) {
      router.put(
        `/orders/${selectedOrder.id || selectedOrder.order_id}/status`,
        { status: newStatus },
        { preserveState: true }
      );
      setIsDetailsOpen(false);
    }
  };

  // Generate invoice
  const handleGenerateInvoice = () => {
    if (selectedOrder) {
      const orderId = selectedOrder.id || selectedOrder.order_id;
      window.open(`/orders/generatepdf/${orderId}`, '_blank');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to determine badge variant based on status
  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default'; // Using default instead of success if not available
      case 'pending':
        return 'secondary'; 
      case 'processing':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Custom sortable header component to replace SortableHeader
  const renderSortableHeader = (label: string, columnKey: string) => {
    return (
      <TableCell 
        className="cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => handleSort(columnKey)}
        data-testid={`sort-header-${columnKey}`}
      >
        <div className="flex items-center">
          {label}
          <span className="ml-1" data-testid={`sort-icon-${columnKey}`}>
            {sortkey === columnKey && (sortdirection === 'asc' ? '▲' : '▼')}
          </span>
        </div>
      </TableCell>
    );
  };

  return (
    <Layout>
      <Head title="Orders" />
      <div className="container mx-auto px-4 py-8" data-testid="orders-page">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        
        {/* Filters and search */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1">
            <Input 
              placeholder="Search orders..." 
              value={searchTerm} 
              onChange={handleSearchChange}
              className="w-full"
              data-testid="search-input"
            />
          </div>
          <div>
            <Button onClick={() => handleSearch(searchTerm)} data-testid="search-button">Search</Button>
          </div>
          <div>
            <label htmlFor="status-filter" className="sr-only" aria-hidden="true">Status filter</label>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger id="status-filter" className="w-[180px]" data-testid="status-filter">
                <SelectValue placeholder="Filter by status" aria-label="Filter orders by status" />
              </SelectTrigger>
              <SelectContent data-testid="status-filter-options">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Orders table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Table data-testid="orders-table">
            <TableHeader>
              <TableRow>
                {renderSortableHeader("Order ID", "orders.id")}
                {renderSortableHeader("Customer", "name")}
                <TableCell>Items</TableCell>
                {renderSortableHeader("Total", "total")}
                {renderSortableHeader("Status", "status")}
                {renderSortableHeader("Date", "orders.created_at")}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.map((order) => (
                <TableRow key={order.id || order.order_id} data-testid={`order-row-${order.id || order.order_id}`}>
                  <TableCell className="font-medium" data-testid={`order-id-${order.id || order.order_id}`}>
                    #{order.id || order.order_id}
                  </TableCell>
                  <TableCell data-testid={`order-customer-${order.id || order.order_id}`}>{order.name}</TableCell>
                  <TableCell data-testid={`order-items-${order.id || order.order_id}`}>{order.item_count}</TableCell>
                  <TableCell data-testid={`order-total-${order.id || order.order_id}`}>{formatCurrency(order.total)}</TableCell>
                  <TableCell data-testid={`order-status-${order.id || order.order_id}`}>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell data-testid={`order-date-${order.id || order.order_id}`}>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewOrder(order)}
                      data-testid={`view-order-${order.id || order.order_id}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Order details modal */}
        {selectedOrder && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-3xl" data-testid="order-details-modal">
              <DialogHeader>
                <DialogTitle data-testid="order-details-title">Order Details #{selectedOrder.order_id || selectedOrder.id}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold">Customer</h3>
                  <p data-testid="modal-customer-name">{selectedOrder.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Order Date</h3>
                  <p data-testid="modal-order-date">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status" className="w-full" aria-label="status" data-testid="status-select-trigger">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent data-testid="status-select-options">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h3 className="font-semibold">Total</h3>
                  <p data-testid="order-total-header">{formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>
              
              <h3 className="font-semibold mb-2">Order Items</h3>
              <Table data-testid="order-items-table">
                <TableHeader>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Subtotal</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index} data-testid={`order-item-${index}`}>
                      <TableCell data-testid={`item-name-${index}`}>{item.name}</TableCell>
                      <TableCell data-testid={`item-quantity-${index}`}>{item.quantity}</TableCell>
                      <TableCell data-testid={`item-price-${index}`}>{formatCurrency(item.price)}</TableCell>
                      <TableCell data-testid={`item-subtotal-${index}`}>{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Total row */}
              <div className="mt-4 text-right">
                <span className="font-semibold" data-testid="order-total-label">Total: </span>
                <span data-testid="order-total-value">{selectedOrder && formatCurrency(selectedOrder.total)}</span>
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={handleGenerateInvoice} data-testid="generate-invoice-btn">
                  Generate Invoice
                </Button>
                <Button onClick={handleUpdateStatus} data-testid="update-status-btn">
                  Update Status
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
