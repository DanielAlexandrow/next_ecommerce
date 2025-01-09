/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

describe('SupportChat', () => {
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

        // Mock fetch
        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    id: '1',
                    content: 'Test message',
                    sender_id: '1',
                    sender_type: 'user',
                    created_at: new Date().toISOString()
                })
            })
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders chat toggle button when closed', () => {
        render(<SupportChat />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('opens chat window when toggle button is clicked', () => {
        render(<SupportChat />);
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByText('Support Chat')).toBeInTheDocument();
    });

    it('sends message when send button is clicked', async () => {
        render(<SupportChat />);

        // Open chat
        fireEvent.click(screen.getByRole('button'));

        // Type message
        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Test message' } });

        // Send message
        fireEvent.click(screen.getByText('Send'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: 'Test message',
                    user_id: mockUser.id
                }),
            });
        });
    });

    it('sends message when Enter key is pressed', async () => {
        render(<SupportChat />);

        // Open chat
        fireEvent.click(screen.getByRole('button'));

        // Type message and press Enter
        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    it('shows agent status', () => {
        render(<SupportChat />);

        // Open chat
        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByText('Agent Offline')).toBeInTheDocument();
    });

    it('closes chat window when close button is clicked', () => {
        render(<SupportChat />);

        // Open chat
        fireEvent.click(screen.getByRole('button'));

        // Close chat
        fireEvent.click(screen.getByLabelText('Close'));

        expect(screen.queryByText('Support Chat')).not.toBeInTheDocument();
    });

    it('does not send empty messages', async () => {
        render(<SupportChat />);

        // Open chat
        fireEvent.click(screen.getByRole('button'));

        // Try to send empty message
        fireEvent.click(screen.getByText('Send'));

        await waitFor(() => {
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    it('displays error when message fails to send', async () => {
        // Mock fetch to reject
        global.fetch = vi.fn().mockImplementation(() =>
            Promise.reject(new Error('Failed to send message'))
        );

        render(<SupportChat />);

        // Open chat
        fireEvent.click(screen.getByRole('button'));

        // Type and send message
        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.click(screen.getByText('Send'));

        await waitFor(() => {
            expect(screen.getByText('Failed to send message')).toBeInTheDocument();
        });
    });

    it('shows typing indicator when agent is typing', async () => {
        render(<SupportChat />);

        // Open chat
        fireEvent.click(screen.getByRole('button'));

        // Simulate typing event
        const typingEvent = new Event('AgentTyping');
        document.dispatchEvent(typingEvent);

        await waitFor(() => {
            expect(screen.getByText('Agent is typing...')).toBeInTheDocument();
        });
    });
}); 