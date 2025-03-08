import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Product, Category, CustomImage, Brand, ProductImage } from '@/types';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';
import { productApi } from '@/api/productApi';

// Helper function to convert ProductImage to CustomImage
const convertToCustomImage = (image: ProductImage): CustomImage => ({
  id: image.id,
  name: image.name,
  path: image.path,
  full_path: 'storage/' + image.path,
  pivot: {
    image_id: image.id,
    order_num: image.pivot?.order || 0
  }
});

// Update schema to make brand_id optional
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  available: z.boolean().default(true),
  brand_id: z.number().nullable().optional(), // Make brand_id optional
});

export const useProductForm = (mode: 'edit' | 'new', product: Product | null) => {
  const [productImages, setProductImages] = useState<CustomImage[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [productBrand, setProductBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      available: product?.available ?? true,
      brand_id: product?.brand_id || undefined, // Initialize properly
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        available: product.available,
        brand_id: product.brand_id || undefined,
      });
      
      if (product.images) {
        setProductImages(product.images.map(convertToCustomImage));
      }
      
      if (product.categories) {
        setProductCategories(product.categories);
      }
      
      if (product.brand) {
        setProductBrand(product.brand);
      }
    }
  }, [product]);

  // Update brand_id when productBrand changes
  useEffect(() => {
    if (productBrand) {
      form.setValue('brand_id', productBrand.id);
    } else {
      form.setValue('brand_id', undefined);
    }
  }, [productBrand]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare data structure
      const formData = {
        ...values,
        brand_id: productBrand?.id || null, // Allow null brand_id
        categories: productCategories.length > 0 ? productCategories.map(cat => cat.id) : [], // Empty array if no categories
        images: productImages.map(img => img.id),
        subproducts: [
          {
            name: 'Default variant',
            price: 0,
            stock: 10,
            sku: `${values.name.substring(0, 3)}-${Date.now()}`
          }
        ]
      };

      // API call based on mode
      let response;
      if (mode === 'new') {
        response = await productApi.createProduct(formData);
        toast.success('Product created successfully!');
        router.visit('/products');
      } else if (mode === 'edit' && product) {
        response = await productApi.updateProduct(product.id, formData);
        toast.success('Product updated successfully!');
      }

      return response;
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    productImages,
    setProductImages,
    productCategories,
    setProductCategories,
    productBrand,
    setProductBrand,
    isSubmitting
  };
};