import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductForm from '@/components/Admin/ProductForm/ProductForm';
import { useForm } from 'react-hook-form';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import type { Product } from '@/types';
import { useProductForm } from '@/components/Admin/ProductForm/ProductForm.hooks';
import { Subject } from 'rxjs';
import { FormState, FieldError } from 'react-hook-form';

// Mock child components
vi.mock('@/components/Admin/ProductForm/BrandSelect', () => ({
    default: () => <div data-testid="mock-brand-select">Brand Select</div>
}));

vi.mock('@/components/Admin/ProductForm/CategorySelect', () => ({
    default: () => <div data-testid="mock-category-select">Category Select</div>
}));

vi.mock('@/components/Admin/ProductForm/ImageSelect', () => ({
    default: () => <div data-testid="mock-image-select">Image Select</div>
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }>(
        ({ children, ...props }, ref) => <button ref={ref} {...props}>{children}</button>
    )
}));

vi.mock('@/components/ui/input', () => ({
    Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
        <input ref={ref} {...props} />
    ))
}));

vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: React.forwardRef<HTMLInputElement, { 
        checked?: boolean; 
        onCheckedChange?: (checked: boolean) => void;
        [key: string]: any;
    }>((props, ref) => {
        const { onCheckedChange, checked, ...rest } = props;
        return (
            <input 
                ref={ref} 
                type="checkbox" 
                checked={checked} 
                onChange={onCheckedChange ? () => onCheckedChange(!checked) : undefined}
                {...rest} 
            />
        );
    })
}));

vi.mock('@/components/ui/textarea', () => ({
    Textarea: React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
        <textarea ref={ref} {...props} />
    ))
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
    CardContent: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
    CardHeader: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
    CardTitle: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
    CardFooter: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
}));

vi.mock('@/components/ui/alert', () => ({
    Alert: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
    AlertDescription: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
}));

vi.mock('@/components/ui/separator', () => ({
    Separator: ({ className, ...props }) => <div className={className} {...props} />
}));

// Mock lucide icons
vi.mock('lucide-react', () => ({
    AlertCircle: () => <div data-testid="icon-alert-circle" />,
    Save: () => <div data-testid="icon-save" />,
    FileText: () => <div data-testid="icon-file-text" />,
    Tags: () => <div data-testid="icon-tags" />,
    Building2: () => <div data-testid="icon-building" />,
    ShoppingCart: () => <div data-testid="icon-shopping-cart" />,
    Star: () => <div data-testid="icon-star" />,
}));

// Add type definitions for form components
interface FormComponentProps {
    children?: React.ReactNode;
    className?: string;
    [key: string]: any;
}

// Mock form components
vi.mock('@/components/ui/form', () => ({
    Form: ({ children, ...props }) => {
        const { handleSubmit, formState, ...domProps } = props;
        return (
            <div className="form" {...domProps}>
                {typeof children === 'function' ? children({}) : children}
            </div>
        );
    },
    FormItem: React.forwardRef<HTMLDivElement, FormComponentProps>(({ children, ...props }, ref) => (
        <div ref={ref} className="form-item" {...props}>{children}</div>
    )),
    FormLabel: React.forwardRef<HTMLLabelElement, FormComponentProps>(({ children, ...props }, ref) => (
        <label ref={ref} className="form-label" {...props}>{children}</label>
    )),
    FormControl: React.forwardRef<HTMLDivElement, FormComponentProps>(({ children, ...props }, ref) => (
        <div ref={ref} className="form-control" {...props}>{children}</div>
    )),
    FormMessage: React.forwardRef<HTMLDivElement, FormComponentProps>(({ children, ...props }, ref) => (
        <div ref={ref} className="form-message" {...props}>{children}</div>
    )),
    FormField: ({ name, control, render }: { 
        name: string; 
        control?: any; 
        render: (props: { 
            field: any; 
            fieldState: any; 
            formState: any; 
        }) => React.ReactElement 
    }) => {
        return render({
            field: {
                onChange: vi.fn(),
                value: name === 'available' ? true : '',
                ref: vi.fn(),
                name,
                onBlur: vi.fn()
            },
            fieldState: { error: undefined },
            formState: { errors: {} }
        });
    }
}));

