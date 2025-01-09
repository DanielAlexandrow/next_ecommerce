import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductForm from '@/components/Admin/ProductForm/ProductForm';
import { useForm } from 'react-hook-form';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import type { Product } from '@/types';
import axios from 'axios';

// Mock child components
vi.mock('@/components/Admin/ProductForm/BrandSelect', () => ({
    default: (): JSX.Element => <div data-testid="mock-brand-select">Brand Select</div>
}));

vi.mock('@/components/Admin/ProductForm/CategorySelect', () => ({
    default: (): JSX.Element => <div data-testid="mock-category-select">Category Select</div>
}));

vi.mock('@/components/Admin/ProductForm/ImageSelect', () => ({
    default: (): JSX.Element => <div data-testid="mock-image-select">Image Select</div>
}));

// Mock axios
vi.mock('axios', () => {
    const mockAxios = {
        get: vi.fn().mockResolvedValue({ data: { categories: [], brands: [] } }),
        post: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Test Product' } }),
        put: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Updated Product' } }),
        create: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({ data: { categories: [], brands: [] } }),
            post: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Test Product' } }),
            put: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Updated Product' } })
        })
    };
    return {
        __esModule: true,
        default: mockAxios
    };
});

const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    available: true,
    images: [],
    categories: [],
    brand: null,
    subproducts: []
} as unknown as Product;

