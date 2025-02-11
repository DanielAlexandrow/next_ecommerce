import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Simple test component
const SimpleButton = ({ text }: { text: string }) => {
    return <button>{text}</button>;
};

describe('MinimalTest', () => {
    it('renders a button with text', () => {
        render(<SimpleButton text="Click me" />);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });
}); 