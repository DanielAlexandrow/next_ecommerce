import StoreNavBar from '@/components/Store/StoreNavBar/StoreNavBar';
import React, { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { styles } from './store-layout.styles';

export function StoreLayout({ children }: PropsWithChildren) {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen">
                <ToastContainer />
                <div className="flex flex-col">
                    <div className={styles.nav.container}>
                        <StoreNavBar />
                    </div>
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </QueryClientProvider>
    );
}
