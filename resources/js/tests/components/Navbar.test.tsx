import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '@/components/Navbar';
import { createTestRouter } from '@/lib/test-utils';

// Mock Inertia React
vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, className }: any) => (
        <a href={href} className={className} data-testid="inertia-link">
            {children}
        </a>
    ),
    usePage: () => ({
        props: {
            auth: {
                user: null
            }
        }
    })
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        button: ({ children, onClick, className, whileHover, whileTap }: any) => (
            <button onClick={onClick} className={className}>
                {children}
            </button>
        ),
        span: ({ children, className }: any) => (
            <span className={className}>{children}</span>
        ),
        div: ({ children, className }: any) => (
            <div className={className}>{children}</div>
        )
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('Navbar', () => {
    const defaultProps = {
        onCartClick: vi.fn(),
        cartItemCount: 0
    };

    it('renders store name and navigation links', () => {
        render(<Navbar {...defaultProps} />);
        
        expect(screen.getByText('Your Store')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('renders shopping cart button', () => {
        render(<Navbar {...defaultProps} />);
        const cartButton = screen.getByRole('button');
        
        expect(cartButton).toBeInTheDocument();
        fireEvent.click(cartButton);
        expect(defaultProps.onCartClick).toHaveBeenCalledTimes(1);
    });

    it('displays cart badge when items are present', () => {
        render(<Navbar {...defaultProps} cartItemCount={5} />);
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('hides cart badge when no items', () => {
        render(<Navbar {...defaultProps} cartItemCount={0} />);
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('has correct navigation links', () => {
        render(<Navbar {...defaultProps} />);

        const productLink = screen.getByText('Products');
        const categoriesLink = screen.getByText('Categories');

        expect(productLink.closest('a')).toHaveAttribute('href', '/products');
        expect(categoriesLink.closest('a')).toHaveAttribute('href', '/categories');
    });
});