const createBasicMockFormContext = () => ({
    register: vi.fn((name: string) => ({
        name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn()
    })),
    handleSubmit: vi.fn((fn) => (e?: React.BaseSyntheticEvent) => {
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
        dirtyFields: {},
        touchedFields: {},
        defaultValues: {}
    },
    getFieldState: vi.fn((name: string) => ({
        invalid: false,
        isDirty: false,
        isTouched: false,
        error: undefined
    })),
    setValue: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    watch: vi.fn(),
    getValues: vi.fn(),
    reset: vi.fn(),
    control: {
        register: vi.fn(),
        unregister: vi.fn(),
        getFieldState: vi.fn(),
        _formState: {},
        _options: {},
        _names: {
            mount: new Set(),
            unMount: new Set(),
            array: new Set(),
            watch: new Set(),
            disabled: new Set()
        },
        _subjects: {
            watch: { next: vi.fn() },
            array: { next: vi.fn() },
            state: { next: vi.fn() }
        },
        _getWatch: vi.fn(),
        _formValues: {},
        _defaultValues: {}
    }
});

vi.mock('react-hook-form', () => ({
    useForm: vi.fn(() => createBasicMockFormContext()),
    FormProvider: ({ children }: { children: React.ReactNode }): JSX.Element => <>{children}</>,
    Controller: ({ render, name }: { render: Function; name: string }): JSX.Element => render({
        field: {
            onChange: vi.fn(),
            value: '',
            ref: vi.fn(),
            name
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

describe('ProductForm Edge Cases', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form fields correctly', () => {
        render(<ProductForm mode="new" product={mockProduct} />);

        expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
        expect(screen.getByTestId('product-description-input')).toBeInTheDocument();
        expect(screen.getByTestId('product-available-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('mock-brand-select')).toBeInTheDocument();
        expect(screen.getByTestId('mock-category-select')).toBeInTheDocument();
        expect(screen.getByTestId('mock-image-select')).toBeInTheDocument();
    });

    it('handles form submission', async () => {
        const mockSubmit = vi.fn();
        const mockFormContext = {
            ...createBasicMockFormContext(),
            handleSubmit: vi.fn((fn) => (e?: React.BaseSyntheticEvent) => {
                e?.preventDefault?.();
                return mockSubmit(fn(mockProduct));
            })
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);

        render(<ProductForm mode="new" product={mockProduct} />);

        const submitButton = screen.getByTestId('submit-button');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(mockFormContext.handleSubmit).toHaveBeenCalled();
        expect(mockSubmit).toHaveBeenCalled();
    });

    it('handles input changes', async () => {
        const mockSetValue = vi.fn();
        const mockFormContext = {
            ...createBasicMockFormContext(),
            setValue: mockSetValue,
            control: {
                ...createBasicMockFormContext().control,
                _formState: { isDirty: false }
            }
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);

        render(<ProductForm mode="new" product={mockProduct} />);

        const nameInput = screen.getByTestId('product-name-input');
        await act(async () => {
            // Trigger the field.onChange directly through the Controller
            const field = nameInput.closest('div[data-testid="product-name-input"]')!;
            const controller = field.querySelector('input')!;
            fireEvent.change(controller, { target: { value: 'New Product Name' } });
        });

        await waitFor(() => {
            expect(mockSetValue).toHaveBeenCalledWith('name', 'New Product Name');
        });
    });

    it('handles checkbox toggle', async () => {
        const mockSetValue = vi.fn();
        const mockFormContext = {
            ...createBasicMockFormContext(),
            setValue: mockSetValue,
            control: {
                ...createBasicMockFormContext().control,
                _formState: { isDirty: false }
            },
            getValues: vi.fn().mockReturnValue({ available: true })
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);

        render(<ProductForm mode="new" product={mockProduct} />);

        const checkbox = screen.getByTestId('product-available-checkbox');
        await act(async () => {
            // Trigger the onCheckedChange directly through the Controller
            const field = checkbox.closest('div[data-testid="product-available-checkbox"]')!;
            const controller = field.querySelector('button')!;
            fireEvent.click(controller);
        });

        await waitFor(() => {
            expect(mockSetValue).toHaveBeenCalledWith('available', false);
        });
    });

    it('handles form validation errors', async () => {
        const mockSetError = vi.fn();
        const mockFormContext = {
            ...createBasicMockFormContext(),
            setError: mockSetError,
            formState: {
                ...createBasicMockFormContext().formState,
                errors: {
                    name: { type: 'required', message: 'Name is required' },
                    description: { type: 'maxLength', message: 'Description is too long' }
                }
            }
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);

        render(<ProductForm mode="new" product={mockProduct} />);

        expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
        expect(screen.getByTestId('description-error')).toHaveTextContent('Description is too long');
    });

    it('handles API errors during submission', async () => {
        const mockSetError = vi.fn();
        const mockFormContext = {
            ...createBasicMockFormContext(),
            setError: mockSetError,
            handleSubmit: vi.fn((fn) => async (e?: React.BaseSyntheticEvent) => {
                e?.preventDefault?.();
                try {
                    await fn(mockProduct);
                } catch (error) {
                    mockSetError('root', { type: 'manual', message: 'Failed to submit form' });
                }
            })
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);
        vi.mocked(axios.post).mockRejectedValueOnce(new Error('API Error'));

        render(<ProductForm mode="new" product={mockProduct} />);

        const submitButton = screen.getByTestId('submit-button');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(mockSetError).toHaveBeenCalledWith('root', {
            type: 'manual',
            message: 'Failed to submit form'
        });
        expect(screen.getByTestId('form-error')).toBeInTheDocument();
    });

    it('handles form reset after successful submission', async () => {
        const mockReset = vi.fn();
        const mockFormContext = {
            ...createBasicMockFormContext(),
            reset: mockReset
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);
        vi.mocked(axios.post).mockResolvedValueOnce({ data: mockProduct });

        render(<ProductForm mode="new" product={null} />);

        const submitButton = screen.getByTestId('submit-button');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(mockReset).toHaveBeenCalledWith({
            name: '',
            description: '',
            available: true
        });
    });

    it('handles form state during submission', async () => {
        const mockFormContext = {
            ...createBasicMockFormContext(),
            formState: {
                ...createBasicMockFormContext().formState,
                isSubmitting: true
            }
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);

        render(<ProductForm mode="new" product={mockProduct} />);

        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Submitting...');
    });

    it('handles edit mode with existing product data', () => {
        const existingProduct = {
            ...mockProduct,
            name: 'Existing Product',
            description: 'Existing Description',
            available: false
        };

        render(<ProductForm mode="edit" product={existingProduct} />);

        const nameInput = screen.getByTestId('product-name-input');
        const descriptionInput = screen.getByTestId('product-description-input');
        const availableCheckbox = screen.getByTestId('product-available-checkbox');

        expect(nameInput).toHaveValue('Existing Product');
        expect(descriptionInput).toHaveValue('Existing Description');
        expect(availableCheckbox).not.toBeChecked();
    });

    it('handles long text input values', async () => {
        const mockSetValue = vi.fn();
        const mockFormContext = {
            ...createBasicMockFormContext(),
            setValue: mockSetValue
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);

        render(<ProductForm mode="new" product={mockProduct} />);

        const longText = 'a'.repeat(100);
        const descriptionInput = screen.getByTestId('product-description-input');

        await act(async () => {
            fireEvent.change(descriptionInput, { target: { value: longText } });
        });

        await waitFor(() => {
            expect(mockSetValue).toHaveBeenCalledWith('description', longText);
        });
    });

    it('handles special characters in input values', async () => {
        const mockSetValue = vi.fn();
        const mockFormContext = {
            ...createBasicMockFormContext(),
            setValue: mockSetValue
        };

        vi.mocked(useForm).mockReturnValue(mockFormContext as unknown as UseFormReturn<FieldValues>);

        render(<ProductForm mode="new" product={mockProduct} />);

        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const nameInput = screen.getByTestId('product-name-input');

        await act(async () => {
            fireEvent.change(nameInput, { target: { value: specialChars } });
        });

        await waitFor(() => {
            expect(mockSetValue).toHaveBeenCalledWith('name', specialChars);
        });
    });
}); 