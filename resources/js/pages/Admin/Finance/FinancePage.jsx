import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
    AreaChart,
    Area,
    TooltipProps,
    LineProps,
    BarProps,
    PieProps
} from 'recharts';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    ShoppingCart,
    CreditCard,
    TrendingUp,
    Users,
    Package,
    RefreshCcw,
    Percent,
    TrendingDown,
    AlertTriangle,
    Target,
    Activity,
    LucideIcon
} from 'lucide-react';

type TransactionStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
    readonly id: number;
    readonly date: string;
    readonly type: string;
    readonly amount: number;
    readonly status: TransactionStatus;
    readonly customer: string;
}

interface FinancialMetric {
    readonly label: string;
    readonly value: number;
    readonly change: number;
    readonly icon: React.ReactNode;
}

interface CategoryRevenue {
    readonly name: string;
    readonly value: number;
    readonly color: string;
}

interface PaymentMethod {
    readonly method: string;
    readonly count: number;
    readonly amount: number;
}

interface CustomerSegmentation {
    readonly newCustomers: number;
    readonly returning: number;
    readonly churnRisk: number;
}

interface SeasonalTrend {
    readonly period: string;
    readonly growth: number;
    readonly forecast: number;
}

interface AdvancedMetrics {
    readonly customerSegmentation: CustomerSegmentation;
    readonly seasonalTrends: ReadonlyArray<SeasonalTrend>;
}

interface DeadStock {
    readonly value: number;
    readonly items: number;
}

interface InventoryMetrics {
    readonly stockValue: number;
    readonly holdingCosts: number;
    readonly turnoverRate: number;
    readonly deadStock: DeadStock;
}

interface ChannelPerformance {
    readonly channel: string;
    readonly spend: number;
    readonly revenue: number;
    readonly roi: number;
}

interface CampaignEffectiveness {
    readonly campaign: string;
    readonly conversion: number;
    readonly costPerAcquisition: number;
}

interface MarketingMetrics {
    readonly channelPerformance: ReadonlyArray<ChannelPerformance>;
    readonly campaignEffectiveness: ReadonlyArray<CampaignEffectiveness>;
}

interface CashFlowMetrics {
    readonly projectedIncome: ReadonlyArray<number>;
    readonly expectedExpenses: ReadonlyArray<number>;
    readonly runwayDays: number;
    readonly seasonalityAdjustment: number;
}

interface RevenueData {
    readonly date: string;
    readonly revenue: number;
}

const COLORS: ReadonlyArray<string> = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'] as const;

