import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Echo from 'laravel-echo'; // Try importing without type declarations

interface Message {
    id: string;
    content: string;
    sender_id: string;
    sender_type: 'user' | 'agent';
    created_at: string;
}

export function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [agentStatus, setAgentStatus] = useState<'online' | 'offline'>('offline');
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [chatIdLoading, setChatIdLoading] = useState(false); // Loading state for chat_id fetch
    const [chatIdError, setChatIdError] = useState<string | null>(null); // Error state for chat_id fetch
    const [historyLoading, setHistoryLoading] = useState(false); // Loading state for history fetch
    const [historyError, setHistoryError] = useState<string | null>(null); // Error state for history fetch
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user, loading } = useAuth();
    const echo = useRef<any>(initializeEcho()); // Initialize Echo outside useEffect

    function initializeEcho() {
        return new Echo({
            broadcaster: 'pusher',
            key: process.env.MIX_PUSHER_APP_KEY,
            cluster: process.env.MIX_PUSHER_APP_CLUSTER,
            forceTLS: true
        });
    }

    useEffect(() => {
        // Fetch chat_id on component mount
        const fetchChatId = async () => {
            setChatIdLoading(true);
            setChatIdError(null);
            try {
                const response = await fetch('/api/chat/initiate', { method: 'POST' });
                if (response.ok) {
                    const data = await response.json();
                    setCurrentChatId(data.chat_id);
                } else {
                    setChatIdError('Failed to initiate chat session.');
                    console.error('Failed to initiate chat session');
                }
            } catch (error) {
                setChatIdError('Error initiating chat session.');
                console.error('Error initiating chat session:', error);
            } finally {
                setChatIdLoading(false);
            }
        };
        fetchChatId();

        const fetchChatHistory = async () => {
            if (currentChatId) {
                setHistoryLoading(true);
                setHistoryError(null);
                try {
                    const response = await fetch(`/api/chat/messages?chat_id=${currentChatId}`);
                    if (response.ok) {
                        const history = await response.json();
                        setMessages(history); // Replace existing messages with history
                    } else {
                        setHistoryError('Failed to fetch chat history.');
                        console.error('Failed to fetch chat history');
                    }
                } catch (error) {
                    setHistoryError('Error fetching chat history.');
                    console.error('Error fetching chat history:', error);
                } finally {
                    setHistoryLoading(false);
                }
            }
        };

        useEffect(() => {
            fetchChatHistory();
        }, [isOpen, currentChatId]); // Fetch history when chat window opens and chat_id is available


        // Subscribe to the chat channel
        if (user && echo.current) {
            const privateChannel = echo.current.private(`chat.${user.id}`);

            privateChannel.listen('MessageSent', (e: { message: Message }) => {
                setMessages(prev => [...prev, e.message]);
            });
            privateChannel.listen('AgentTyping', () => {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            });
            privateChannel.listen('AgentStatusChanged', (e: { status: 'online' | 'offline' }) => {
                setAgentStatus(e.status);
            });

            // Return a cleanup function to unsubscribe when the component unmounts or user changes
            return () => {
                privateChannel.unsubscribe();
            };
        }

        return () => { }; // Return empty function if no user or echo is not initialized
    }, [user]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user) return;

        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newMessage,
                    user_id: user.id,
                    chat_id: currentChatId, // Use currentChatId from state
                }),
            });

            if (response.ok) {
                const message = await response.json();
                setMessages(prev => [...prev, message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    if (loading) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            ) : (
                <div className="bg-white rounded-lg shadow-xl w-96 h-[32rem] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold">Support Chat</h3>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${agentStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-sm text-gray-600">{agentStatus === 'online' ? 'Agent Online' : 'Agent Offline'}</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {chatIdError && (
                            <div className="text-red-500 mb-2">
                                {chatIdError} Please refresh the page to try again.
                            </div>
                        )}
                        {historyError && (
                            <div className="text-red-500 mb-2">
                                {historyError} Please refresh the page to try again.
                            </div>
                        )}
                        {historyLoading && !historyError && (
                            <div className="text-gray-500 mb-2">
                                Loading chat history...
                            </div>
                        )}
                        {!historyLoading && !historyError && messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-4 ${message.sender_type === 'user' ? 'text-right' : 'text-left'}`}
                            >
                                <div
                                    className={`inline-block p-3 rounded-lg ${message.sender_type === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {message.content}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(message.created_at).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="text-gray-500 text-sm">Agent is typing...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
