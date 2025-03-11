import axios from 'axios';
import { FilterValues } from '@/stores/store/productSearchStore';
import { toast } from 'react-hot-toast';

const API_URL = '/products';

// Set up interceptor in a function that's called immediately
const setupInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // First check if there's a response object
      if (error && error.response) {
        if (error.response.status === 422) {
          const errorMessages = error.response.data.errors as Record<string, string[]>;
          toast.error(Object.values(errorMessages).flat().join('\n'));
        }
      }
      return Promise.reject(error);
    }
  );
};

// Initialize interceptors
setupInterceptors();

export const productApi = {
  createProduct: async (payload: any) => {
    try {
      // Log the payload for debugging
      console.log('Creating product with data:', payload);
      
      const response = await axios.post(`${API_URL}`, payload);
      return {
        result: response,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating product:', error);
      
      // Detailed error handling
      if (error.response) {
        console.error('Error response:', error.response.data);
        
        // Format validation errors
        if (error.response.data.errors) {
          const validationErrors = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
            
          throw new Error(validationErrors);
        }
        
        // Database error handling
        if (error.response.data.message && error.response.data.message.includes('SQLSTATE')) {
          if (error.response.data.message.includes('brand_id')) {
            throw new Error('Please select a brand for this product');
          }
        }
        
        throw new Error(error.response.data.message || 'Server error occurred');
      }
      
      throw new Error('Failed to create product: Network error');
    }
  },

  updateProduct: async (id: number, payload: any) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, payload);
      return {
        result: response,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating product:', error);
      if (error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors).flat();
        throw new Error(validationErrors.join('\n'));
      }
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

	searchProducts: async (filters: FilterValues) => {
		const response = await axios.get(`/api/products/search`, {
			params: {
				name: filters.name,
				minPrice: filters.minPrice,
				maxPrice: filters.maxPrice,
				sortBy: filters.sortBy,
				category: filters.category,
				rating: filters.rating,
				inStock: filters.inStock
			}
		});
		return response.data;
	},

	async deleteProduct(id: number) {
		const response = await axios.delete(`/products/${id}`);
		return response.data;
	},
};
