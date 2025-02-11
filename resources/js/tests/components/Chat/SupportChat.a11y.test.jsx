/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />
/// <reference types="jest-axe" />

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe } from 'jest-axe';
import { SupportChat } from '../../../components/Chat/SupportChat';
import { useAuth } from '../../../hooks/useAuth';
import '@testing-library/jest-dom';

// Mock the useAuth hook
vi.mock('../../../hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

// Mock Echo
vi.mock('laravel-echo', () => {
    return function () {
        return {
            private: () => ({
                listen: () => ({
                    listen: () => ({
                        listen: () => ({})
                    })
                })
            }),
            disconnect: vi.fn()
        };
    };
});

describe('SupportChat Accessibility', () => {
    const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
    };

    beforeEach(() => {
        (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: mockUser,
            loading: false
        });
    });

    it('should have no accessibility violations when closed', async () => {
        const { container } = render(<SupportChat />);
        const results = await axe(container);
        expect(results.violations.length).toBe(0);
    });

    it('should have no accessibility violations when open', async () => {
        const { container } = render(<SupportChat />);
        fireEvent.click(screen.getByRole('button'));
        const results = await axe(container);
        expect(results.violations.length).toBe(0);
    });

    it('should have proper ARIA labels for interactive elements', () => {
        render(<SupportChat />);

        // Check toggle button
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Toggle support chat');

        // Open chat
        fireEvent.click(screen.getByRole('button'));

        // Check close button
        expect(screen.getByLabelText('Close')).toBeInTheDocument();

        // Check message input
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Type a message');

        // Check send button
        expect(screen.getByText('Send')).toHaveAttribute('aria-label', 'Send message');
    });

    it('should maintain focus management', async () => {
        render(<SupportChat />);

        // Open chat
        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);

        // Focus should move to close button
        expect(screen.getByLabelText('Close')).toHaveFocus();

        // Close chat
        fireEvent.click(screen.getByLabelText('Close'));

        // Focus should return to toggle button
        expect(toggleButton).toHaveFocus();
    });

    it('should handle keyboard navigation', () => {
        render(<SupportChat />);
        fireEvent.click(screen.getByRole('button'));

        const elements = screen.getAllByRole('button');
        const input = screen.getByRole('textbox');

        // Tab through elements
        elements.forEach((element) => {
            element.focus();
            expect(element).toHaveFocus();
        });

        input.focus();
        expect(input).toHaveFocus();
    });

    it('should announce status changes', async () => {
        render(<SupportChat />);
        fireEvent.click(screen.getByRole('button'));

        // Check agent status announcement
        expect(screen.getByText('Agent Offline')).toHaveAttribute('aria-live', 'polite');

        // Check typing indicator announcement
        const typingEvent = new Event('AgentTyping');
        document.dispatchEvent(typingEvent);

        await waitFor(() => {
            expect(screen.getByText('Agent is typing...')).toHaveAttribute('aria-live', 'polite');
        });
    });

    it('should announce new messages', async () => {
        render(<SupportChat />);
        fireEvent.click(screen.getByRole('button'));

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.click(screen.getByText('Send'));

        await waitFor(() => {
            const messageContainer = screen.getByRole('log');
            expect(messageContainer).toHaveAttribute('aria-live', 'polite');
            expect(messageContainer).toHaveAttribute('aria-atomic', 'false');
        });
    });

    it('should announce errors accessibly', async () => {
        // Mock fetch to reject
        global.fetch = vi.fn().mockImplementation(() =>
            Promise.reject(new Error('Failed to send message'))
        );

        render(<SupportChat />);
        fireEvent.click(screen.getByRole('button'));

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.click(screen.getByText('Send'));

        await waitFor(() => {
            const error = screen.getByRole('alert');
            expect(error).toHaveAttribute('aria-live', 'assertive');
            expect(error).toHaveTextContent('Failed to send message');
        });
    });

    it('should have proper heading structure', () => {
        render(<SupportChat />);
        fireEvent.click(screen.getByRole('button'));

        const heading = screen.getByRole('heading', { name: 'Support Chat' });
        expect(heading).toHaveAttribute('aria-level', '1');
    });

    it('should support reduced motion', () => {
        render(<SupportChat />);

        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toHaveStyle({
            '@media (prefers-reduced-motion: reduce)': {
                animation: 'none'
            }
        });
    });
}); 