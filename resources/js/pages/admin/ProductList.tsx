import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow } from '@/components/ui/table';
import SubproductsModal from '@/components/Admin/SubproductsModal/SubproductsModal';
import DeleteProductModal from '@/components/Admin/DeleteProductModal/DeleteProductModal';
import NewSubproductModal from '@/components/Admin/NewSubproductModal/NewSubproductModal';
import EditProductModal from '@/components/Admin/ProductModal/EditProductModal';
import { Product } from '@/types';
import { productsStore } from '../../stores/productlist/productstore';
import { AdminLayout } from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import Paginate from '@/components/pagination';
import { FaArrowDown } from 'react-icons/fa';
import { FaArrowUp } from 'react-icons/fa';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateLinks } from '@/lib/utils';
import moment from 'moment';

export default function ProductsList(): React.ReactNode {
	const [
		products,
		openEditProductModal,
		openDeleteProductModal,
		openNewSubproductModal,
		openSubproductsModal,
		setProducts,
		setSelectedProduct,
		setSubproductsModal,
		setOpenNewSubproductModal,
		setOpenDeleteProductModal,
		setOpenEditProductModal,
	] = productsStore((state) => [
		state.products,
		state.openEditProductModal,
		state.openDeleteProductModal,
		state.openNewSubproductModal,
		state.openSubproductsModal,
		state.setProducts,
		state.setSelectedProduct,
		state.setSubproductsModal,
		state.setOpenNewSubproductModal,
		state.setOpenDeleteProductModal,
		state.setOpenEditProductModal,
	]);

	const pageProps: any = usePage().props;
	const [sortKey, setSortKey] = useState(pageProps.sortkey);
	const [sortDirection, setSortDirection] = useState(pageProps.sortdirection);
	const [links, setLinks] = useState(updateLinks(pageProps.products.links ? pageProps.products.links : [], sortKey, sortDirection));

	const handleSortChange = (key: string) => {
		let newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		const newUrl = `${window.location.protocol}//${window.location.host}/products?sortkey=${key}&sortdirection=${newSortDirection}&page=${pageProps.products.current_page}`;
		return newUrl;
	};

	useEffect(() => {
		setProducts(pageProps.products.data);
	}, []);

	const tableFields = (
		<TableRow>
			<TableCell>
				<Link href={handleSortChange('name')}>
					<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						Name{sortKey === 'name' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
					</span>
				</Link>
			</TableCell>
			<TableCell>
				<Link href={handleSortChange('description')}>
					<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						Description
						{sortKey === 'description' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
					</span>
				</Link>
			</TableCell>
			<TableCell>
				<Link href={handleSortChange('available')}>
					<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						Available{' '}
						{sortKey === 'available' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
					</span>
				</Link>
			</TableCell>
			<TableCell>
				<Link href={handleSortChange('created_at')}>
					<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						Created
						{sortKey === 'created_at' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
					</span>
				</Link>
			</TableCell>
			<TableCell>Actions</TableCell>
		</TableRow>
	);
	return (
		<>
			<div style={{ width: '700px', margin: 'auto' }}>
				<h1 className='text-center'>Products List</h1>

				<div className='mt-10'>{<Paginate links={links} />}</div>

				<Table className='text-center'>
					<TableHeader>{tableFields}</TableHeader>
					<TableBody>
						{products?.map((product: any, index: any) => (
							<TableRow key={index}>
								<TableCell>{product.name}</TableCell>
								<TableCell>{product.description}</TableCell>
								<TableCell>{product.available == true ? 'Yes' : 'No'}</TableCell>
								<TableCell>{moment(product.created_at).format('HH:mm DD.MM.YYYY')}</TableCell>

								<TableCell className='grid auto-rows-fr content-stretch justify-evenly text-center'>
									<DropdownMenu>
										<DropdownMenuTrigger>Open</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuItem
												onClick={() => {
													setSelectedProduct(product);
													setOpenDeleteProductModal(true);
												}}>
												Delete
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => {
													setSelectedProduct(product);
													setOpenEditProductModal(true);
												}}>
												Edit Product
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => {
													setSelectedProduct(product);
													setOpenNewSubproductModal(true);
												}}>
												Add option
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => {
													setSelectedProduct(product);
													setSubproductsModal(true);
												}}>
												View options
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					{tableFields}
				</Table>
				<div>{<Paginate links={links} />}</div>
			</div>
			{openSubproductsModal ? <SubproductsModal /> : null}
			{openNewSubproductModal ? <NewSubproductModal /> : null}
			{openDeleteProductModal ? <DeleteProductModal /> : null}
			{openEditProductModal ? <EditProductModal /> : null}
		</>
	);
}

ProductsList.layout = (page: any) => <AdminLayout children={page} />;
