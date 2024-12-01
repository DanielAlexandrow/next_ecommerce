import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FilterValues, filterSchema, useProductSearchStore } from '@/stores/store/productSearchStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from '@/components/ui/separator';

export const ProductFilters: React.FC = () => {
    const { filters, setFilters, resetFilters } = useProductSearchStore();

    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: filters,
    });

    const onSubmit = (data: FilterValues) => {
        setFilters(data);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                {/* Search Input */}
                <div>
                    <Label>Search Products</Label>
                    <Input
                        placeholder="Search..."
                        {...form.register('name')}
                        className="w-full"
                    />
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                    <Label>Price Range</Label>
                    <div className="pt-2">
                        <Slider
                            defaultValue={[filters.minPrice, filters.maxPrice]}
                            max={1000}
                            step={1}
                            onValueChange={(value) => {
                                form.setValue('minPrice', value[0]);
                                form.setValue('maxPrice', value[1]);
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-2">
                        <Input
                            type="number"
                            placeholder="Min"
                            {...form.register('minPrice', { valueAsNumber: true })}
                            className="w-20"
                        />
                        <Input
                            type="number"
                            placeholder="Max"
                            {...form.register('maxPrice', { valueAsNumber: true })}
                            className="w-20"
                        />
                    </div>
                </div>

                <Separator />

                {/* Sort Options */}
                <div>
                    <Label>Sort By</Label>
                    <Select
                        onValueChange={(value) => form.setValue('sortBy', value as any)}
                        defaultValue={filters.sortBy}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            <SelectItem value="name_asc">Name: A to Z</SelectItem>
                            <SelectItem value="name_desc">Name: Z to A</SelectItem>
                            <SelectItem value="rating_desc">Highest Rated</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {/* Stock Filter */}
                <div className="flex items-center justify-between">
                    <Label>In Stock Only</Label>
                    <Switch
                        checked={filters.inStock}
                        onCheckedChange={(checked) => form.setValue('inStock', checked)}
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                    Apply Filters
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        resetFilters();
                        form.reset(filters);
                    }}
                    className="flex-1"
                >
                    Reset
                </Button>
            </div>
        </form>
    );
}; 