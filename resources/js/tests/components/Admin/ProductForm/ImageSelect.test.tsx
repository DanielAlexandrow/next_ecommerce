import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ImageSelect from '@/components/Admin/ProductForm/ImageSelect';
import { imageApi } from '@/api/imageApi';
import { CustomImage } from '@/types';

// Mock the imageApi
vi.mock('@/api/imageApi', () => ({
    imageApi: {
        getImagesPaginated: vi.fn().mockResolvedValue({
            data: [
                {
                    id: 1,
                    name: 'test-image-1.jpg',
                    path: 'images/test-image-1.jpg',
                    full_path: '/storage/images/test-image-1.jpg'
                },
                {
                    id: 2,
                    name: 'test-image-2.jpg',
                    path: 'images/test-image-2.jpg',
                    full_path: '/storage/images/test-image-2.jpg'
                }
            ],
            last_page: 1,
            links: []
        })
    }
}));

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Add it to the global object
vi.stubGlobal('ResizeObserver', mockResizeObserver);

describe('ImageSelect', () => {
    it('displays "No images selected" when no images are selected', async () => {
        await act(async () => {
            render(
                <ImageSelect
                    productImages={[]}
                    setProductImages={vi.fn()}
                />
            );
        });

        expect(screen.getByTestId('no-images-message')).toHaveTextContent('No images selected');
    });

    it('displays available images from the API', async () => {
        await act(async () => {
            render(
                <ImageSelect
                    productImages={[]}
                    setProductImages={vi.fn()}
                />
            );
        });

        const image1 = await screen.findByTestId('image-option-1');
        const image2 = await screen.findByTestId('image-option-2');

        expect(image1).toBeInTheDocument();
        expect(image2).toBeInTheDocument();
    });

    it('allows searching for images', async () => {
        await act(async () => {
            render(
                <ImageSelect
                    productImages={[]}
                    setProductImages={vi.fn()}
                />
            );
        });

        const searchInput = screen.getByTestId('image-upload-input');

        await act(async () => {
            fireEvent.change(searchInput, { target: { value: 'test-search' } });
        });

        expect(imageApi.getImagesPaginated).toHaveBeenCalledWith(
            expect.objectContaining({
                search: 'test-search'
            })
        );
    });

    it('allows selecting and deselecting images', async () => {
        const setProductImages = vi.fn();

        await act(async () => {
            render(
                <ImageSelect
                    productImages={[]}
                    setProductImages={setProductImages}
                />
            );
        });

        // Wait for images to load
        const image1 = await screen.findByTestId('image-option-1');

        // Select image
        await act(async () => {
            fireEvent.click(image1);
        });

        // Check if setProductImages was called with the correct image
        expect(setProductImages).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                id: 1,
                name: 'test-image-1.jpg',
                pivot: expect.objectContaining({
                    image_id: 1,
                    order_num: 1
                })
            })
        ]));
    });

    it('allows reordering selected images', async () => {
        const selectedImages: CustomImage[] = [
            {
                id: 1,
                name: 'test-image-1.jpg',
                path: 'images/test-image-1.jpg',
                full_path: '/storage/images/test-image-1.jpg',
                pivot: {
                    id: undefined,
                    image_id: 1,
                    order_num: 1
                }
            },
            {
                id: 2,
                name: 'test-image-2.jpg',
                path: 'images/test-image-2.jpg',
                full_path: '/storage/images/test-image-2.jpg',
                pivot: {
                    id: undefined,
                    image_id: 2,
                    order_num: 2
                }
            }
        ];

        const setProductImages = vi.fn();

        await act(async () => {
            render(
                <ImageSelect
                    productImages={selectedImages}
                    setProductImages={setProductImages}
                />
            );
        });

        // Move second image up
        const moveUpButton = screen.getByTestId('move-up-2');
        await act(async () => {
            fireEvent.click(moveUpButton);
        });

        // Check if setProductImages was called with the reordered images
        expect(setProductImages).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 2,
                    pivot: expect.objectContaining({ order_num: 1 })
                }),
                expect.objectContaining({
                    id: 1,
                    pivot: expect.objectContaining({ order_num: 2 })
                })
            ])
        );
    });
}); 