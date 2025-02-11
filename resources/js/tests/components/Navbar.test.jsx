import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '@/components/Navbar';

// Mock Inertia Link component
vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, className }: any) => (
        <a href={href} className={className} data-testid="inertia-link">
            {children}
        </a>
    )
}));

// Mock framer-motion to avoid animation-related issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        button: ({ children, onClick, className }: any) => (
            <button onClick={onClick} className={className}>
                {children}
            </button>
        ),
        span: ({ children, className }: any) => (
            <span className={className}>{children}</span>
        )
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('Navbar', () => {
    const defaultProps = {
        onCartClick: vi.fn(),
        cartItemCount: 0
    };

    it('renders navigation links correctly', () => {
        render(<Navbar {...defaultProps} />);

        const links = screen.getAllByTestId('inertia-link');
        expect(links).toHaveLength(3); // Home, Products, Categories

        expect(links[0]).toHaveAttribute('href', '/');
        expect(links[1]).toHaveAttribute('href', '/products');
        expect(links[2]).toHaveAttribute('href', '/categories');
    });

    it('displays store name in the navbar', () => {
        render(<Navbar {...defaultProps} />);
        expect(screen.getByText('Your Store')).toBeInTheDocument();
    });

    it('handles cart button click', () => {
        const onCartClick = vi.fn();
        render(<Navbar {...defaultProps} onCartClick={onCartClick} />);

        const cartButton = screen.getByRole('button');
        fireEvent.click(cartButton);

        expect(onCartClick).toHaveBeenCalledTimes(1);
    });

    it('shows cart item count when items are present', () => {
        render(<Navbar {...defaultProps} cartItemCount={5} />);
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('does not show cart count when no items', () => {
        render(<Navbar {...defaultProps} cartItemCount={0} />);
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('applies hover styles to navigation links', () => {
        render(<Navbar {...defaultProps} />);

        const links = screen.getAllByTestId('inertia-link');
        links.slice(1).forEach(link => {
            expect(link).toHaveClass('hover:text-primary-600');
        });
    });

    it('shows cart icon', () => {
        render(<Navbar {...defaultProps} />);
        // FiShoppingCart is rendered as an SVG, so we check for its container
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
}); 