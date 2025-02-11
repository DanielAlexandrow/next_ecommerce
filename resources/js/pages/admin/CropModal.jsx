import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Point, Area } from 'react-easy-crop';

interface CropModalProps {
    open: boolean;
    onClose: () => void;
    image: string;
    onCropComplete: (croppedAreaPixels: Area | null) => void;
    onUploadOriginal: () => void;
}

const CropModal: React.FC<CropModalProps> = ({ open, onClose, image, onCropComplete, onUploadOriginal }) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteCallback = useCallback(
        (croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleCropConfirm = () => {
        onCropComplete(croppedAreaPixels);
        onClose();
    };

    const handleUploadOriginal = () => {
        onUploadOriginal();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogTitle>Crop Image</DialogTitle>
                <div className="relative w-full h-[300px]">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteCallback}
                    />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <Button onClick={onClose} variant="outline">Cancel</Button>
                    <Button onClick={handleUploadOriginal} variant="outline">Upload Original</Button>
                    <Button onClick={handleCropConfirm}>Upload Cropped</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CropModal;