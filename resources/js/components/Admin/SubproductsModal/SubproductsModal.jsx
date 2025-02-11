import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import EditProductOptionModal from '../EditSubproductModal/EditSubproductModal';
import { Button } from '@/components/ui/button';
import DeleteSubproductModal from '../DeleteSubproductModal/DeleteSubproductModal';
import { Subproduct } from '@/types';
import { productsStore } from '@/stores/productlist/productstore';
import axios from 'axios';
import { subproductApi } from '@/api/subproductApi';

const SubproductsModal: React.FC = () => {
	const [
		openSubproductsModal,
		setSubproductsModal,
		selectedProduct,
		setOpenSubproductFormModal,
		setSelectedSubproduct,
		openDeleteSubproductModal,
		setOpenDeleteSubproductModal,
		subproducts,
		setSubproducts,
	] = productsStore((state) => [
		state.openSubproductsModal,
		state.setSubproductsModal,
		state.selectedProduct,
		state.setOpenSubproductFormModal,
		state.setSelectedSubproduct,
		state.openDeleteSubproductModal,
		state.setOpenDeleteSubproductModal,
		state.subproducts,
		state.setSubproducts,
	]);

	const handleOpenEditSubproductModal = (subproduct: Subproduct) => {
		setSelectedSubproduct(subproduct);
		setOpenSubproductFormModal(true);
	};

	const handleOpenDeleteSubproductModal = (subproduct: Subproduct) => {
		setSelectedSubproduct(subproduct);
		setOpenDeleteSubproductModal(true);
	};

	useEffect(() => {
		if (selectedProduct && openSubproductsModal) {
			const fetchData = async () => {
				try {
					const subproducts = await subproductApi.getSubproductsByProductId(selectedProduct.id);
					setSubproducts(subproducts);
				} catch (error) {
					console.error('Fetch error:', error);
				}
			};
			fetchData();
		}
	}, [selectedProduct, openSubproductsModal, setSubproducts]);

	if (!selectedProduct) {
		return null;
	}

	return (
		<>
			<Dialog open={openSubproductsModal} onOpenChange={setSubproductsModal}>
				<DialogTrigger asChild></DialogTrigger>
				<DialogContent>
					<DialogTitle>{selectedProduct.name} options</DialogTitle>

					{subproducts && subproducts.length > 0 ? (
						<Table className='text-center'>
							<TableHeader>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell>Price</TableCell>
									<TableCell>Available</TableCell>
									<TableCell>Actions</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{subproducts.map((subproduct, index) => (
									<TableRow key={index}>
										<TableCell>{subproduct.name}</TableCell>
										<TableCell>{subproduct.price.toString()}</TableCell>
										<TableCell>{subproduct.available == true ? 'Yes' : 'No'}</TableCell>

										<TableCell className='grid auto-rows-fr content-stretch justify-evenly'>
											<Button
												onClick={() => handleOpenEditSubproductModal(subproduct)}
												variant='outline'
												className='m-1'>
												Edit
											</Button>
											<Button
												onClick={() => handleOpenDeleteSubproductModal(subproduct)}
												variant='outline'
												className='m-1'>
												Delete
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p>No options</p>
					)}
				</DialogContent>
			</Dialog>

			<EditProductOptionModal />

			{openDeleteSubproductModal ? <DeleteSubproductModal /> : null}
		</>
	);
};

export default SubproductsModal;
