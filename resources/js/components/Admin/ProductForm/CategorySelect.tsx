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
import { ProductCategory } from '@/types';
import { useCategorySelect } from './CategorySelect.hooks';

interface CategorySelectProps {
    selectedCategories: ProductCategory[];
    setSelectedCategories: (categories: ProductCategory[]) => void;
}

const CategorySelect = ({ selectedCategories, setSelectedCategories }: CategorySelectProps) => {
    const { categories, open, setOpen } = useCategorySelect();

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
                        Select categories...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover">
                    <Command className="bg-transparent">
                        <CommandInput placeholder="Search categories..." className="h-9 text-foreground" />
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                            {categories.map((category) => (
                                <CommandItem
                                    key={category.id}
                                    onSelect={() => {
                                        const isSelected = selectedCategories.some(
                                            (selected) => selected.id === category.id
                                        );
                                        if (isSelected) {
                                            setSelectedCategories(
                                                selectedCategories.filter((selected) => selected.id !== category.id)
                                            );
                                        } else {
                                            setSelectedCategories([...selectedCategories, category]);
                                        }
                                    }}
                                    className="text-foreground hover:bg-accent"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCategories.some(
                                                (selected) => selected.id === category.id
                                            )
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {category.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                    <Badge
                        key={category.id}
                        variant="secondary"
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        onClick={() =>
                            setSelectedCategories(
                                selectedCategories.filter((c) => c.id !== category.id)
                            )
                        }
                    >
                        {category.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
};

export default CategorySelect;
