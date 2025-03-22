import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CustomImage } from '@/types';
import { useImageSelect } from './ImageSelect.hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ImageSelectProps {
    productImages: CustomImage[];
    setProductImages: (images: CustomImage[]) => void;
}

const ImageSelect = ({ productImages, setProductImages }: ImageSelectProps) => {
    const { images } = useImageSelect();

    return (
        <div className="flex flex-col space-y-4">
            <Command className="rounded-lg border border-input bg-transparent">
                <CommandInput placeholder="Search images..." className="h-9 text-foreground" />
                <CommandEmpty>No images found.</CommandEmpty>
                <CommandGroup>
                    <ScrollArea className="h-72">
                        <div className="grid grid-cols-2 gap-2 p-2">
                            {images.map((image) => (
                                <CommandItem
                                    key={image.id}
                                    onSelect={() => {
                                        const isSelected = productImages.some(
                                            (selected) => selected.id === image.id
                                        );
                                        if (isSelected) {
                                            setProductImages(
                                                productImages.filter((selected) => selected.id !== image.id)
                                            );
                                        } else {
                                            setProductImages([...productImages, image]);
                                        }
                                    }}
                                    className="flex flex-col items-center justify-center p-2 rounded-md cursor-pointer hover:bg-accent relative"
                                >
                                    <Check
                                        className={cn(
                                            "absolute top-3 right-3 h-4 w-4 text-primary bg-background rounded-full",
                                            productImages.some((selected) => selected.id === image.id)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <img
                                        src={image.full_path}
                                        alt={image.name}
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                    <span className="mt-2 text-sm text-foreground truncate w-full text-center">
                                        {image.name}
                                    </span>
                                </CommandItem>
                            ))}
                        </div>
                    </ScrollArea>
                </CommandGroup>
            </Command>

            <div className="flex flex-wrap gap-2">
                {productImages.map((image, index) => (
                    <Badge
                        key={`${image.id}-${index}`}
                        variant="secondary"
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        onClick={() =>
                            setProductImages(productImages.filter((_, i) => i !== index))
                        }
                    >
                        {image.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
};

export default ImageSelect;
