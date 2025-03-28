import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
    it('renders button with text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    });

    it('applies size classes correctly', () => {
        render(<Button size="sm">Small Button</Button>);
        const button = screen.getByRole('button', { name: 'Small Button' });
        expect(button).toHaveClass('h-9 px-3');
    });
}); 