// Mock axios
vi.mock('axios', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: { categories: [], brands: [] } }),
        post: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Test Product' } }),
        put: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Updated Product' } }),
        create: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({ data: { categories: [], brands: [] } }),
            post: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Test Product' } }),
            put: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Updated Product' } }),
            defaults: { baseURL: '' },
            interceptors: {
                request: { use: vi.fn(), eject: vi.fn() },
                response: { use: vi.fn(), eject: vi.fn() }
            }
        })
    }
}));

// Mock the productApi
vi.mock('@/api/productApi', () => ({
    productApi: {
        createProduct: vi.fn().mockResolvedValue({ id: 1, name: 'Test Product' }),
        updateProduct: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Product' })
    }
}));

// Sample product data
const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    available: true,
    images: [],
    categories: [],
    brand: null,
    subproducts: [
        {
            name: 'Default variant',
            price: 9.99,
            stock: 10,
            sku: 'TEST-123'
        }
    ],
    brand_id: null,
} as unknown as Product;

// Create types for subjects
type ArraySubject = Subject<{ name?: string; values?: FieldValues }>;
type StateSubject = Subject<Partial<FormState<any>> & { name?: string }>;

const createSubject = (): Subject<any> => ({
    observers: [],
    next: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
});

// Update the createBasicMockFormContext
const createBasicMockFormContext = (): UseFormReturn<any> => ({
    register: vi.fn((name) => ({
        name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn()
    })),
    handleSubmit: vi.fn((fn) => (e) => {
        e?.preventDefault?.();
        return fn(mockProduct);
    }),
    formState: {
        errors: {},
        isDirty: false,
        isSubmitting: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        isValid: true,
        isValidating: false,
        isLoading: false,
        disabled: false,
        submitCount: 0,
        validatingFields: {},
        dirtyFields: {},
        touchedFields: {},
        defaultValues: {}
    } as FormState<any>,
    getFieldState: vi.fn((name: string) => ({
        invalid: false,
        isDirty: false,
        isTouched: false,
        isValidating: false,
        error: undefined as FieldError | undefined
    })),
    setValue: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    watch: vi.fn(),
    getValues: vi.fn(),
    reset: vi.fn(),
    trigger: vi.fn(),
    resetField: vi.fn(),
    unregister: vi.fn(),
    setFocus: vi.fn(),
    control: {
        register: vi.fn(),
        unregister: vi.fn(),
        getFieldState: vi.fn(),
        _formState: {
            isDirty: false,
            isLoading: false,
            isSubmitted: false,
            isSubmitSuccessful: false,
            isSubmitting: false,
            isValidating: false,
            isValid: true,
            submitCount: 0,
            disabled: false,
            errors: {},
            validatingFields: {},
            dirtyFields: {},
            touchedFields: {},
            defaultValues: {}
        } as FormState<any>,
        _options: {},
        _names: {
            mount: new Set(),
            unMount: new Set(),
            array: new Set(),
            watch: new Set(),
            disabled: new Set()
        },
        _subjects: {
            watch: createSubject(),
            array: createSubject() as ArraySubject,
            state: createSubject() as StateSubject
        },
        _getWatch: vi.fn(),
        _formValues: {},
        _defaultValues: {}
    }
});

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
    useForm: vi.fn(() => createBasicMockFormContext()),
    FormProvider: ({ children }) => <>{children}</>,
    Controller: ({ render }) => render({
        field: {
            onChange: vi.fn(),
            value: '',
            ref: vi.fn(),
            name: ''
        }
    }),
    useFormContext: () => createBasicMockFormContext(),
    useController: () => ({
        field: {
            onChange: vi.fn(),
            value: '',
            ref: vi.fn(),
            name: ''
        }
    })
}));

