import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
    name: 'chat' | 'close' | 'send';
    size?: number;
    className?: string;
}

const icons = {
    chat: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
    ),
    close: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
        />
    ),
    send: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
    )
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, className }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('feather', className)}
            aria-hidden="true"
        >
            {icons[name]}
        </svg>
    );
}; 