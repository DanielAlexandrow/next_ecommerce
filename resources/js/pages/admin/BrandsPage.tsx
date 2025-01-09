import { AdminLayout } from "@/layouts/app-layout";
import { updateLinks } from "@/lib/utils";
import { Link, usePage } from '@inertiajs/react';
import {
	Table, TableBody, TableCell, TableFooter, TableHeader, TableRow
} from '@/components/ui/table';
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Paginate from '@/components/pagination';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useBrandStore } from "@/stores/useBrandStore";
import DeleteConfirmationDialog from "@/components/Admin/DeleteBrandModal/DeleteBrandModal";
import AddNewBrandDialog from "@/components/Admin/AddNewBrandModal/AddNewBrandModal";
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';

const BrandPage = () => {
	const pageProps: any = usePage().props;
	const {
		brands, openDeleteModal, openAddBrandModal,
		modalBrand, modalMode, setBrands,
		setOpenDeleteModal, setOpenAddBrandModal, setModalBrand, setModalMode
	} = useBrandStore();

	const { sortConfig, getSortedUrl } = useTableSort({
		key: pageProps.sortkey,
		direction: pageProps.sortdirection
	}, pageProps.brands.current_page);

	const [links, setLinks] = useState(updateLinks(pageProps.brands.links, sortConfig.key, sortConfig.direction));

	console.log(links);

	useEffect(() => {
		if (pageProps.brands) {
			setBrands(pageProps.brands.data);
			setLinks(updateLinks(pageProps.brands.links, sortConfig.key, sortConfig.direction));
		}
	}, [pageProps]);

	const tableFields = (
		<TableRow>
			<TableCell>
				<SortableHeader
					label="ID"
					sortKey="id"
					sortConfig={sortConfig}
					getSortedUrl={getSortedUrl}
				/>
			</TableCell>
			<TableCell>
				<SortableHeader
					label="Name"
					sortKey="name"
					sortConfig={sortConfig}
					getSortedUrl={getSortedUrl}
				/>
			</TableCell>
			<TableCell>Actions</TableCell>
		</TableRow>
	);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold text-center mb-8">Brands</h1>

			<div className="max-w-6xl mx-auto space-y-6">
				<div className="bg-card rounded-lg shadow-sm p-6">
					<Table className="w-full text-center">
						<TableHeader>{tableFields}</TableHeader>
						<TableBody>
							{brands.map((brand) => (
								<TableRow key={brand.id}>
									<TableCell className="text-center">{brand.id}</TableCell>
									<TableCell className="text-center">{brand.name}</TableCell>
									<TableCell className="text-center">
										<DropdownMenu>
											<DropdownMenuTrigger className="flex items-center gap-2">
												Open
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem
													onClick={() => {
														setModalBrand(brand);
														setOpenDeleteModal(true);
													}}>
													Delete
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => {
														setModalBrand(brand);
														setModalMode('update');
														setOpenAddBrandModal(true);
													}}>
													Edit
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<div className="flex justify-between items-center">
					<div className="flex justify-center">
						<Paginate links={links} />
					</div>

					<Button
						onClick={() => {
							setModalMode('add');
							setModalBrand(null);
							setOpenAddBrandModal(true);
						}}
					>
						Add new brand
					</Button>
				</div>
			</div>

			{openDeleteModal && <DeleteConfirmationDialog />}
			{openAddBrandModal && <AddNewBrandDialog />}
		</div>
	);
};



BrandPage.layout = (page: any) => <AdminLayout children={page} />

export default BrandPage;
