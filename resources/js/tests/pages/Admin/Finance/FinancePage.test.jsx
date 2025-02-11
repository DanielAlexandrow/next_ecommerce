import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FinancePage from '@/pages/Admin/Finance/FinancePage';

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', mockResizeObserver);

// Mock recharts components
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
    Line: () => <div data-testid="recharts-line">Line</div>,
    Bar: () => <div data-testid="recharts-bar">Bar</div>,
    Pie: () => <div data-testid="recharts-pie">Pie</div>,
    Area: () => <div data-testid="recharts-area">Area</div>,
    XAxis: () => <div data-testid="recharts-xaxis">XAxis</div>,
    YAxis: () => <div data-testid="recharts-yaxis">YAxis</div>,
    CartesianGrid: () => <div data-testid="recharts-grid">CartesianGrid</div>,
    Tooltip: () => <div data-testid="recharts-tooltip">Tooltip</div>,
    Legend: () => <div data-testid="recharts-legend">Legend</div>,
    Cell: () => <div data-testid="recharts-cell">Cell</div>,
}));

// Add DateRangePicker mock
vi.mock('@/components/ui/date-range-picker', () => ({
    DateRangePicker: ({ value, onChange }: any) => (
        <button
            data-testid="date-range-picker"
            onClick={() => onChange([new Date(), new Date()])}
        >
            Select Date Range
        </button>
    )
}));

describe('FinancePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders financial overview title', () => {
        render(<FinancePage />);
        expect(screen.getByText('Financial Overview')).toBeInTheDocument();
    });

    it('renders all financial metrics', () => {
        render(<FinancePage />);
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('Orders')).toBeInTheDocument();
        expect(screen.getByText('Average Order Value')).toBeInTheDocument();
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    });

    it('displays revenue trend chart', () => {
        render(<FinancePage />);
        expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('displays revenue by category chart', () => {
        render(<FinancePage />);
        expect(screen.getByText('Revenue by Category')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('displays payment methods chart', () => {
        render(<FinancePage />);
        expect(screen.getByText('Payment Methods')).toBeInTheDocument();
        expect(screen.getAllByTestId('bar-chart')[0]).toBeInTheDocument();
    });

    it('renders recent transactions table', () => {
        render(<FinancePage />);
        expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('formats currency values correctly', () => {
        render(<FinancePage />);
        const formattedRevenue = screen.getByText('$68,000');
        expect(formattedRevenue).toBeInTheDocument();
    });

    it('shows percentage changes with correct colors', () => {
        render(<FinancePage />);
        const positiveChange = screen.getByText('12.5%');
        expect(positiveChange.closest('span')).toHaveClass('text-green-500');
    });

    it('handles date range selection', async () => {
        render(<FinancePage />);
        const dateRangePicker = screen.getByTestId('date-range-picker');
        expect(dateRangePicker).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(dateRangePicker);
        });
    });

    it('renders export report button', () => {
        render(<FinancePage />);
        expect(screen.getByText('Export Report')).toBeInTheDocument();
    });

    it('displays correct transaction status badges', () => {
        render(<FinancePage />);
        const completedStatuses = screen.getAllByText('Completed');
        completedStatuses.forEach(status => {
            expect(status).toHaveClass('bg-green-100', 'text-green-800');
        });
    });

    it('shows correct metric icons', () => {
        render(<FinancePage />);
        const icon = screen.getByTestId('metric-icon-0');
        expect(icon).toBeInTheDocument();
    });

    it('maintains responsive layout classes', () => {
        render(<FinancePage />);
        const metricsGrid = screen.getByTestId('metrics-grid');
        expect(metricsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4', 'gap-4');
    });

    describe('Marketing ROI Section', () => {
        it('renders marketing analytics section', () => {
            render(<FinancePage />);
            const section = screen.getByTestId('marketing-analytics');
            expect(section).toBeInTheDocument();
        });

        it('displays channel performance chart', () => {
            render(<FinancePage />);
            expect(screen.getAllByTestId('bar-chart')[1]).toBeInTheDocument();
            expect(screen.getByText('Marketing Performance')).toBeInTheDocument();
        });
    });
}); 