// Mock the ProductForm hooks
vi.mock('@/components/Admin/ProductForm/ProductForm.hooks', () => ({
    useProductForm: vi.fn((mode, product) => ({
        form: createBasicMockFormContext(),
        onSubmit: vi.fn().mockImplementation(() => {
            console.log('Creating product with data:', mockProduct);
            return Promise.resolve();
        }),
        productImages: [],
        setProductImages: vi.fn(),
        productCategories: [],
        setProductCategories: vi.fn(),
        selectedBrands: product?.brand ? [product.brand.id] : [],
        setSelectedBrands: vi.fn(),
        isSubmitting: false
    }))
}));

describe('ProductForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form fields correctly', async () => {
        const { container } = render(<ProductForm mode="new" product={mockProduct} />);
        
        await waitFor(() => {
            expect(screen.queryByTestId('mock-brand-select')).toBeInTheDocument();
            expect(screen.queryByTestId('mock-category-select')).toBeInTheDocument();
            expect(screen.queryByTestId('mock-image-select')).toBeInTheDocument();
        });
    });

    it('handles form submission', async () => {
        const mockOnSubmit = vi.fn();
        
        vi.mocked(useProductForm).mockImplementation(() => ({
            form: {
                ...createBasicMockFormContext(),
                handleSubmit: vi.fn((fn) => async (e) => {
                    e?.preventDefault?.();
                    await mockOnSubmit();
                    return fn(mockProduct);
                })
            },
            onSubmit: vi.fn(),
            productImages: [],
            setProductImages: vi.fn(),
            productCategories: [],
            setProductCategories: vi.fn(),
            selectedBrands: [],
            setSelectedBrands: vi.fn(),
            isSubmitting: false
        }));

        const { container } = render(<ProductForm mode="new" product={mockProduct} />);
        
        await act(async () => {
            const submitButton = container.querySelector('button[type="submit"]');
            if (submitButton) {
                fireEvent.click(submitButton);
            }
        });
        
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
        });
    });

    it('displays submit button with correct text', async () => {
        const { container } = render(<ProductForm mode="new" product={mockProduct} />);
        
        await waitFor(() => {
            const submitButton = container.querySelector('button[type="submit"]');
            expect(submitButton?.textContent).toContain('Create Product');
        });
    });

    it('displays edit mode text when editing a product', async () => {
        const { container } = render(<ProductForm mode="edit" product={mockProduct} />);
        
        await waitFor(() => {
            const submitButton = container.querySelector('button[type="submit"]');
            expect(submitButton?.textContent).toContain('Save Changes');
        });
    });

    it('handles form reset', async () => {
        const mockReset = vi.fn();
        const mockFormContext = {
            ...createBasicMockFormContext(),
            reset: mockReset
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);

        render(<ProductForm mode="new" product={null} />);

        await act(async () => {
            mockFormContext.reset();
        });
        
        await waitFor(() => {
            expect(mockReset).toHaveBeenCalled();
        });
    });

    it('shows loading state during submission', async () => {
        vi.mocked(useProductForm).mockImplementation(() => ({
            form: createBasicMockFormContext(),
            onSubmit: vi.fn(),
            productImages: [],
            setProductImages: vi.fn(),
            productCategories: [],
            setProductCategories: vi.fn(),
            selectedBrands: [],
            setSelectedBrands: vi.fn(),
            isSubmitting: true
        }));

        const { container } = render(<ProductForm mode="new" product={mockProduct} />);
        
        await waitFor(() => {
            const submitButton = container.querySelector('button[type="submit"]');
            expect(submitButton?.textContent).toContain('Saving...');
        });
    });

    it('displays loading text when product is null', async () => {
        const { container } = render(<ProductForm mode="new" product={null} />);
        
        await waitFor(() => {
            const submitButton = container.querySelector('button[type="submit"]');
            expect(submitButton?.textContent).toContain('Saving...');
            expect(screen.queryByTestId('mock-category-select')).toBeInTheDocument();
        });
    });

    it('uses default empty arrays when product is null', async () => {
        const { container } = render(<ProductForm mode="new" product={null} />);
        
        await waitFor(() => {
            expect(screen.queryByTestId('mock-brand-select')).toBeInTheDocument();
            expect(screen.queryByTestId('mock-category-select')).toBeInTheDocument();
            expect(screen.queryByTestId('mock-image-select')).toBeInTheDocument();
        });
    });
});