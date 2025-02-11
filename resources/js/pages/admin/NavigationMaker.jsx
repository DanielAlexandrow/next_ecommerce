import type { NavigationHeader, NavigationIt, TemporaryNavigationIt } from '@/types';
import { AdminLayout } from '@/layouts/app-layout';
import React, { useEffect } from 'react';
import { IoArrowUp } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import { FaPlusCircle, FaRegTrashAlt } from 'react-icons/fa';
import NavigationItem from '../../components/Admin/NavigationMaker/NavigationItem';
import DeleteNavigationItemModal from '../../components/Admin/NavigationMaker/DeleteNavItemModal';
import { toast } from 'react-toastify';
import NewHeaderModal from '@/components/Admin/NavigationMaker/NewHeaderModal';
import EditNavigationItemModal from '@/components/Admin/NavigationMaker/EditNavigationItemModal';
import DeleteHeaderNavigationModal from '@/components/Admin/NavigationMaker/DeleteNavigationHeaderModal';
import { navigationApi } from '@/api/navigationApi';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

// Add a module-level counter for unique negative IDs
let tempIdCounter = -1;

const generateUniqueId = () => {
	return {
		id: tempIdCounter--, // Returns a number
		isTemporary: true as const
	};
};

const NavigationMaker = () => {
	const [
		headers,
		setHeaders,
		selectedNavigationItem,
		setOpenNewHeaderModal,
		setSelectedHeader,
		openEditNavigationItemModal,
		setOpenDeleteHeaderModal,
	] = navigationStore((state) => [
		state.headers,
		state.setHeaders,
		state.selectedNavigationItem,
		state.setOpenNewHeaderModal,
		state.setSelectedHeader,
		state.openEditNavigationItemModal,
		state.setOpenDeleteHeaderModal,
	]);

	const pageProps: any = usePage().props;

	useEffect(() => {
		console.log('pageProps.headers', pageProps);
		setHeaders(pageProps.headers);
	}, []);

	const handleHeaderOrderLeft = (index: number) => {
		const items = Array.from(headers);
		if (index > 0) {
			const temp = items[index - 1];
			items[index - 1] = items[index];
			items[index] = temp;
			items.forEach((item, index) => {
				item.order_num = index + 1;
			});
			setHeaders(items);
		}
	};

	const handleHeaderOrderRight = (index: number) => {
		const items = Array.from(headers);
		if (index < items.length - 1) {
			const temp = items[index + 1];
			items[index + 1] = items[index];
			items[index] = temp;
			items.forEach((item, index) => {
				item.order_num = index + 1;
			});
			setHeaders(items);
		}
	};

	const handleSaveNavigation = async () => {
		try {
			const processedHeaders = headers.map(header => ({
				id: typeof header.id === 'string' || header.id < 0 ? 0 : Number(header.id),
				name: header.name,
				order_num: header.order_num,
				navigation_items: header.navigation_items.map(item => ({
					id: typeof item.id === 'string' || item.id < 0 ? 0 : Number(item.id),
					name: item.name,
					order_num: item.order_num,
					header_id: typeof header.id === 'string' || header.id < 0 ? 0 : Number(header.id),
					categories: item.categories,
				}))
			}));

			await navigationApi.saveNavigation(processedHeaders);
			toast.success('Navigation updated successfully');
		} catch (error) {
			toast.error('Error updating navigation: ' + (error instanceof Error ? error.message : String(error)));
		}
	};

	const handleAddNavigationItem = (header: NavigationHeader) => {
		const { id: tempId, isTemporary } = generateUniqueId();

		const newItem: TemporaryNavigationIt = {
			id: tempId,
			name: 'Menu Option',
			order_num: header.navigation_items.length + 1,
			header_id: header.id,
			categories: [],
			isTemporary
		};

		const updatedHeaders: NavigationHeader[] = headers.map(item => {
			if (item.id === header.id) {
				return {
					...item,
					navigation_items: [...item.navigation_items, newItem]
				};
			}
			return item;
		});

		setHeaders(updatedHeaders);
	};

	const handleMoveUp = (item: NavigationIt) => {
		const updatedHeaders = headers.map(header => {
			if (header.id !== item.header_id) return header;

			const navigationItems = [...header.navigation_items];
			const currentIndex = navigationItems.findIndex(navItem => navItem.id === item.id);

			if (currentIndex > 0) {
				[navigationItems[currentIndex - 1], navigationItems[currentIndex]] =
					[navigationItems[currentIndex], navigationItems[currentIndex - 1]];

				return {
					...header,
					navigation_items: navigationItems.map((navItem, idx) => ({
						...navItem,
						order_num: idx + 1
					}))
				};
			}
			return header;
		});

		setHeaders(updatedHeaders);
	};

	const handleMoveDown = (item: NavigationIt) => {
		const updatedHeaders = headers.map(header => {
			if (header.id !== item.header_id) return header;

			const navigationItems = [...header.navigation_items];
			const currentIndex = navigationItems.findIndex(navItem => navItem.id === item.id);

			if (currentIndex < navigationItems.length - 1) {
				[navigationItems[currentIndex], navigationItems[currentIndex + 1]] =
					[navigationItems[currentIndex + 1], navigationItems[currentIndex]];

				return {
					...header,
					navigation_items: navigationItems.map((navItem, idx) => ({
						...navItem,
						order_num: idx + 1
					}))
				};
			}
			return header;
		});

		setHeaders(updatedHeaders);
	};

	const handleChangeHeaderName = (header: NavigationHeader, name: string) => {
		const updatedHeaders = headers.map(item => {
			if (item.id !== header.id) return item;
			return { ...item, name };
		});
		setHeaders(updatedHeaders);
	};

	const handleAddHeader = () => {
		const { id: tempId } = generateUniqueId();

		const newHeader: NavigationHeader = {
			id: tempId, // Unique negative integer ID
			name: 'New Header',
			order_num: headers.length + 1,
			navigation_items: []
		};

		setHeaders([...headers, newHeader]);
	};

	return (
		<>
			<h1 className='text-center'>Navigation Maker</h1>
			<div className='flex space-x-4 mb-4'>
				<Button onClick={handleSaveNavigation}>Sync Headers</Button>
				<Button onClick={handleAddHeader}>Add New Header</Button>
			</div>

			<motion.div className='flex flex-wrap' layout>
				<AnimatePresence>
					{headers
						.sort((a, b) => a.order_num - b.order_num)
						.map((header, index) => (
							<motion.div
								key={header.id} // Unique key using unique negative IDs
								className='border rounded-lg p-2 m-1 max-w-[250px]'
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.3 }}
							>
								<div>
									<div className='flex items-center mb-2'>
										<motion.div
											style={{ padding: '3px' }}
											onClick={() => handleHeaderOrderLeft(index)}
											className='text-lg hover:border hover:border-white rounded-sm cursor-pointer'
											whileTap={{ scale: 0.8 }}
										>
											<IoArrowUp style={{ transform: 'rotate(-90deg)' }} title='Move Left' />
										</motion.div>
										<motion.input
											type='text'
											className='text-white bg-black text-center hover:border hover:border-white rounded-sm flex-1 mx-2 p-1'
											value={header.name}
											onChange={(e) => handleChangeHeaderName(header, e.target.value)}
											whileFocus={{ scale: 1.05 }}
											transition={{ duration: 0.2 }}
										/>
										<motion.div
											style={{ padding: '3px' }}
											onClick={() => handleHeaderOrderRight(index)}
											className='text-lg hover:border hover:border-white rounded-sm cursor-pointer'
											whileTap={{ scale: 0.8 }}
										>
											<IoArrowUp style={{ transform: 'rotate(+90deg)' }} title='Move Right' />
										</motion.div>
									</div>
									<div className='inline-flex justify-center w-full mb-2'>
										<motion.div
											className='place-content-center hover:border hover:border-white rounded-sm p-1 cursor-pointer'
											onClick={() => handleAddNavigationItem(header)}
											whileTap={{ scale: 0.8 }}
										>
											<FaPlusCircle
												className='text-lg'
												title='Add Navigation Item'
											/>
										</motion.div>
										<motion.div
											className='place-content-center hover:border hover:border-white rounded-sm p-1 cursor-pointer'
											onClick={() => {
												setSelectedHeader(header);
												setOpenDeleteHeaderModal(true);
											}}
											whileTap={{ scale: 0.8 }}
										>
											<FaRegTrashAlt
												className='text-lg'
												title='Delete Header'
											/>
										</motion.div>
									</div>
								</div>
								<motion.table>
									<motion.tbody layout>
										{header.navigation_items
											.sort((a, b) => a.order_num - b.order_num)
											.map((item) => (
												<NavigationItem
													key={`${header.id}-${item.id}-${item.isTemporary ? 'temp' : 'perm'}`} // Unique key
													item={item}
												/>
											))}
									</motion.tbody>
								</motion.table>
							</motion.div>
						))}
				</AnimatePresence>
				<NewHeaderModal />
				<DeleteHeaderNavigationModal />

				{openEditNavigationItemModal && <EditNavigationItemModal />}
				{selectedNavigationItem && <DeleteNavigationItemModal />}
			</motion.div>
		</>
	);
};

NavigationMaker.layout = (page: any) => <AdminLayout children={page} />;

export default NavigationMaker;
