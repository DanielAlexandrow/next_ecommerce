import StoreNavBar from '@/components/Store/StoreNavBar/StoreNavBar';
import React, { PropsWithChildren, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


export function StoreLayout({ children }: PropsWithChildren) {


	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>

			<div style={{ display: 'flex', flexDirection: 'row' }}>
				<ToastContainer />
				<div style={{ flexGrow: 1 }} >
					<div className="max-w-md mx-auto">
						<StoreNavBar />
					</div>
					<div
						style={{
							margin: '10px auto',
							maxWidth: '1200px',
						}}>

						{children}
					</div>
				</div>
			</div >
		</QueryClientProvider>

	);
}
