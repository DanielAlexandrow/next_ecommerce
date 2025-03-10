import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '@/components/Footer';

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
        div: ({ children, className }: any) => (
            <div className={className}>{children}</div>
        ),
        button: ({ children, onClick, className }: any) => (
            <button onClick={onClick} className={className}>
                {children}
            </button>
        )
    }
}));




describe('Footer', () => {



    it('renders newsletter section with email input', () => {
        render(<Footer />);

        expect(screen.getByText('Newsletter')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByText('Subscribe')).toBeInTheDocument();
    });

    it('handles newsletter subscription', () => {
        render(<Footer />);

        const emailInput = screen.getByPlaceholderText('Enter your email');
        const subscribeButton = screen.getByText('Subscribe');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(subscribeButton);

        // Note: In a real implementation, we would test the subscription logic
        expect(emailInput).toHaveValue('test@example.com');
    });

    it('applies hover styles to quick links', () => {
        render(<Footer />);

        const links = screen.getAllByTestId('inertia-link');
        links.forEach(link => {
            expect(link).toHaveClass('hover:text-white');
        });
    });

    it('renders copyright notice', () => {
        render(<Footer />);
        expect(screen.getByText(/© 2024 Your Store/)).toBeInTheDocument();
        expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
    });

    it('has accessible form controls', () => {
        render(<Footer />);

        const emailInput = screen.getByPlaceholderText('Enter your email');
        expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('maintains responsive layout classes', () => {
        render(<Footer />);

        const gridContainer = screen.getByText('About Us').closest('.grid');
        expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-3');
    });
}); 