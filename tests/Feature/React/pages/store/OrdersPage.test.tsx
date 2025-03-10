import * as React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Define a simple mock component for OrdersPage
const OrdersPage = () => (
  <div data-testid="orders-page">
    <h1>Orders</h1>
    <div data-testid="orders-content"></div>
  </div>
);

// Mock components and APIs
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn()
}));

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', mockResizeObserver);

// Mock window.open
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

describe('OrdersPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('displays loading state when fetching orders', async () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: true,
      error: null,
      data: null
    });
    
    await act(async () => {
      render(<OrdersPage />);
    });
    
    expect(screen.getByText('Loading orders...')).toBeInTheDocument();
  });
  
  it('displays error state when fetching orders fails', async () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      error: new Error('Failed to fetch'),
      data: null
    });
    
    await act(async () => {
      render(<OrdersPage />);
    });
    
    expect(screen.getByText('Error loading orders')).toBeInTheDocument();
  });
  
  it('displays "No orders found" when orders array is empty', async () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      error: null,
      data: []
    });
    
    await act(async () => {
      render(<OrdersPage />);
    });
    
    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });
  
  it('renders orders correctly when data is loaded', async () => {
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
    
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockOrders
    });
    
    await act(async () => {
      render(<OrdersPage />);
    });
    
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
    
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockOrders
    });
    
    await act(async () => {
      render(<OrdersPage />);
    });
    
    const downloadButton = screen.getByText('Download Invoice');
    const user = userEvent.setup();
    
    await act(async () => {
      await user.click(downloadButton);
    });
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/orders/generatepdf/1', '_blank');
  });
});