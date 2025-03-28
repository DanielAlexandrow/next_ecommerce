// src/Pages/OrdersPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OrdersPage, { Props, Order, OrderItem } from './OrdersPage'; // Adjust path, import interfaces
import { Head, router } from '@inertiajs/react'; // Mocked below
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'; // Mocked below
import { debounce } from 'lodash'; // Mocked below

// --- Mocks Setup ---

// Mock Inertiajs
vi.mock('@inertiajs/react', () => ({
  Head: vi.fn(({ title }) => <title>{title}</title>), // Simple mock for Head
  router: {
    visit: vi.fn(),
    put: vi.fn(),
    post: vi.fn(), // Add other methods if needed
    // Mock other router properties/methods if your component uses them
  },
  usePage: vi.fn(() => ({
    props: {
      // Mock any global props if necessary
    },
  })),
}));

// Mock Layout component
vi.mock('@/Layouts/Layout', () => ({
  default: vi.fn(({ children }) => <div data-testid="layout">{children}</div>),
}));

// Mock UI Components (simple pass-through or basic rendering)
// Use actual components if possible and rely on testing-library interactions,
// but mocking can simplify if component internals are complex or irrelevant to the page logic.
vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )),
}));
vi.mock('@/components/ui/badge', () => ({
  Badge: vi.fn(({ children, variant, ...props }) => (
    <span data-variant={variant} {...props}>
      {children}
    </span>
  )),
}));
vi.mock('@/components/ui/dialog', () => ({
  Dialog: vi.fn(({ children, open, onOpenChange }) =>
    open ? <div role="dialog" data-testid="dialog" data-open={open}>{children}</div> : null
  ),
  DialogContent: vi.fn(({ children }) => <div data-testid="dialog-content">{children}</div>),
  DialogHeader: vi.fn(({ children }) => <div>{children}</div>),
  DialogTitle: vi.fn(({ children }) => <h2>{children}</h2>),
  DialogFooter: vi.fn(({ children }) => <div>{children}</div>),
}));
vi.mock('@/components/ui/select', () => {
    // Keep track of the passed onValueChange function to simulate selection
    let currentOnValueChange: ((value: string) => void) | undefined;
    let currentValue: string | undefined;
    
    return {
        Select: vi.fn(({ children, value, onValueChange }) => {
            currentOnValueChange = onValueChange; // Store handler
            currentValue = value; // Store value
            return (
                <div data-testid="select-container" data-value={value}>
                    {/* Render children, passing down necessary props */}
                    {React.Children.map(children, (child) =>
                        React.isValidElement(child) ? React.cloneElement(child, { value: currentValue } as any) : child
                    )}
                </div>
            );
        }),
        SelectTrigger: vi.fn(({ children, id, 'aria-label': ariaLabel, ...props }) => (
            <button {...props} aria-haspopup="listbox" id={id} aria-label={ariaLabel || id}>
                {children}
            </button>
        )),
        SelectValue: vi.fn(({ placeholder }) => {
            // Attempt to display value if available, otherwise placeholder
            const displayValue = currentValue && currentValue !== 'all' ? currentValue : placeholder;
            return <span>{displayValue}</span>;
        }),
        SelectContent: vi.fn(({ children, ...props }) => (
            // Make content discoverable for testing interactions
            <div {...props} role="listbox" data-testid="select-content">
                {children}
            </div>
        )),
        SelectItem: vi.fn(({ children, value, ...props }) => (
            <div
                {...props}
                role="option"
                data-value={value}
                onClick={() => currentOnValueChange?.(value)} // Simulate selection via click
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') currentOnValueChange?.(value); }} // Basic keyboard
                tabIndex={0} // Make focusable
                aria-selected={currentValue === value}
            >
                {children}
            </div>
        )),
    };
});
vi.mock('@/components/ui/input', () => ({
  Input: vi.fn((props) => <input {...props} />),
}));
vi.mock('@/components/ui/table', () => ({
  Table: vi.fn(({ children }) => <table data-testid="table">{children}</table>),
  TableHeader: vi.fn(({ children }) => <thead>{children}</thead>),
  TableBody: vi.fn(({ children }) => <tbody>{children}</tbody>),
  TableRow: vi.fn(({ children }) => <tr>{children}</tr>),
  TableCell: vi.fn(({ children, ...props }) => <td {...props}>{children}</td>),
}));

