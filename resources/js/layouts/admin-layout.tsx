import React from 'react';
import AdminNavbar from '@/components/Admin/AdminNavbar';
import { AdminSidebar } from '@/components/Admin/AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <AdminNavbar />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-6">
                    {title && (
                        <h1 className="text-2xl font-bold mb-6">{title}</h1>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