const FinancePage: React.FC = (): JSX.Element => {
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [revenueData, setRevenueData] = useState<ReadonlyArray<RevenueData>>([]);
    const [transactions, setTransactions] = useState<ReadonlyArray<Transaction>>([]);
    const [metrics, setMetrics] = useState<ReadonlyArray<FinancialMetric>>([]);
    const [categoryRevenue, setCategoryRevenue] = useState<ReadonlyArray<CategoryRevenue>>([]);
    const [paymentMethods, setPaymentMethods] = useState<ReadonlyArray<PaymentMethod>>([]);
    const [expandedMetrics, setExpandedMetrics] = useState<ReadonlyArray<FinancialMetric>>([]);
    const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics | null>(null);
    const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics | null>(null);
    const [marketingMetrics, setMarketingMetrics] = useState<MarketingMetrics | null>(null);
    const [cashFlowMetrics, setCashFlowMetrics] = useState<CashFlowMetrics | null>(null);

    useEffect(() => {
        // Simulated data - replace with actual API calls
        const mockRevenueData: ReadonlyArray<RevenueData> = [
            { date: '2024-01', revenue: 45000 },
            { date: '2024-02', revenue: 52000 },
            { date: '2024-03', revenue: 49000 },
            { date: '2024-04', revenue: 58000 },
            { date: '2024-05', revenue: 63000 },
            { date: '2024-06', revenue: 68000 },
        ];

        const mockTransactions: ReadonlyArray<Transaction> = [
            {
                id: 1,
                date: '2024-06-15',
                type: 'Sale',
                amount: 299.99,
                status: 'completed',
                customer: 'John Doe'
            },
            {
                id: 2,
                date: '2024-06-14',
                type: 'Refund',
                amount: -89.99,
                status: 'completed',
                customer: 'Jane Smith'
            },
            // Add more mock transactions
        ];

        const mockMetrics: ReadonlyArray<FinancialMetric> = [
            {
                label: 'Total Revenue',
                value: 68000,
                change: 12.5,
                icon: <DollarSign className="h-6 w-6" />
            },
            {
                label: 'Orders',
                value: 245,
                change: 8.2,
                icon: <ShoppingCart className="h-6 w-6" />
            },
            {
                label: 'Average Order Value',
                value: 277.55,
                change: 3.8,
                icon: <CreditCard className="h-6 w-6" />
            },
            {
                label: 'Conversion Rate',
                value: 3.2,
                change: -1.5,
                icon: <TrendingUp className="h-6 w-6" />
            }
        ];

        const mockCategoryRevenue: ReadonlyArray<CategoryRevenue> = [
            { name: 'Electronics', value: 25000, color: COLORS[0] },
            { name: 'Clothing', value: 18000, color: COLORS[1] },
            { name: 'Food', value: 12000, color: COLORS[2] },
            { name: 'Books', value: 8000, color: COLORS[3] },
            { name: 'Others', value: 5000, color: COLORS[4] }
        ];

        const mockPaymentMethods: ReadonlyArray<PaymentMethod> = [
            { method: 'Credit Card', count: 150, amount: 42000 },
            { method: 'PayPal', count: 80, amount: 20000 },
            { method: 'Bank Transfer', count: 15, amount: 6000 }
        ];

        const mockExpandedMetrics: ReadonlyArray<FinancialMetric> = [
            ...mockMetrics,
            {
                label: 'Customer Lifetime Value',
                value: 850.75,
                change: 5.2,
                icon: <Users className="h-6 w-6" />
            },
            {
                label: 'Product Return Rate',
                value: 2.8,
                change: -0.5,
                icon: <RefreshCcw className="h-6 w-6" />
            },
            {
                label: 'Average Items per Order',
                value: 3.2,
                change: 0.8,
                icon: <Package className="h-6 w-6" />
            },
            {
                label: 'Profit Margin',
                value: 32.5,
                change: 2.1,
                icon: <Percent className="h-6 w-6" />
            }
        ];

        // Mock advanced analytics data
        const mockAdvancedMetrics: AdvancedMetrics = {
            customerSegmentation: {
                newCustomers: 245,
                returning: 1890,
                churnRisk: 67
            },
            seasonalTrends: [
                { period: 'Q1', growth: 12.5, forecast: 15.0 },
                { period: 'Q2', growth: 8.2, forecast: 10.0 },
                { period: 'Q3', growth: 15.7, forecast: 18.0 },
                { period: 'Q4', growth: 20.1, forecast: 22.0 }
            ]
        };

        // Mock inventory metrics
        const mockInventoryMetrics: InventoryMetrics = {
            stockValue: 450000,
            holdingCosts: 45000,
            turnoverRate: 4.2,
            deadStock: {
                value: 12000,
                items: 45
            }
        };

        // Mock marketing metrics
        const mockMarketingMetrics: MarketingMetrics = {
            channelPerformance: [
                { channel: 'Social', spend: 12000, revenue: 45000, roi: 275 },
                { channel: 'Email', spend: 5000, revenue: 25000, roi: 400 },
                { channel: 'Search', spend: 15000, revenue: 52000, roi: 246 }
            ],
            campaignEffectiveness: [
                { campaign: 'Summer Sale', conversion: 3.2, costPerAcquisition: 25 },
                { campaign: 'New Launch', conversion: 4.5, costPerAcquisition: 30 },
                { campaign: 'Holiday', conversion: 5.1, costPerAcquisition: 28 }
            ]
        };

        // Mock cash flow metrics
        const mockCashFlowMetrics: CashFlowMetrics = {
            projectedIncome: [75000, 82000, 88000, 95000],
            expectedExpenses: [62000, 65000, 68000, 72000],
            runwayDays: 180,
            seasonalityAdjustment: 1.15
        };

        setRevenueData(mockRevenueData);
        setTransactions(mockTransactions);
        setMetrics(mockMetrics);
        setCategoryRevenue(mockCategoryRevenue);
        setPaymentMethods(mockPaymentMethods);
        setExpandedMetrics(mockExpandedMetrics);
        setAdvancedMetrics(mockAdvancedMetrics);
        setInventoryMetrics(mockInventoryMetrics);
        setMarketingMetrics(mockMarketingMetrics);
        setCashFlowMetrics(mockCashFlowMetrics);
    }, []);

    const renderMetricIcon = (icon: React.ReactNode, index: number): JSX.Element => (
        <div className="p-2 bg-gray-100 rounded-lg">
            <div data-testid={`metric-icon-${index}`}>
                {icon}
            </div>
        </div>
    );

    const renderMetricChange = (change: number, index: number): JSX.Element => (
        <div className="flex items-center mt-2">
            {change > 0 ? (
                <ArrowUpRight
                    className="h-4 w-4 text-green-500"
                    data-testid={`icon-up-${index}`}
                />
            ) : (
                <ArrowDownRight
                    className="h-4 w-4 text-red-500"
                    data-testid={`icon-down-${index}`}
                />
            )}
            <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
    );

    const formatMetricValue = (metric: FinancialMetric): string => {
        if (metric.label.includes('Rate') || metric.label.includes('Margin')) {
            return `${metric.value}%`;
        }
        if (metric.label.includes('Revenue') || metric.label.includes('Value')) {
            return `$${metric.value.toLocaleString()}`;
        }
        return metric.value.toLocaleString();
    };

    const renderTransactionStatus = (status: TransactionStatus): JSX.Element => {
        const statusClasses = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Financial Overview</h1>
                <div className="flex gap-4">
                    <DateRangePicker
                        value={dateRange}
                        onChange={setDateRange}
                    />
                    <Button>Export Report</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-grid">
                {metrics.map((metric, index) => (
                    <Card key={metric.label}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">{metric.label}</p>
                                <h3 className="text-2xl font-bold mt-1">
                                    {formatMetricValue(metric)}
                                </h3>
                                {renderMetricChange(metric.change, index)}
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                {renderMetricIcon(metric.icon, index)}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData as any[]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Revenue by Category</h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryRevenue as any[]}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {categoryRevenue.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentMethods as any[]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="method" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#8884d8" name="Amount" />
                                    <Bar dataKey="count" fill="#82ca9d" name="Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{transaction.date}</TableCell>
                                        <TableCell>{transaction.type}</TableCell>
                                        <TableCell>{transaction.customer}</TableCell>
                                        <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            {renderTransactionStatus(transaction.status)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="p-6" data-testid="customer-analytics" aria-label="Customer Analytics Section">
                        <h2 className="text-lg font-semibold mb-4">Customer Analytics</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">New Customers</p>
                                <p className="text-xl font-bold" data-testid="new-customers-value">
                                    {advancedMetrics?.customerSegmentation.newCustomers}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Returning Customers</p>
                                <p className="text-xl font-bold" data-testid="returning-customers-value">
                                    {advancedMetrics?.customerSegmentation.returning}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Churn Risk</p>
                                <p className="text-xl font-bold text-red-500" data-testid="churn-risk-value">
                                    {advancedMetrics?.customerSegmentation.churnRisk}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6" data-testid="inventory-analytics">
                        <h2 className="text-lg font-semibold mb-4">Inventory Analytics</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Stock Value</p>
                                <p className="text-xl font-bold" data-testid="stock-value">
                                    ${inventoryMetrics?.stockValue.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Holding Costs</p>
                                <p className="text-xl font-bold" data-testid="holding-costs">
                                    ${inventoryMetrics?.holdingCosts.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Turnover Rate</p>
                                <p className="text-xl font-bold" data-testid="turnover-rate">
                                    {inventoryMetrics?.turnoverRate}x
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Dead Stock</p>
                                <p className="text-xl font-bold" data-testid="dead-stock-value">
                                    ${inventoryMetrics?.deadStock.value.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500" data-testid="dead-stock-items">
                                    {inventoryMetrics?.deadStock.items} items
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div data-testid="marketing-analytics">
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Marketing Performance</h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={marketingMetrics?.channelPerformance as any[]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="channel" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="spend" fill="#8884d8" name="Spend" />
                                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default FinancePage; 