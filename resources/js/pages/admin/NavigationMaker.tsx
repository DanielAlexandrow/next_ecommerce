import React, { useEffect } from 'react';
import { NavigationHeader, NavigationItem as NavigationItemType } from '@/types';
import AdminLayout from '@/layouts/admin-layout';
import NavigationItem from '@/components/Admin/NavigationMaker/NavigationItem';
import { motion, AnimatePresence } from 'framer-motion';
import NewHeaderModal from '@/components/Admin/NavigationMaker/NewHeaderModal';
import DeleteHeaderNavigationModal from '@/components/Admin/NavigationMaker/DeleteHeaderNavigationModal';
import EditNavigationItemModal from '@/components/Admin/NavigationMaker/EditNavigationItemModal';
import { HeaderState, navigationMakerStore } from '@/stores/navigationmaker/navigationmakerstore';
import DeleteNavigationItemModal from '@/components/Admin/NavigationMaker/DeleteNavigationItemModal';
import { IoArrowUp } from 'react-icons/io5';
import { FaPlusCircle } from 'react-icons/fa';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { navigationApi } from '@/api/navigationApi';
import { styles } from './NavigationMaker.styles';

const fetchHeaders = async () => {
	return await navigationApi.getNavData();
};

const NavigationMaker = () => {
	const [headers, setHeaders, selectedHeader, setSelectedHeader, selectedNavigationItem, setSelectedNavigationItem] =
		navigationMakerStore((state) => [
			state.headers,
			state.setHeaders,
			state.selectedHeader,
			state.setSelectedHeader,
			state.selectedNavigationItem,
			state.setSelectedNavigationItem,
		]);

	const [openNewHeaderModal, setOpenNewHeaderModal] = navigationMakerStore((state) => [
		state.openNewHeaderModal,
		state.setOpenNewHeaderModal,
	]);

	const [openDeleteHeaderModal, setOpenDeleteHeaderModal] = navigationMakerStore((state) => [
		state.openDeleteHeaderModal,
		state.setOpenDeleteHeaderModal,
	]);

	const [openEditNavigationItemModal, setOpenEditNavigationItemModal] = navigationMakerStore((state) => [
		state.openEditNavigationItemModal,
		state.setOpenEditNavigationItemModal,
	]);

	const { data: fetchedHeaders } = useQuery({
		queryKey: ['headers'],
		queryFn: fetchHeaders,
		onSuccess: (data) => {
			setHeaders(data);
		},
	});

	const handleAddNavigationItem = (header: NavigationHeader) => {
		const newNavigationItem: NavigationItemType = {
			id: Math.floor(Math.random() * 1000000),
			name: 'New Navigation Item',
			order_num: header.navigation_items.length + 1,
			header_id: header.id,
			isTemporary: true,
		};

		const updatedHeader = {
			...header,
			navigation_items: [...header.navigation_items, newNavigationItem],
		};

		setHeaders(
			headers.map((h) => {
				if (h.id === header.id) {
					return updatedHeader;
				}
				return h;
			})
		);
	};

	const handleChangeHeaderName = (header: NavigationHeader, newName: string) => {
		const updatedHeader = { ...header, name: newName };
		updateHeader(updatedHeader);
	};

	const handleHeaderOrderRight = async (index: number) => {
		if (index >= headers.length - 1) return;

		const newHeaders = [...headers];
		[newHeaders[index], newHeaders[index + 1]] = [newHeaders[index + 1], newHeaders[index]];

		newHeaders[index].order_num = index + 1;
		newHeaders[index + 1].order_num = index + 2;

		setHeaders(newHeaders);

		try {
			await navigationApi.updateHeaderOrder({
				header_id: newHeaders[index + 1].id,
				new_order: newHeaders[index + 1].order_num,
			});
			await navigationApi.updateHeaderOrder({
				header_id: newHeaders[index].id,
				new_order: newHeaders[index].order_num,
			});
		} catch (error) {
			console.error('Error updating header order:', error);
		}
	};

	const handleHeaderOrderLeft = async (index: number) => {
		if (index <= 0) return;

		const newHeaders = [...headers];
		[newHeaders[index], newHeaders[index - 1]] = [newHeaders[index - 1], newHeaders[index]];

		newHeaders[index].order_num = index + 1;
		newHeaders[index - 1].order_num = index;

		setHeaders(newHeaders);

		try {
			await navigationApi.updateHeaderOrder({
				header_id: newHeaders[index - 1].id,
				new_order: newHeaders[index - 1].order_num,
			});
			await navigationApi.updateHeaderOrder({
				header_id: newHeaders[index].id,
				new_order: newHeaders[index].order_num,
			});
		} catch (error) {
			console.error('Error updating header order:', error);
		}
	};

	const updateHeader = async (updatedHeader: HeaderState) => {
		setHeaders(
			headers.map((h) => {
				if (h.id === updatedHeader.id) {
					return updatedHeader;
				}
				return h;
			})
		);

		try {
			await navigationApi.updateHeader(updatedHeader);
		} catch (error) {
			console.error('Error updating header:', error);
		}
	};

	return (
		<>
			<motion.div layout>
				<button
					onClick={() => setOpenNewHeaderModal(true)}
					className='bg-white text-black p-2 rounded-md hover:bg-gray-200 transition duration-200 mb-4'
				>
					Add New Header
				</button>

				<AnimatePresence>
					{headers
						.sort((a, b) => a.order_num - b.order_num)
						.map((header, index) => (
							<motion.div
								key={header.id}
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.3 }}
							>
								<div>
									<div className={styles.container.header}>
										<motion.div
											className={styles.button.arrow}
											onClick={() => handleHeaderOrderLeft(index)}
											whileTap={{ scale: 0.8 }}
										>
											<IoArrowUp style={{ transform: 'rotate(-90deg)' }} title='Move Left' />
										</motion.div>
										<motion.input
											type='text'
											className={styles.input}
											value={header.name}
											onChange={(e) => handleChangeHeaderName(header, e.target.value)}
											whileFocus={{ scale: 1.05 }}
											transition={{ duration: 0.2 }}
										/>
										<motion.div
											className={styles.button.arrow}
											onClick={() => handleHeaderOrderRight(index)}
											whileTap={{ scale: 0.8 }}
										>
											<IoArrowUp style={{ transform: 'rotate(+90deg)' }} title='Move Right' />
										</motion.div>
									</div>
									<div className='inline-flex justify-center w-full mb-2'>
										<motion.div
											className={styles.button.action}
											onClick={() => handleAddNavigationItem(header)}
											whileTap={{ scale: 0.8 }}
										>
											<FaPlusCircle
												className='text-lg'
												title='Add Navigation Item'
											/>
										</motion.div>
										<motion.div
											className={styles.button.action}
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
													key={`${header.id}-${item.id}-${item.isTemporary ? 'temp' : 'perm'}`}
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
