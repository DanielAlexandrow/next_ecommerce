import { Dialog, DialogContent, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import React from 'react';
import { Image } from '@/types';

interface ImageModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	image: Image | null;
}

export default function ImageModal({ open, setOpen, image }: ImageModalProps) {
	if (!image) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogDescription style={{ padding: '20px' }}>
					<img src={'storage/' + image.path} alt={image?.name} />
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}