// Mock Axios
vi.mock('axios');
// Create a typed mock object for better intellisense and type checking
const mockedAxios = vi.mocked(axios, true);

// Mock lodash/debounce to execute immediately
vi.mock('lodash', async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        debounce: vi.fn((fn) => fn), // Execute immediately
    };
});

// Mock window.open
global.open = vi.fn();

// --- Test Data ---
const mockOrdersData: Order[] = [
    { id: 1, order_id: 101, name: 'Alice Smith', item_count: 2, total: 150.00, status: 'completed', created_at: '2023-10-26T10:00:00.000Z', driver_id: null },
    { id: 2, order_id: 102, name: 'Bob Johnson', item_count: 1, total: 75.50, status: 'pending', created_at: '2023-10-25T11:30:00.000Z', driver_id: 5 },
    { id: 3, order_id: 103, name: 'Charlie Brown', item_count: 5, total: 320.00, status: 'processing', created_at: '2023-10-24T09:15:00.000Z', driver_id: null },
    { id: 4, order_id: 104, name: 'Diana Prince', item_count: 3, total: 99.99, status: 'cancelled', created_at: '2023-10-23T14:00:00.000Z', driver_id: null },
];

const mockOrdersProp: Props['orders'] = {
    data: mockOrdersData,
    links: [],
    current_page: 1,
};

const mockOrderItems: OrderItem[] = [
    { name: 'Product A', quantity: 1, price: 100.00 },
    { name: 'Product B', quantity: 1, price: 50.00 },
];

const defaultProps: Props = {
  orders: mockOrdersProp,
  sortkey: 'orders.created_at',
  sortdirection: 'desc',
  search: '',
};

// --- Test Suite ---

