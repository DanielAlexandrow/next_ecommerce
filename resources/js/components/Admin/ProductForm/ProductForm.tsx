import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageSelect from './ImageSelect';
import { Checkbox } from '../../ui/checkbox';
import CategorySelect from './CategorySelect';
import BrandSelect from './BrandSelect';
import { Product, CustomImage, Brand } from '@/types';
import { useProductForm } from './ProductForm.hooks';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save, FileText, Tags, Building2 } from "lucide-react"; 
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Category, ProductCategory } from '@/types';
import { styles } from './ProductForm.styles';
import { cn } from '@/lib/utils';

const categoriesToProductCategories = (categories: Category[]): ProductCategory[] => {
    return categories.map(category => ({
        ...category,
        pivot: {
            category_id: category.id,
            product_id: 0
        }
    }));
};

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
        selectedBrands,
        setSelectedBrands,
        isSubmitting
    } = useProductForm(mode, product);

    return (
        <div className={styles.form.wrapper}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className={styles.form.grid}>
                        {/* Left Column */}
                        <div className={styles.section.wrapper}>
                            <div className={styles.section.header}>
                                <FileText className="h-5 w-5 text-gray-700" />
                                <h3 className={styles.section.title}>Basic Information</h3>
                            </div>
                            <Separator className="my-2 bg-gray-200" />
                            
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={styles.formField.label}>Product Name</FormLabel>
                                        <FormControl>
                                            <div data-testid="product-name-input">
                                                <Input 
                                                    placeholder="Enter product name" 
                                                    className={cn(styles.formField.input, "w-full")}
                                                    {...field} 
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className={styles.formField.message} />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name='description'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={styles.formField.label}>Description</FormLabel>
                                        <FormControl>
                                            <div data-testid="product-description-input">
                                                <Textarea 
                                                    placeholder="Enter product description" 
                                                    className={cn(styles.formField.input, "min-h-[120px] w-full")}
                                                    {...field} 
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className={styles.formField.message} />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name='available'
                                render={({ field }) => (
                                    <FormItem className={styles.checkbox.wrapper}>
                                        <FormControl>
                                            <div data-testid="product-available-checkbox">
                                                <Checkbox 
                                                    checked={field.value} 
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                                                />
                                            </div>
                                        </FormControl>
                                        <div className={styles.checkbox.label.wrapper}>
                                            <FormLabel className={styles.checkbox.label.title}>Available for purchase</FormLabel>
                                            <p className={styles.checkbox.label.description}>
                                                Make this product available in your store
                                            </p>
                                        </div>
                                        <FormMessage className={styles.formField.message} />
                                    </FormItem>
                                )}
                            />
                            
                            <div className={styles.section.content}>
                                <div className={styles.section.header}>
                                    <Tags className="h-5 w-5 text-gray-700" />
                                    <h3 className={styles.section.title}>Categories</h3>
                                </div>
                                <Separator className="my-2 bg-gray-200" />
                                <div className={styles.selectors.wrapper}>
                                    <CategorySelect
                                        selectedCategories={productCategories as unknown as ProductCategory[]}
                                        setSelectedCategories={setProductCategories as unknown as React.Dispatch<React.SetStateAction<ProductCategory[]>>}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className={styles.section.wrapper}>
                            <div className={styles.section.content}>
                                <div className={styles.section.header}>
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <h3 className={styles.section.title}>Brand</h3>
                                </div>
                                <Separator className="my-2 bg-border" />
                                <div className={styles.selectors.wrapper}>
                                    <FormField
                                        control={form.control}
                                        name="brand_id"
                                        render={() => (
                                            <FormItem>
                                                <BrandSelect
                                                    selectedBrands={selectedBrands as Brand[]}
                                                    setSelectedBrands={(brands: Brand[]) => setSelectedBrands(brands)}
                                                />
                                                <FormMessage className={styles.formField.message} />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    {form.formState.errors.brand_id && (
                                        <Alert variant="destructive" className="mt-4 bg-red-50 text-red-800 border border-red-200">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {form.formState.errors.brand_id.message}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className={styles.section.header}>
                                    <h3 className={styles.section.title}>Product Images</h3>
                                </div>
                                <Separator className="my-2 bg-gray-200" />
                                <div className={styles.selectors.wrapper}>
                                    <ImageSelect 
                                        productImages={productImages as CustomImage[]} 
                                        setProductImages={setProductImages as React.Dispatch<React.SetStateAction<CustomImage[]>>} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6 bg-gray-200" />
                    
                    <div className={styles.submit.wrapper}>
                        <Button 
                            type="submit"
                            data-testid="submit-button" 
                            className={styles.submit.button}
                            disabled={isSubmitting}
                        >
                            <Save className="mr-2 h-5 w-5" />
                            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ProductForm;