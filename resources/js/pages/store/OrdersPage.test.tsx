import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrdersPage from './OrdersPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { orderApi } from '@/api/orderApi';

// Mock dependencies
vi.mock('@/api/orderApi', () => ({
  orderApi: {
    getUserOrders: vi.fn()
  }
}));

vi.mock('@/layouts/store-layout', () => ({
  StoreLayout: vi.fn(({ children }) => <div data-testid="store-layout">{children}</div>)
}));

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ))
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: vi.fn(({ children, className, ...props }) => (
    <span className={className} {...props}>{children}</span>
  ))
}));

vi.mock('@/components/ui/card', () => ({
  Card: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardContent: vi.fn(({ children }) => <div>{children}</div>),
  CardHeader: vi.fn(({ children }) => <div>{children}</div>),
  CardTitle: vi.fn(({ children, className }) => <div className={className}>{children}</div>)
}));

vi.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: vi.fn(({ children }) => <div data-testid="error-boundary">{children}</div>)
}));

// Sample mock data based on the Order type from types.d.ts
const mockOrders = [
  {
    id: 1,
    user_id: 1,
    guest_id: null,
    total: 150.00,
    status: 'completed',
    payment_status: 'paid',
    shipping_status: 'delivered',
    items: [
      { product_id: 1, subproduct_id: 1, quantity: 2, price: 50, name: 'Product A', variant: 'Large' },
      { product_id: 2, subproduct_id: 2, quantity: 1, price: 50, name: 'Product B', variant: 'Medium' }
    ],
    created_at: '2023-10-26T10:00:00.000Z',
    updated_at: '2023-10-26T12:00:00.000Z'
  },
  {
    id: 2,
    user_id: 1,
    guest_id: null,
    total: 75.50,
    status: 'pending',
    payment_status: 'pending',
    shipping_status: 'processing',
    items: [
      { product_id: 3, subproduct_id: 3, quantity: 1, price: 75.50, name: 'Product C', variant: 'Standard' }
    ],
    created_at: '2023-10-25T11:30:00.000Z',
    updated_at: '2023-10-25T11:45:00.000Z'
  }
];

// Mock window.open
const originalOpen = window.open;
const mockOpen = vi.fn();

describe('OrdersPage Component', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup QueryClient for testing
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0
        }
      }
    });
    // Mock window.open
    window.open = mockOpen;
    // Mock the API response
    vi.mocked(orderApi.getUserOrders).mockResolvedValue(mockOrders);
  });
  
  afterEach(() => {
    // Restore window.open
    window.open = originalOpen;
  });
  
  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('orders-loading')).toBeInTheDocument();
  });

  it('renders orders when data is loaded', async () => {
    renderComponent();
    
    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByTestId('orders-container')).toBeInTheDocument();
    });
    
    // Check page title
    expect(screen.getByText('Your Orders')).toBeInTheDocument();
    
    // Check if both order cards are rendered
    expect(screen.getByTestId(`order-card-${mockOrders[0].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`order-card-${mockOrders[1].id}`)).toBeInTheDocument();
    
    // Check order details for first order
    const order1 = screen.getByTestId(`order-card-${mockOrders[0].id}`);
    expect(within(order1).getByTestId(`order-id-${mockOrders[0].id}`)).toHaveTextContent(`Order #${mockOrders[0].id}`);
    expect(within(order1).getByTestId(`order-status-${mockOrders[0].id}`)).toHaveTextContent(mockOrders[0].status);
    expect(within(order1).getByTestId(`payment-status-${mockOrders[0].id}`)).toHaveTextContent(mockOrders[0].payment_status);
    expect(within(order1).getByTestId(`shipping-status-${mockOrders[0].id}`)).toHaveTextContent(mockOrders[0].shipping_status);
    expect(within(order1).getByTestId(`order-total-${mockOrders[0].id}`)).toHaveTextContent('$150.00');
    
    // Check order items for first order
    const orderItems1 = within(order1).getByTestId(`order-items-${mockOrders[0].id}`);
    expect(within(orderItems1).getByTestId(`order-item-${mockOrders[0].id}-0`)).toBeInTheDocument();
    expect(within(orderItems1).getByTestId(`item-name-${mockOrders[0].id}-0`)).toHaveTextContent('2x Product A (Large)');
    expect(within(orderItems1).getByTestId(`item-total-${mockOrders[0].id}-0`)).toHaveTextContent('$100.00');
  });

  it('renders empty state when no orders', async () => {
    // Override the mock to return empty array
    vi.mocked(orderApi.getUserOrders).mockResolvedValueOnce([]);
    
    renderComponent();
    
    // Wait for empty message to appear
    await waitFor(() => {
      expect(screen.getByTestId('orders-empty')).toBeInTheDocument();
    });
    
    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    // Override the mock to reject
    vi.mocked(orderApi.getUserOrders).mockRejectedValueOnce(new Error('API Error'));
    
    renderComponent();
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('orders-error')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Error loading orders')).toBeInTheDocument();
  });

  it('opens invoice in new tab when download button clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByTestId('orders-container')).toBeInTheDocument();
    });
    
    // Click download invoice button for first order
    const downloadButton = screen.getByTestId(`download-invoice-${mockOrders[0].id}`);
    await user.click(downloadButton);
    
    // Check if window.open was called with correct URL
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining(`/orders/generatepdf/${mockOrders[0].id}`),
      '_blank'
    );
  });
});