import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SupportChat } from '@/components/Chat/SupportChat';
import { useAuth } from '@/hooks/useAuth';
import { useEcho } from '@/hooks/useEcho';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useEcho');

describe('SupportChat Component', () => {
    const mockUser = {
        id: 1,
        name: 'Test User',
        avatar: 'test-avatar.png',
    };

    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
            isLoggedIn: true,
        });
        (useEcho as jest.Mock).mockReturnValue({
            echo: {
                channel: jest.fn().mockReturnValue({
                    listen: jest.fn(),
                }),
            },
        });
    });

    it('renders the component', () => {
        render(<SupportChat />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    });

    it('sends a message', async () => {
        render(<SupportChat />);
        const input = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button', { name: 'Send' });

        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });
    });

    it('displays a message from another user', async () => {
        (useEcho as jest.Mock).mockReturnValue({
            echo: {
                channel: jest.fn().mockReturnValue({
                    listen: jest.fn().mockImplementation((event, callback) => {
                        if (event === '.message') {
                            callback({
                                message: {
                                    message: 'Another user message',
                                    sender: {
                                        id: 2,
                                        name: 'Another User',
                                        avatar: 'another-avatar.png',
                                    },
                                },
                            });
                        }
                    }),
                }),
            },
        });

        render(<SupportChat />);

        await waitFor(() => {
            expect(screen.getByText('Another user message')).toBeInTheDocument();
        });
    });

    it('shows agent typing indicator', async () => {
        (useEcho as jest.Mock).mockReturnValue({
            echo: {
                channel: jest.fn().mockReturnValue({
                    listen: jest.fn().mockImplementation((event, callback) => {
                        if (event === '.typing') {
                            callback({
                                userId: 2,
                            });
                        }
                    }),
                }),
            },
        });

        render(<SupportChat />);

         await waitFor(() => {
            expect(screen.getByText('Another user is typing...')).toBeInTheDocument();
        });
    });

    it('shows agent status change', async () => {
         (useEcho as jest.Mock).mockReturnValue({
            echo: {
                channel: jest.fn().mockReturnValue({
                    listen: jest.fn().mockImplementation((event, callback) => {
                        if (event === '.status') {
                            callback({
                                userId: 2,
                                status: 'online',
                            });
                        }
                    }),
                }),
            },
        });

        render(<SupportChat />);

         await waitFor(() => {
            expect(screen.getByText('Another user is online')).toBeInTheDocument();
        });
    });
});
