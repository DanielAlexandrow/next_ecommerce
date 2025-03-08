import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';

interface UserButtonProps {
    user?: User;
}

export function UserButton({ user }: UserButtonProps) {
    const initials = user?.name
        ?.split(' ')
        .map(word => word[0])
        .join('') || 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <Avatar>
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <a href="/profile">Profile</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href="/logout" method="post" as="button">
                        Logout
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}