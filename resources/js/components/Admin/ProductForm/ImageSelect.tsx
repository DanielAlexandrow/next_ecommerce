import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import { CustomImage } from '@/types';
import { styles } from './ImageSelect.styles';
import { imageApi } from '@/api/imageApi';
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

	const handleRemoveImage = (imageId: number) => {
		const index = productImages.findIndex((pimage) => imageId === pimage.id);
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
			handleRemoveImage(productImages[index].id);
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
		<div>
			{links.length > 0 && <Paginate links={links} onPageChange={handlePageChange} />}
		</div>
	);

	return (
		<>
			<div className={styles.titleText}>
				Selected Images {maxSelected ? `(${productImages.length}/${maxSelected})` : ''}
			</div>
			{pages}
			{productImages.length > 0 ? (
				<Table>
						<TableHeader>
						<TableRow>
							<TableCell>Preview</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{productImages.map((image, index) => (
							<TableRow key={image.id}>
								<TableCell>
									<img
										src={image.full_path}
										alt={image.name}
										style={{ width: '50px', height: '50px', objectFit: 'cover' }}
									/>
								</TableCell>
								<TableCell>
									<div data-testid={`selected-image-name-${image.id}`} className={styles.imageName}>
										{image.name}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											data-testid={`move-up-${image.id}`}
											variant="outline"
											size="sm"
											onClick={() => handleOrderUp(index)}
											disabled={index === 0}
										>
											↑
										</Button>
										<Button
											data-testid={`move-down-${image.id}`}
											variant="outline"
											size="sm"
											onClick={() => handleOrderDown(index)}
											disabled={index === productImages.length - 1}
										>
											↓
										</Button>
										<Button
											data-testid={`remove-image-${image.id}`}
											variant="outline"
											size="sm"
											onClick={() => handleRemoveImage(image.id)}
										>
											X
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			) : (
				<div data-testid="no-images-message" className={styles.noImagesMessage}>
					No images selected
				</div>
			)}

			<div className={styles.titleText}>
				All Images
			</div>

			<Input
				data-testid="image-upload-input"
				type='text'
				placeholder='Search images...'
				value={searchTerm}
				onChange={handleSearch}
				className={styles.searchInput}
			/>

			<div className={styles.imageGrid}>
				{availableImages.map((image) => (
					<div
						data-testid={`image-option-${image.id}`}
						key={image.id}
						onClick={() => handleImageClick(image, productImages.length + 1)}
						title={image.name}
						className={styles.imageOption(productImages.some((selectedImg) => selectedImg.id === image.id))}
					>
						<img
							data-testid={`image-preview-${image.id}`}
							src={'/storage/' + image.path}
							alt={image?.name}
						/>
						<div data-testid={`image-name-${image.id}`} className={styles.imageName}>
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