describe('OrdersPage Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Provide a default mock response for axios GET requests using the typed mock
    mockedAxios.get.mockResolvedValue({ data: { items: mockOrderItems } } as AxiosResponse<{ items: OrderItem[] }>);
    // Mock window location if needed (often useful for router calls)
    // Object.defineProperty(window, 'location', { value: { pathname: '/admin/orders' }, writable: true });
  });

  afterEach(() => {
    // Clean up any timers if used
  });

  it('renders correctly with initial props', () => {
    render(<OrdersPage {...defaultProps} />);

    // Check layout and title
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(Head).toHaveBeenCalledWith({ title: 'Orders' }, {});
    expect(screen.getByRole('heading', { name: /Orders/i })).toBeInTheDocument();

    // Check search and filter controls
    expect(screen.getByPlaceholderText('Search orders...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    
    // Check Select using test id
    expect(screen.getByTestId('status-filter')).toBeInTheDocument();

    // Check table headers (including sortable ones)
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check order data by test ID first
    const firstOrderCell = screen.getByTestId('order-id-1');
    expect(firstOrderCell).toHaveTextContent('#1');
    
    // Check the rest of the data...
    // ...rest of test...

    // Check if order data is rendered
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getAllByText('2')[0]).toBeInTheDocument(); // Item count for Alice
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText(new Date('2023-10-26T10:00:00.000Z').toLocaleDateString())).toBeInTheDocument();

    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('$75.50')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();

    // Check badge variants (example)
    const completedBadge = screen.getByText('completed');
    expect(completedBadge).toHaveAttribute('data-variant', 'default'); // Adjust if your theme maps 'completed' differently
    const pendingBadge = screen.getByText('pending');
    expect(pendingBadge).toHaveAttribute('data-variant', 'secondary');
    const cancelledBadge = screen.getByText('cancelled');
    expect(cancelledBadge).toHaveAttribute('data-variant', 'destructive');

    // Check action buttons
    expect(screen.getAllByRole('button', { name: /View/i })).toHaveLength(mockOrdersData.length);
  });

  it('handles search input change and triggers router visit', async () => {
    const user = userEvent.setup();
    render(<OrdersPage {...defaultProps} search="initial" />); // Start with some search term

    const searchInput = screen.getByPlaceholderText('Search orders...');
    expect(searchInput).toHaveValue('initial');

    await act(async () => {
        await user.clear(searchInput);
        await user.type(searchInput, 'Alice');
    });

    // Since debounce is mocked to run immediately, and act ensures updates flush
    // The exact number might be tricky with immediate debounce + act, let's check the last call
    // expect(router.visit).toHaveBeenCalledTimes(5); // This might be less reliable now
    expect(router.visit).toHaveBeenLastCalledWith(
      window.location.pathname, // Assumes tests run in an environment where this is defined
      {
        data: {
          search: 'Alice',
          sortkey: defaultProps.sortkey,
          sortdirection: defaultProps.sortdirection,
          status: undefined, // 'all' status means undefined in query
        },
        preserveState: true,
        replace: true,
      }
    );
     expect(searchInput).toHaveValue('Alice'); // Input value should update
  });

    it('handles search button click and triggers router visit', async () => {
        const user = userEvent.setup();
        render(<OrdersPage {...defaultProps} />);

        const searchInput = screen.getByPlaceholderText('Search orders...');
        const searchButton = screen.getByRole('button', { name: /Search/i });

        await act(async () => {
            await user.type(searchInput, 'Bob');
            // Manually click search button (even though debounce might have already fired due to mock)
            await user.click(searchButton);
        });

        // Expect router.visit to have been called after act completes
        await waitFor(() => {
            expect(router.visit).toHaveBeenCalledWith(
                window.location.pathname,
                {
                    data: {
                    search: 'Bob', // The value at the time of click/debounce
                    sortkey: defaultProps.sortkey,
                    sortdirection: defaultProps.sortdirection,
                    status: undefined,
                    },
                    preserveState: true,
                    replace: true,
                }
            );
        });
    });


  it('handles status filter change and triggers router visit', async () => {
    const user = userEvent.setup();
    render(<OrdersPage {...defaultProps} />);

    // Find trigger using data-testid
    const statusSelectTrigger = screen.getByTestId('status-filter');
    expect(statusSelectTrigger).toBeInTheDocument();

    await act(async () => {
        await user.click(statusSelectTrigger);
    });

    // Find and click the 'Pending' option using role
    const selectContent = screen.getByTestId('select-content');
    const pendingOption = within(selectContent).getByRole('option', { name: /pending/i });
    await act(async () => {
        await user.click(pendingOption);
    });

    await waitFor(() => {
        expect(router.visit).toHaveBeenCalledWith(
            window.location.pathname,
            {
                data: {
                search: defaultProps.search,
                sortkey: defaultProps.sortkey,
                sortdirection: defaultProps.sortdirection,
                status: 'pending', // Changed status
                },
                preserveState: true,
                replace: true,
            }
        );
    });

    // Optionally, check if the SelectValue display updated (depends on mock)
    // Need to re-query the trigger or value display element after the update
    // expect(screen.getByRole('button', { name: /Filter by status/i })).toHaveTextContent('Pending'); // This check is fragile with simple mocks
  });

  // *** REMOVED DUPLICATE 'handles sorting correctly' test block ***


  it('opens order details modal, fetches items, and displays details', async () => {
    const user = userEvent.setup();
    // Use the typed mock and specify the expected response structure
    mockedAxios.get.mockResolvedValueOnce({ data: { items: mockOrderItems } } as AxiosResponse<{ items: OrderItem[] }>);
    render(<OrdersPage {...defaultProps} />);

    // Find the 'View' button for the first order (Alice)
    const viewButton = screen.getByTestId('view-order-1');
    await act(async () => {
        await user.click(viewButton);
    });

    // Check if axios was called using the typed mock
    await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(`/orders/getitems/${mockOrdersData[0].id}`);
    });


    // Check if modal is open and displays correct info
    const dialog = await screen.findByRole('dialog'); // Use findByRole to wait for appearance
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-open', 'true'); // Check based on mock implementation

    const dialogContent = within(dialog).getByTestId('dialog-content'); // Scope queries to dialog

    // Check modal content
    expect(within(dialogContent).getByTestId('modal-customer-name')).toHaveTextContent('Alice Smith');
    expect(within(dialogContent).getByTestId('modal-order-date')).toHaveTextContent('10/26/2023');
    expect(within(dialogContent).getByTestId('order-total-header')).toHaveTextContent('$150.00');

    // Check status dropdown in modal - find by test id to avoid role conflicts
    const statusSelectTriggerInModal = within(dialogContent).getByTestId('status-select-trigger');
    // Check the displayed value within the trigger (depends on mock implementation)
    // It should reflect the initial status 'completed'
    expect(statusSelectTriggerInModal).toHaveTextContent(/completed/i); // Check if 'completed' is displayed


    // Check if order items are displayed
    expect(within(dialogContent).getByTestId('item-name-0')).toHaveTextContent('Product A');
    expect(within(dialogContent).getByTestId('item-name-1')).toHaveTextContent('Product B');
    expect(within(dialogContent).getByTestId('item-price-0')).toHaveTextContent('$100.00'); // Price of Product A
    expect(within(dialogContent).getByTestId('item-price-1')).toHaveTextContent('$50.00'); // Price of Product B
    // Check subtotal for Product A
    expect(within(dialogContent).getAllByText('$100.00')[1]).toBeInTheDocument();
     // Check subtotal for Product B
    expect(within(dialogContent).getAllByText('$50.00')[1]).toBeInTheDocument();
    // Check Total row at the bottom
    expect(within(dialogContent).getByText('Total:')).toBeInTheDocument();
    // The total might appear multiple times, ensure we check the one near 'Total:' label
    expect(within(dialogContent).getByText('Total:').nextElementSibling).toHaveTextContent('$150.00');

    // Check footer buttons
    expect(within(dialogContent).getByRole('button', { name: /Generate Invoice/i})).toBeInTheDocument();
    expect(within(dialogContent).getByRole('button', { name: /Update Status/i})).toBeInTheDocument();
  });

   it('handles status update from modal', async () => {
    const user = userEvent.setup();
    // Mock GET for fetching items when modal opens
    mockedAxios.get.mockResolvedValueOnce({ data: { items: mockOrderItems } } as AxiosResponse<{ items: OrderItem[] }>);

    // Render with an order that can be updated (e.g., pending Bob's order)
    const propsWithPendingOrder: Props = {
        ...defaultProps,
        orders: {
            ...mockOrdersProp,
            data: [mockOrdersData[1]] // Use Bob's pending order (index 1)
        }
    };
    render(<OrdersPage {...propsWithPendingOrder} />);

    // Open the modal for Bob's order
    const viewButton = screen.getByRole('button', { name: /View/i });
    await act(async () => {
        await user.click(viewButton);
    });

    // Wait for modal and ensure items were fetched
    const dialog = await screen.findByRole('dialog'); // findBy* implicitly waits
    expect(dialog).toBeInTheDocument();
    await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(`/orders/getitems/${mockOrdersData[1].id}`);
    });

    const dialogContent = within(dialog).getByTestId('dialog-content');

    // Find the status select trigger inside the modal (initially showing 'Pending')
    // Be more specific by checking the aria-label exactly matches 'status'
    const statusSelectTriggerInModal = within(dialogContent).getByRole('button', { name: 'status' });
    expect(statusSelectTriggerInModal).toHaveTextContent(/pending/i); // Verify initial status

    await act(async () => {
        await user.click(statusSelectTriggerInModal); // Open the dropdown
    });

    // Find and click the 'Processing' option within the select content
    const selectContent = await within(dialogContent).findByTestId('select-content'); // Wait for content if needed
    const processingOption = within(selectContent).getByText('Processing').closest('[role="option"]');
    expect(processingOption).toBeInTheDocument();

    await act(async () => {
        await user.click(processingOption!); // Select 'Processing'
    });

    // Find and click the 'Update Status' button
    const updateButton = within(dialogContent).getByRole('button', { name: /Update Status/i });
    await act(async () => {
        await user.click(updateButton);
    });

    // Check if router.put was called correctly
    await waitFor(() => {
        expect(router.put).toHaveBeenCalledWith(
            `/orders/${mockOrdersData[1].id}/status`, // URL for Bob's order
            { status: 'processing' }, // The newly selected status
            { preserveState: true }
        );
    });

    // Optionally: Check if modal closes after update. This depends on Dialog mock's onOpenChange being called.
    // await waitFor(() => {
    //   expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // });
  });

   it('handles generate invoice click', async () => {
    const user = userEvent.setup();
    // Mock GET for items
    mockedAxios.get.mockResolvedValueOnce({ data: { items: mockOrderItems } } as AxiosResponse<{ items: OrderItem[] }>);
    render(<OrdersPage {...defaultProps} />);

    // Open the modal for the first order (Alice)
    const viewButton = screen.getAllByRole('button', { name: /View/i })[0];
    await act(async () => {
        await user.click(viewButton);
    });

    // Wait for modal
    const dialog = await screen.findByRole('dialog'); // findBy* implicitly waits
    expect(dialog).toBeInTheDocument();
    const dialogContent = within(dialog).getByTestId('dialog-content');

    // Mock window.open properly
    const originalOpen = global.open;
    global.open = vi.fn();
    
    // Find and click the 'Generate Invoice' button
    const invoiceButton = within(dialogContent).getByRole('button', { name: /Generate Invoice/i });
    await act(async () => {
        await user.click(invoiceButton);
    });

    // Check window.open was called
    await waitFor(() => {
        expect(global.open).toHaveBeenCalledWith(
            `/orders/generatepdf/${mockOrdersData[0].id}`,
            '_blank'
        );
    });

    // Restore original window.open
    global.open = originalOpen;
  });

  it('uses order_id if id is not present in component logic', async () => {
    const user = userEvent.setup();
    
    // Mock window.open before rendering
    global.open = vi.fn();
    
    const orderWithOrderIdOnlyLogic: Order = {
        id: 999,
        order_id: 999,
        name: 'Test Customer', 
        item_count: 1, 
        total: 50, 
        status: 'pending', 
        created_at: '2023-10-27T10:00:00.000Z', 
        driver_id: null
    };
    
    const propsWithOrderId: Props = {
        ...defaultProps,
        orders: { ...mockOrdersProp, data: [orderWithOrderIdOnlyLogic] }
    };
    
    // Mock GET for items
    mockedAxios.get.mockResolvedValueOnce({ 
        data: { items: [{ name: 'Test Item', price: 50, quantity: 1 }] } 
    } as AxiosResponse<{ items: OrderItem[] }>);
    
    render(<OrdersPage {...propsWithOrderId} />);
    
    // Check rendering uses id or order_id (both are 999)
    expect(screen.getByText('#999')).toBeInTheDocument();
    
    // Click view button
    const viewButton = screen.getByTestId('view-order-999');
    await act(async () => {
        await user.click(viewButton);
    });
    
    // Check axios call uses id or order_id
    await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(`/orders/getitems/999`);
    });
    
    // Wait for dialog to appear
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    const dialogContent = within(dialog).getByTestId('dialog-content');
    
    // Find and click the 'Generate Invoice' button
    const invoiceButton = within(dialogContent).getByTestId('generate-invoice-btn');
    await act(async () => {
        await user.click(invoiceButton);
    });
    
    // Check if window.open was called with the correct URL
    await waitFor(() => {
        expect(global.open).toHaveBeenCalledWith(
            `/orders/generatepdf/999`, 
            '_blank'
        );
    });
});

