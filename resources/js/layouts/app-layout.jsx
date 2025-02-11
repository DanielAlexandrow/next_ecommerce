import React, { PropsWithChildren, useState } from 'react';
import Sidebar from '@/components/Admin/Sidebar/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-switch"

export function AdminLayout({ children }: PropsWithChildren) {
    const [sidebarMinimized, setSidebarMinimized] = useState(false);

    return (
        <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Sidebar sidebarMinimized={sidebarMinimized} setSidebarMinimized={setSidebarMinimized} />
                <ToastContainer />

                <div style={{ flexGrow: 1, paddingLeft: sidebarMinimized ? '80px' : '200px' }}>
                    <div
                        style={{
                            margin: '10px auto',
                            maxWidth: '1200px',
                        }}>
                        {children}
                    </div>
                </div>
            </div>
            <header className="border-b">
                <div className="container flex items-center justify-between">
                    {/* Your other header content */}
                    <ThemeToggle />
                </div>
            </header>
        </ThemeProvider>
    );
}
