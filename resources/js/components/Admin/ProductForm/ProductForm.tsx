import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageSelect from './ImageSelect';
import { Checkbox } from '../../ui/checkbox';
import CategorySelect from './CategorySelect';
import BrandSelect from './BrandSelect';
import { Product } from '@/types';
import { styles } from './ProductForm.styles';
import { useProductForm } from './ProductForm.hooks';

interface ProductFormProps {
    mode: 'edit' | 'new';
    product: Product | null;
}

const ProductForm = ({ mode, product }: ProductFormProps): React.ReactNode => {
    const {
        form,
        onSubmit,
        productImages,
        setProductImages,
        productCategories,
        setProductCategories,
        productBrand,
        setProductBrand
    } = useProductForm(mode, product);

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className={styles.container.flex}>
                    <div className={styles.column.left}>
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='available'
                            render={({ field }) => (
                                <FormItem className={styles.checkbox.container}>
                                    <FormLabel>Available</FormLabel>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <CategorySelect
                            selectedCategories={productCategories}
                            setSelectedCategories={setProductCategories}
                        />
                        <Button type='submit' className={styles.submit}>
                            Submit
                        </Button>
                    </div>
                    <div className={styles.column.right}>
                        <ImageSelect productImages={productImages} setProductImages={setProductImages} />
                        <div className={styles.brand.container}>
                            <div className={styles.brand.label}>
                                Brand
                            </div>
                            <BrandSelect
                                productBrand={productBrand}
                                setProductBrand={setProductBrand}
                            />
                        </div>
                    </div>
                </form>
            </Form>
        </>
    );
};

export default ProductForm;