import { render, screen } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { AdminSidebar } from '@/components/Admin/AdminSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/components/ui/sidebar';

// Mock the useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
    useIsMobile: vi.fn()
}));

// Mock Inertia Link component
vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, className }: any) => (
        <a href={href} className={className} data-testid="inertia-link">
            {children}
        </a>
    )
}));

// Mock the Radix UI components
vi.mock('@radix-ui/react-slot', () => ({
    Slot: ({ children }: any) => <>{children}</>
}));

vi.mock('@radix-ui/react-context', () => ({
    Provider: ({ children }: any) => <>{children}</>
}));

const renderWithProvider = (component: React.ReactNode) => {
    return render(
        <SidebarProvider defaultOpen={true}>
            {component}
        </SidebarProvider>
    );
};

describe('AdminSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders desktop sidebar when not mobile', () => {
        (useIsMobile as any).mockReturnValue(false);
        renderWithProvider(<AdminSidebar />);

        // Check if navigation links are present
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByText('Orders')).toBeInTheDocument();
        expect(screen.getByText('Customers')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('Delivery')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders mobile sidebar with sheet when on mobile', () => {
        (useIsMobile as any).mockReturnValue(true);
        renderWithProvider(<AdminSidebar />);

        // Check if the mobile trigger button is present
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies correct classes to navigation buttons', () => {
        (useIsMobile as any).mockReturnValue(false);
        renderWithProvider(<AdminSidebar />);

        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).toHaveClass('w-full', 'justify-start', 'gap-2');
        });
    });

    it('renders icons for each navigation item', () => {
        (useIsMobile as any).mockReturnValue(false);
        renderWithProvider(<AdminSidebar />);

        // Check if icons are present (they should be rendered as SVG elements)
        const svgElements = document.querySelectorAll('svg');
        expect(svgElements.length).toBeGreaterThan(0);
    });
}); 