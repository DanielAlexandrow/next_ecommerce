import React, { useState, useEffect } from 'react';
import { TableRow, TableCell, TableBody, Table } from '../../ui/table';
import { IoArrowUp, IoArrowDown } from 'react-icons/io5';
import { Button } from '../../ui/button';
import { ProductImage, CustomImage } from '@/types';
import { imageApi } from '@/api/imageApi';
import { Input } from '../../ui/input';
import Paginate from '@/components/pagination';
import { updateLinks } from '@/lib/utils';

interface ImageSelectProps {
	productImages: CustomImage[];
	setProductImages: React.Dispatch<React.SetStateAction<CustomImage[]>>;
	maxSelected?: number;
}

const ImageSelect: React.FC<ImageSelectProps> = ({ productImages, setProductImages, maxSelected }) => {
	const [availableImages, setAvailableImages] = useState<CustomImage[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [links, setLinks] = useState([]);

	const fetchImages = async (page: number, search: string) => {
		try {
			const response = await imageApi.getImagesPaginated({
				page,
				per_page: 10,
				search
			});
			setAvailableImages(response.data);
			setTotalPages(response.last_page);
			setLinks(updateLinks(response.links, 'name', 'asc'));
		} catch (error) {
			console.error('Failed to fetch images:', error);
		}
	};

	useEffect(() => {
		fetchImages(currentPage, searchTerm);
	}, [currentPage, searchTerm]);

	useEffect(() => {
		setProductImages(productImages);
	}, [productImages]);

	const handleRemoveImage = (image: CustomImage) => {
		const index = productImages.findIndex((pimage) => image.id === pimage.id);
		const newSelectedImages = [...productImages];
		newSelectedImages.splice(index, 1);
		setProductImages(newSelectedImages);
	};

	const handleImageClick = (image: CustomImage, order_num: number) => {
		if (maxSelected && productImages.length >= maxSelected) {
			alert(`You can only select up to ${maxSelected} images.`);
			return;
		}

		const index = productImages.findIndex((pimage) => image.id === pimage.id);
		if (index !== -1) {
			handleRemoveImage(productImages[index]);
			return;
		}

		setProductImages([
			...productImages,
			{
				id: image.id,
				pivot: {
					id: undefined,
					image_id: image.id,
					order_num,
				},
				name: image.name,
				path: image.path,
				full_path: image.full_path
			},
		]);
	};

	const handleOrderUp = (index: number) => {
		const items = Array.from(productImages);
		if (index > 0) {
			const temp = items[index - 1];
			items[index - 1] = items[index];
			items[index] = temp;
			items.forEach((image, index) => {
				image!.pivot!.order_num = index + 1;
			});
			setProductImages(items);
		}
	};

	const handleOrderDown = (index: number) => {
		const items = Array.from(productImages);
		if (index < items.length - 1) {
			const temp = items[index + 1];
			items[index + 1] = items[index];
			items[index] = temp;
			items.forEach((image, index) => {
				image!.pivot!.order_num = index + 1;
			});
			setProductImages(items);
		}
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);  // Update the current page state
	};

	const pages = (
		<div className='mt-4'>
			{links.length > 0 && <Paginate links={links} onPageChange={handlePageChange} />}
		</div>
	);

	return (
		<>
			<div className='text-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-5'>
				Selected Images {maxSelected ? `(${productImages.length}/${maxSelected})` : ''}
			</div>
			{pages}
			{productImages.length > 0 ? (
				<Table>
					<TableBody>
						{productImages.map((image, index) => (
							<TableRow key={image.id}>
								<TableCell>
									<div
										className='text-lg hover:border hover:border-white rounded-sm'
										onClick={() => handleOrderUp(index)}>
										<IoArrowUp className='m-auto' />
									</div>
									<div
										className='text-lg hover:border hover:border-white rounded-sm'
										onClick={() => handleOrderDown(index)}>
										<IoArrowDown className='m-auto' />
									</div>
								</TableCell>
								<TableCell>
									<Button
										className='text-m hover:border hover:border-white rounded-sm'
										onClick={() => handleRemoveImage(image)}
										variant='outline'>
										Remove
									</Button>
								</TableCell>
								<TableCell style={{ userSelect: 'none', pointerEvents: 'none' }}>
									<img
										className='mx-auto'
										style={{
											width: '50px',
											height: '50px',
											userSelect: 'none',
											pointerEvents: 'none',
										}}
										src={image.full_path}
										alt={image.name}
									/>
									<div className='text-center' style={{ userSelect: 'none' }}>
										{image.name}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			) : (
				<div className='italic text-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-5 mt-5'>
					No images selected
				</div>
			)}

			<div className='text-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-5 mt-5'>
				All Images
			</div>

			<Input
				type='text'
				placeholder='Search images...'
				value={searchTerm}
				onChange={handleSearch}
				className='mb-4'
			/>

			<div className='grid grid-cols-4 gap-4' style={{ overflow: 'auto' }}>
				{availableImages.map((image) => (
					<div
						key={image.id}
						onClick={() => handleImageClick(image, productImages.length + 1)}
						title={image.name}
						style={{
							border: productImages.some((selectedImg) => selectedImg.id === image.id)
								? '3px solid #1c2738'
								: 'none',
							borderRadius: productImages.some((selectedImg) => selectedImg.id === image.id)
								? '8px'
								: '0',
						}}
						className='p-2'>
						<img
							style={{
								width: '75px',
								height: '75px',
								margin: 'auto',
							}}
							className='object-cover'
							src={'/storage/' + image.path}
							alt={image?.name}
						/>
						<div className='text-center overflow-hidden text-overflow ellipsis whitespace-nowrap'>
							{image.name}
						</div>
					</div>
				))}
			</div>
			{pages}
		</>
	);
};

export default ImageSelect;





