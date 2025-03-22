import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Brand } from '@/types';
import { useBrandSelect } from './BrandSelect.hooks';

interface BrandSelectProps {
    selectedBrands: Brand[];
    setSelectedBrands: (brands: Brand[]) => void;
}

const BrandSelect = ({ selectedBrands, setSelectedBrands }: BrandSelectProps) => {
    const { brands, open, setOpen } = useBrandSelect();

    return (
        <div className="flex flex-col space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                    >
                        Select brands...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover">
                    <Command className="bg-transparent">
                        <CommandInput placeholder="Search brands..." className="h-9 text-foreground" />
                        <CommandEmpty>No brands found.</CommandEmpty>
                        <CommandGroup>
                            {brands.map((brand) => (
                                <CommandItem
                                    key={brand.id}
                                    onSelect={() => {
                                        setSelectedBrands([brand]);
                                        setOpen(false);
                                    }}
                                    className="text-foreground hover:bg-accent"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedBrands.some(selected => selected.id === brand.id)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {brand.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2">
                {selectedBrands.map((brand) => (
                    <Badge
                        key={brand.id}
                        variant="secondary"
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                        {brand.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
};

export default BrandSelect;
