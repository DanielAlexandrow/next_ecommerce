import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import OrdersPage from '@/pages/store/OrdersPage';
import { orderApi } from '@/api/orderApi';

// Mock the dependencies
jest.mock('@tanstack/react-query');
jest.mock('@/api/orderApi');
jest.mock('@/layouts/store-layout', () => ({
  StoreLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="store-layout">{children}</div>
}));

// Mock window.open
const mockWindowOpen = jest.fn();
window.open = mockWindowOpen;

describe('OrdersPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('displays loading state when fetching orders', () => {
    (useQuery as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      data: null
    });
    
    render(<OrdersPage />);
    expect(screen.getByText('Loading orders...')).toBeInTheDocument();
  });
  
  it('displays error state when fetching orders fails', () => {
    (useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error('Failed to fetch'),
      data: null
    });
    
    render(<OrdersPage />);
    expect(screen.getByText('Error loading orders')).toBeInTheDocument();
  });
  
  it('displays "No orders found" when orders array is empty', () => {
    (useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: []
    });
    
    render(<OrdersPage />);
    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });
  
  it('renders orders correctly when data is loaded', () => {
    const mockOrders = [
      {
        id: 1,
        created_at: '2025-03-02T10:00:00Z',
        status: 'pending',
        payment_status: 'pending',
        shipping_status: 'pending',
        items: [
          { quantity: 4, name: 'Designer T-Shirt', variant: 'Standard', price: 29.99 }
        ],
        total: 119.96
      }
    ];
    
    (useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockOrders
    });
    
    render(<OrdersPage />);
    
    expect(screen.getByText('Order #1')).toBeInTheDocument();
    expect(screen.getByText('March 2, 2025')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('4x Designer T-Shirt (Standard)')).toBeInTheDocument();
    expect(screen.getByText('$119.96')).toBeInTheDocument();
  });
  
  it('opens the PDF download in a new window when "Download Invoice" is clicked', async () => {
    const mockOrders = [
      {
        id: 1,
        created_at: '2025-03-02T10:00:00Z',
        status: 'pending',
        payment_status: 'pending',
        shipping_status: 'pending',
        items: [
          { quantity: 4, name: 'Designer T-Shirt', variant: 'Standard', price: 29.99 }
        ],
        total: 119.96
      }
    ];
    
    (useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockOrders
    });
    
    render(<OrdersPage />);
    
    const downloadButton = screen.getByText('Download Invoice');
    await userEvent.click(downloadButton);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/orders/generatepdf/1', '_blank');
  });
});
