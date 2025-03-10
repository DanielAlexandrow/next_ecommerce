import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageSelect from './ImageSelect';
import { Checkbox } from '../../ui/checkbox';
import CategorySelect from './CategorySelect';
import BrandSelect from './BrandSelect';
import { Product, CustomImage } from '@/types';
import { useProductForm } from './ProductForm.hooks';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save, FileText, Tags, Building2 } from "lucide-react"; 
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
        selectedBrands,
        setSelectedBrands,
        isSubmitting
    } = useProductForm(mode, product);

    return (
        <Card className="w-full border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900">
                    {mode === 'edit' ? 'Edit Product' : 'Create New Product'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="h-5 w-5 text-gray-700" />
                                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                                </div>
                                <Separator className="my-2 bg-gray-200" />
                                
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-900">Product Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Enter product name" 
                                                    className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-600" />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name='description'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-900">Description</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Enter product description" 
                                                    className="min-h-[120px] border-gray-300 focus:border-black focus:ring-1 focus:ring-black" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-600" />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name='available'
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-gray-200 p-4">
                                            <FormControl>
                                                <Checkbox 
                                                    checked={field.value} 
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900" 
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm font-medium text-gray-900">Available for purchase</FormLabel>
                                                <p className="text-sm text-gray-600">
                                                    Make this product available in your store
                                                </p>
                                            </div>
                                            <FormMessage className="text-red-600" />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Tags className="h-5 w-5 text-gray-700" />
                                        <h3 className="text-lg font-medium text-gray-900">Categories</h3>
                                    </div>
                                    <Separator className="my-2 bg-gray-200" />
                                    <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
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
                                        <Building2 className="h-5 w-5 text-gray-700" />
                                        <h3 className="text-lg font-medium text-gray-900">Brand</h3>
                                    </div>
                                    <Separator className="my-2 bg-gray-200" />
                                    <Card className="border border-gray-200 shadow-sm">
                                        <CardContent className="pt-6">
                                            <FormField
                                                control={form.control}
                                                name="brand_id"
                                                render={() => (
                                                    <FormItem>
                                                        <BrandSelect
                                                            selectedBrands={selectedBrands}
                                                            setSelectedBrands={setSelectedBrands}
                                                        />
                                                        <FormMessage className="text-red-600" />
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
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
                                    </div>
                                    <Separator className="my-2 bg-gray-200" />
                                    <div className="p-4 border border-gray-200 rounded-md bg-gray-50 mt-4">
                                        <ImageSelect 
                                            productImages={productImages as CustomImage[]} 
                                            setProductImages={setProductImages as React.Dispatch<React.SetStateAction<CustomImage[]>>} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6 bg-gray-200" />
                        
                        <div className="flex justify-end">
                            <Button 
                                type="submit" 
                                className="px-8 py-2 bg-gray-900 hover:bg-black text-white transition-all"
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