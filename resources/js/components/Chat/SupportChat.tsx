import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Echo from 'laravel-echo';
import { styles } from './SupportChat.styles';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user, loading } = useAuth();
    const echo = useRef<Echo>();

    useEffect(() => {
        // Initialize Laravel Echo
        echo.current = new Echo({
            broadcaster: 'pusher',
            key: process.env.MIX_PUSHER_APP_KEY,
            cluster: process.env.MIX_PUSHER_APP_CLUSTER,
            forceTLS: true
        });

        // Subscribe to the chat channel
        if (user) {
            echo.current.private(`chat.${user.id}`)
                .listen('MessageSent', (e: { message: Message }) => {
                    setMessages(prev => [...prev, e.message]);
                })
                .listen('AgentTyping', () => {
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 3000);
                })
                .listen('AgentStatusChanged', (e: { status: 'online' | 'offline' }) => {
                    setAgentStatus(e.status);
                });
        }

        return () => {
            echo.current?.disconnect();
        };
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
                    user_id: user.id
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
        <div className={styles.container}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className={styles.chatButton}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            ) : (
                <div className={styles.chatWindow}>
                    <div className={styles.header.container}>
                        <h3 className={styles.header.title}>Support Chat</h3>
                        <div className="flex items-center gap-2">
                            <span className={styles.header.status(agentStatus === 'online')} />
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

                    <div className={styles.messageContainer}>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={styles.message.container(message.sender_type === 'agent')}
                            >
                                <div
                                    className={styles.message.bubble(message.sender_type === 'agent')}
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

                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your message..."
                            className={styles.input}
                        />
                        <button
                            onClick={handleSendMessage}
                            className={styles.sendButton}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}