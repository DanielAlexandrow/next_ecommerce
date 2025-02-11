import { Product, Category, ProductImage, Address, PaymentDetails } from './index';

// Store Components
export interface ProductListProps {
    products?: Product[];
    loading?: boolean;
}

export interface ProductSearchProps {
    categories?: Category[];
    onSearch?: (query: string) => void;
}

export interface CartProps {
    showTotal?: boolean;
}

// Checkout Components
export interface AddressFormProps {
    onSubmit?: (address: Address) => void;
}

export interface PaymentFormProps {
    amount: number;
    onSubmit?: (paymentDetails: PaymentDetails) => void;
}

// Admin Components
export interface BaseProductFormProps {
    onSubmit?: (data: Partial<Product>) => void;
    onCancel?: () => void;
}

export interface NewProductFormProps extends BaseProductFormProps {
    mode: 'new';
    product?: Partial<Product>;
}

export interface EditProductFormProps extends BaseProductFormProps {
    mode: 'edit';
    product: Product;
}

export type ProductFormProps = NewProductFormProps | EditProductFormProps;

export interface ProductListAdminProps {
    products: Product[];
    onDelete?: (id: number) => void;
    onEdit?: (product: Product) => void;
}

export interface ImageUploadProps {
    onUpload?: (image: ProductImage) => void;
    onError?: (error: Error) => void;
    maxFiles?: number;
    accept?: string[];
    multiple?: boolean;
} 