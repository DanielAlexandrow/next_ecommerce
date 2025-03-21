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
        <form className={styles.container} data-testid="product-filters">
            <div className={styles.section.price.container} data-testid="price-filter-section">
                <Label>Price Range</Label>
                <div className={styles.section.price.inputs}>
                    <Input
                        type="number"
                        placeholder="Min"
                        {...form.register('minPrice', { valueAsNumber: true })}
                        className={styles.section.price.input}
                        data-testid="min-price-input"
                    />
                    <span>to</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        {...form.register('maxPrice', { valueAsNumber: true })}
                        className={styles.section.price.input}
                        data-testid="max-price-input"
                    />
                </div>
            </div>

            <Separator className={styles.separator} />

            <div className={styles.sort.container} data-testid="sort-filter-section">
                <Label>Sort By</Label>
                <Select
                    onValueChange={(value) => form.setValue('sortBy', value as any)}
                    defaultValue={filters.sortBy}
                    data-testid="sort-select"
                >
                    <SelectTrigger data-testid="sort-trigger">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="price_asc" data-testid="sort-option-price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc" data-testid="sort-option-price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="name_asc" data-testid="sort-option-name-asc">Name: A to Z</SelectItem>
                        <SelectItem value="name_desc" data-testid="sort-option-name-desc">Name: Z to A</SelectItem>
                        <SelectItem value="rating_desc" data-testid="sort-option-rating">Highest Rated</SelectItem>
                        <SelectItem value="newest" data-testid="sort-option-newest">Newest First</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator className={styles.separator} />
        </form>
    );
}