import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageSelect from './ImageSelect';
import { Checkbox } from '../../ui/checkbox';
import CategorySelect from './CategorySelect';
import BrandSelect from './BrandSelect';
import { Product, CustomImage } from '@/types';
import { styles } from './ProductForm.styles';
import { useProductForm } from './ProductForm.hooks';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save, Box, Tag, Bookmark } from "lucide-react"; 
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from 'react';
import { Category, ProductCategory } from '@/types';

// Add a helper function to convert Category[] to ProductCategory[]
const categoriesToProductCategories = (categories: Category[]): ProductCategory[] => {
  return categories.map(category => ({
    ...category,
    pivot: {
      category_id: category.id,
      product_id: 0 // This will be set by the backend
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
        productBrand,
        setProductBrand,
        isSubmitting
    } = useProductForm(mode, product);

    return (
        <Card className="w-full shadow-md">
            <CardHeader className="bg-muted/50">
                <CardTitle className="text-xl font-semibold">
                    {mode === 'edit' ? 'Edit Product' : 'Create New Product'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Box className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-medium">Basic Information</h3>
                                </div>
                                <Separator className="my-2" />
                                
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Product Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Enter product name" 
                                                    className="focus:ring-2 focus:ring-primary/20 transition-all" 
                                                    {...field} 
                                                />
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
                                            <FormLabel className="text-sm font-medium">Description</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Enter product description" 
                                                    className="min-h-[120px] focus:ring-2 focus:ring-primary/20 transition-all" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name='available'
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox 
                                                    checked={field.value} 
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm font-medium">Available for purchase</FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    Make this product available in your store
                                                </p>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-medium">Categories</h3>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="p-4 border rounded-md bg-muted/30">
                                        <CategorySelect
                                            selectedCategories={productCategories as unknown as ProductCategory[]}
                                            setSelectedCategories={setProductCategories as unknown as React.Dispatch<React.SetStateAction<ProductCategory[]>>}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Bookmark className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-medium">Brand</h3>
                                    </div>
                                    <Separator className="my-2" />
                                    <Card className="border shadow-sm">
                                        <CardContent className="pt-6">
                                            <FormField
                                                control={form.control}
                                                name="brand_id"
                                                render={() => (
                                                    <FormItem>
                                                        <BrandSelect
                                                            productBrand={productBrand}
                                                            setProductBrand={setProductBrand}
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            
                                            {form.formState.errors.brand_id && (
                                                <Alert variant="destructive" className="mt-4">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {form.formState.errors.brand_id.message}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-lg font-medium">Product Images</h3>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="p-4 border rounded-md bg-muted/30 mt-4">
                                        <ImageSelect 
                                            productImages={productImages as CustomImage[]} 
                                            setProductImages={setProductImages as React.Dispatch<React.SetStateAction<CustomImage[]>>} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />
                        
                        <div className="flex justify-end">
                            <Button 
                                type="submit" 
                                className="px-8 py-6 text-base font-medium transition-all hover:scale-105"
                                disabled={isSubmitting}
                            >
                                <Save className="mr-2 h-5 w-5" />
                                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default ProductForm;