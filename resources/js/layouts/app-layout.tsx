import React, { PropsWithChildren, useState } from 'react';
import Sidebar from '@/components/Admin/Sidebar/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-switch"
import { styles } from './app-layout.styles';

export function AdminLayout({ children }: PropsWithChildren) {
    const [sidebarMinimized, setSidebarMinimized] = useState(false);

    return (
        <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
            <div className="min-h-screen flex">
                <Sidebar sidebarMinimized={sidebarMinimized} setSidebarMinimized={setSidebarMinimized} />
                <ToastContainer />

                <div className={`flex-1 ${sidebarMinimized ? 'pl-20' : 'pl-64'}`}>
                    {children}
                </div>
            </div>
            <header className={styles.header}>
                <div className={styles.headerContainer}>
                    <ThemeToggle />
                </div>
            </header>
        </ThemeProvider>
    );
}
