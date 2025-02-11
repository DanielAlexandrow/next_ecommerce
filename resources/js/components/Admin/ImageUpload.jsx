import React from 'react';
import { ImageUploadProps } from '@/types/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/Label';

export default function ImageUpload({
    onUpload,
    onError,
    maxFiles = 1,
    accept = ['image/jpeg', 'image/png'],
    multiple = false
}: ImageUploadProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files?.length) return;

        if (files.length > maxFiles) {
            onError?.(new Error(`Maximum ${maxFiles} files allowed`));
            return;
        }

        try {
            // In a real app, you would upload the file to your server here
            // For now, we'll just simulate the upload
            const formData = new FormData();
            formData.append('file', files[0]);

            // Simulate API call
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onUpload?.(data);
        } catch (error) {
            onError?.(error instanceof Error ? error : new Error('Upload failed'));
        }

        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept={accept.join(',')}
                    onChange={handleFileChange}
                    multiple={multiple}
                    aria-label="upload image"
                />
            </div>
            <div className="text-sm text-gray-500">
                {`Accepted formats: ${accept.join(', ')}`}
                <br />
                {`Maximum files: ${maxFiles}`}
            </div>
        </div>
    );
} 