import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useFilterStore } from '@/stores/store/filterStore';
import debounce from 'lodash/debounce';
import { styles } from './ProductFilters.styles';

export function ProductFilters() {
    const { filters, setFilters } = useFilterStore();
    const form = useForm({
        defaultValues: filters
    });

    const handlePriceChange = debounce((data) => {
        setFilters({ ...filters, ...data });
    }, 500);

    useEffect(() => {
        const subscription = form.watch((data) => {
            handlePriceChange(data);
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    return (
        <form className={styles.container}>
            <div className={styles.section.price.container}>
                <Label>Price Range</Label>
                <div className={styles.section.price.inputs}>
                    <Input
                        type="number"
                        placeholder="Min"
                        {...form.register('minPrice', { valueAsNumber: true })}
                        className={styles.section.price.input}
                    />
                    <span>to</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        {...form.register('maxPrice', { valueAsNumber: true })}
                        className={styles.section.price.input}
                    />
                </div>
            </div>

            <Separator className={styles.separator} />

            <div className={styles.sort.container}>
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

            <Separator className={styles.separator} />
        </form>
    );
}