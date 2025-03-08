import React from 'react';
import { UserButton } from '@/components/ui/user-button';

export default function AdminNavbar() {
    return (
        <nav className="border-b bg-card">
            <div className="flex h-16 items-center px-4">
                <div className="ml-auto flex items-center space-x-4">
                    <UserButton />
                </div>
            </div>
        </nav>
    );
}