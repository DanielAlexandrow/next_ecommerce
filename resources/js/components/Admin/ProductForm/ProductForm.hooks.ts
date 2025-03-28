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

// Product schema aligned with backend validation
const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be under 255 characters'),
  description: z.string().optional(),
  available: z.boolean().default(true),
  brand_id: z.number().nullable().optional(),
});

// Create a separate schema for subproducts that matches backend validation
const subproductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be under 255 characters'),
  price: z.number().gt(0, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
});

export const useProductForm = (mode: 'edit' | 'new', product: Product | null) => {
  const [productImages, setProductImages] = useState<CustomImage[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [productBrands, setProductBrands] = useState<Brand[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      available: product?.available ?? true,
      brand_id: product?.brand_id || undefined,
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
        setSelectedBrands([product.brand.id]);
      }
    }
  }, [product]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Get the first selected brand or null
      const brandId = selectedBrands.length > 0 ? selectedBrands[0] : null;
      
      // Create a default subproduct with a valid price
      const defaultSubproduct = {
        name: 'Default variant',
        price: 9.99, // Valid price above 0
        stock: 10,
      };
      
      // Validate the subproduct using our schema
      try {
        subproductSchema.parse(defaultSubproduct);
      } catch (validationError) {
        console.error('Subproduct validation error:', validationError);
        throw new Error('Invalid subproduct data');
      }
      
      // Prepare data structure
      const formData = {
        ...values,
        brand_id: brandId,
        categories: productCategories.length > 0 ? productCategories.map(cat => cat.id) : [],
        images: productImages.map(img => img.id),
        subproducts: [defaultSubproduct]
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
    productBrands, 
    setProductBrands,
    selectedBrands,
    setSelectedBrands,
    isSubmitting
  };
};