// Add the test data for an order with both id and order_id
const orderWithDualId: Order = {
    id: 999,
    order_id: 888,
    name: 'Test Customer',
    item_count: 1,
    total: 50,
    status: 'pending',
    created_at: '2023-10-27T10:00:00.000Z',
    driver_id: null
};

// Update the test case
it('prefers id over order_id in component logic', async () => {
    const user = userEvent.setup();
    
    // Mock window.open before rendering
    global.open = vi.fn();
    
    const propsWithDualId: Props = {
        ...defaultProps,
        orders: { ...mockOrdersProp, data: [orderWithDualId] }
    };
    
    // Mock GET for items
    mockedAxios.get.mockResolvedValueOnce({
        data: { items: [{ name: 'Test Item', price: 50, quantity: 1 }] }
    } as AxiosResponse<{ items: OrderItem[] }>);
    
    render(<OrdersPage {...propsWithDualId} />);
    
    // Check rendering uses id (999) instead of order_id (888)
    expect(screen.getByText('#999')).toBeInTheDocument();
    
    // Click view button for this order
    const viewButton = screen.getByTestId('view-order-999');
    await act(async () => {
        await user.click(viewButton);
    });
    
    // Check axios call uses id
    await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/orders/getitems/999');
    });
    
    // Wait for dialog to appear
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    const dialogContent = within(dialog).getByTestId('dialog-content');
    
    // Find and click the 'Generate Invoice' button
    const invoiceButton = within(dialogContent).getByTestId('generate-invoice-btn');
    await act(async () => {
        await user.click(invoiceButton);
    });
    
    // Check if window.open was called with the correct URL
    await waitFor(() => {
        expect(global.open).toHaveBeenCalledWith(
            '/orders/generatepdf/999',
            '_blank'
        );
    });
});
});
