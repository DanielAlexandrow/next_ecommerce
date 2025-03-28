import { ChangeEvent, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-toastify';
import ImageModal from '@/components/Admin/ImageModal/ImageModal';
import { AdminLayout } from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Link, usePage } from '@inertiajs/react';
import Paginate from '@/components/pagination';
import { updateLinks } from '@/lib/utils';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import moment from 'moment';
import { router } from '@inertiajs/react';
import { Point, Area } from 'react-easy-crop';
import { CustomImage } from "@/types";
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';
import { debounce } from 'lodash';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { imageApi } from '@/api/imageApi';
import CropModal from './CropModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Page, PageProps } from '@inertiajs/inertia';
import type { Image } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface CustomPageProps extends PageProps {
    links: PaginationLink[];
    images: CustomImage[];
    [key: string]: unknown;
}

const UploadPageContent = () => {
    const [images, setImages] = useState<CustomImage[]>([]);
    const [modalImage, setModalImage] = useState<CustomImage | null>(null);
    const [open, setOpen] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const { sortConfig, getSortedUrl } = useTableSort({ key: 'name', direction: 'asc' });
    const { links } = usePage<CustomPageProps>().props;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);

    const handleSearch = debounce(async (value: string) => {
        try {
            await router.visit('/images', {
                method: 'get',
                data: { search: value, sortkey: sortConfig.key, sortdirection: sortConfig.direction },
                preserveState: true,
                preserveScroll: true,
                only: ['images'],
            });
        } catch (error) {
            console.error('Search failed:', error);
        }
    }, 300); // 300ms debounce

    const onImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.target;
        if (!fileInput.files || fileInput.files.length === 0) {
            console.warn('No file was chosen');
            return;
        }
        const file = fileInput.files[0];
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setCroppedImage(reader.result as string);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await imageApi.uploadImage(formData);
            if (response.success) {
                toast.success(response.message);
                setImages((prev) => [...prev, response.data]);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Something went wrong, check your console.');
            console.error(error);
        }
    };


    const onCropComplete = async (croppedAreaPixels: Area | null) => {
        if (selectedFile && croppedImage && croppedAreaPixels) {
            const croppedFile = await getCroppedImg(croppedImage, croppedAreaPixels);
            if (croppedFile) {
                await uploadImage(croppedFile);
            }
        }
        setSelectedFile(null);
        setCroppedImage(null);
    };

    const onUploadOriginal = async () => {
        if (selectedFile) {
            await uploadImage(selectedFile);
        }
        setSelectedFile(null);
        setCroppedImage(null);
    };

    const tableFields = (
        <TableRow>
            <TableCell>Image</TableCell>
            <TableCell>
                <SortableHeader
                    label="Name"
                    sortKey="name"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Uploaded At"
                    sortKey="created_at"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>Actions</TableCell>
        </TableRow>
    );

    return (
        <div className='m-w[800px]'>
            <h1 className='text-center'>Images</h1>

            <Input type='file' className='mt-5' onChange={onImageFileChange} />

            <Input type='text' className='mt-5' onChange={(e) => handleSearch(e.target.value)} placeholder='Search by name' />
            <div className='mt-10'>{<Paginate links={links} />}</div>
            <Table className='text-center'>
                <TableHeader>{tableFields}</TableHeader>
                <TableBody>
                    {images?.map((image) => (
                        <TableRow key={image.id}>
                            <TableCell
                                onClick={() => {
                                    setModalImage(image);
                                    setOpen(true);
                                }}>
                                <img
                                    src={image.full_path}
                                    alt={image?.name}
                                    className='max-w-[100px] max-h-[100px]'
                                />
                            </TableCell>
                            <TableCell>{image.name}</TableCell>
                            <TableCell>
                                { image.created_at ? moment(image.created_at).format('HH:mm DD.MM.YYYY') : '-' }
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setModalImage(image);
                                                setOpenDeleteModal(true);
                                            }}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div>{<Paginate links={links} />}</div>
            <DeleteConfirmationDialog
                image={modalImage}
                setImages={setImages}
                setSelectedImage={setModalImage}
                openDeleteModal={openDeleteModal}
                setOpenDeleteModal={setOpenDeleteModal}
            />
            <ImageModal 
                open={open} 
                setOpen={setOpen} 
                image={modalImage ? {
                    id: modalImage.id,
                    name: modalImage.name || '',
                    path: modalImage.full_path || ''
                } as Image : null} 
            />

            <CropModal
                open={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                image={croppedImage || ''}
                onCropComplete={onCropComplete}
                onUploadOriginal={onUploadOriginal}
            />
        </div>
    );
}

function DeleteConfirmationDialog({ 
    image, 
    setImages, 
    setSelectedImage, 
    openDeleteModal, 
    setOpenDeleteModal 
}: {
    image: CustomImage | null;
    setImages: (fn: (prev: CustomImage[]) => CustomImage[]) => void;
    setSelectedImage: (image: CustomImage | null) => void;
    openDeleteModal: boolean;
    setOpenDeleteModal: (open: boolean) => void;
}) {
    if (!openDeleteModal) {
        return null;
    }

    if (!image) {
        console.error('DeleteConfirmationDialog: Image data is required but was not provided');
        return (
            <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                <DialogContent>
                    <DialogTitle>Error</DialogTitle>
                    <DialogDescription>Cannot delete image: Missing image data</DialogDescription>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setOpenDeleteModal(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const deleteImage = async (id: number) => {
        if (!id) {
            console.error('DeleteConfirmationDialog: Cannot delete image with null ID');
            return;
        }

        try {
            const response = await imageApi.deleteImage(id);
            if (response.status !== 204) {
                throw new Error('Unexpected response status: ' + response.status);
            }
            
            setImages(prev => prev.filter(img => img.id !== id));
            toast.success(response.headers['x-message'] || 'Image deleted successfully');
        } catch (error) {
            console.error('Failed to delete image:', error);
            toast.error('Failed to delete image. Please try again.');
        }
        
        setOpenDeleteModal(false);
        setSelectedImage(null);
    };

    const handleCancel = () => {
        setOpenDeleteModal(false);
        setSelectedImage(null);
    };

    return (
        <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
            <DialogContent>
                <DialogTitle>Delete Confirmation</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete "{image.name || 'Unnamed image'}"?
                    This action cannot be undone.
                </DialogDescription>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={() => deleteImage(image.id)}>Delete</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', (error) => reject(error));
		image.setAttribute('crossOrigin', 'anonymous');
		image.src = url;
	});


const getCroppedImg = async (
	imageSrc: string,
	pixelCrop: Area
): Promise<File | null> => {
	const image = await createImage(imageSrc);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return null;
	}

	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;

	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height
	);

	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
			} else {
				resolve(null);
			}
		}, 'image/jpeg');
	});
};


export default function UploadPage() {
    return (
        <ErrorBoundary>
            <UploadPageContent />
        </ErrorBoundary>
    );
}

UploadPage.layout = (page: any) => <AdminLayout children={page} />;