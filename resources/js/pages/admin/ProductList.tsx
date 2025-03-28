import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import SubproductsModal from '@/components/Admin/SubproductsModal/SubproductsModal';
import DeleteProductModal from '@/components/Admin/DeleteProductModal/DeleteProductModal';
import NewSubproductModal from '@/components/Admin/NewSubproductModal/NewSubproductModal';
import EditProductModal from '@/components/Admin/ProductModal/EditProductModal';
import { Product } from '@/types';
import { productsStore } from '../../stores/productlist/productstore';
import { AdminLayout } from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import Paginate from '@/components/pagination';
import { Search } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateLinks } from '@/lib/utils';
import moment from 'moment';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ProductsList(): React.ReactNode {
    const [
        products,
        openEditProductModal,
        openDeleteProductModal,
        openNewSubproductModal,
        openSubproductsModal,
        setProducts,
        setSelectedProduct,
        setSubproductsModal,
        setOpenNewSubproductModal,
        setOpenDeleteProductModal,
        setOpenEditProductModal,
        selectedProduct
    ] = productsStore((state) => [
        state.products,
        state.openEditProductModal,
        state.openDeleteProductModal,
        state.openNewSubproductModal,
        state.openSubproductsModal,
        state.setProducts,
        state.setSelectedProduct,
        state.setSubproductsModal,
        state.setOpenNewSubproductModal,
        state.setOpenDeleteProductModal,
        state.setOpenEditProductModal,
        state.selectedProduct
    ]);

    const pageProps: any = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    
    const { sortConfig, getSortedUrl } = useTableSort({
        key: pageProps.sortkey,
        direction: pageProps.sortdirection
    }, pageProps.products.current_page);

    const [links, setLinks] = useState(updateLinks(pageProps.products.links, sortConfig.key, sortConfig.direction));

    useEffect(() => {
        if (pageProps.products) {
            setProducts(pageProps.products.data);
            setLinks(updateLinks(pageProps.products.links, sortConfig.key, sortConfig.direction));
        }
    }, [pageProps.products, sortConfig.key, sortConfig.direction]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Debounce the filtering to prevent excessive updates
        const filteredProducts = value === '' 
            ? pageProps.products.data
            : pageProps.products.data.filter((product: Product) => 
                product.name.toLowerCase().includes(value.toLowerCase()) || 
                product.description?.toLowerCase().includes(value.toLowerCase())
            );
        
        setProducts(filteredProducts);
    };

    const handleSelectProduct = React.useCallback((productId: number, checked: boolean) => {
        setSelectedProducts(prev => 
            checked ? [...prev, productId] : prev.filter(id => id !== productId)
        );
    }, []);

    const handleSelectAll = React.useCallback((checked: boolean) => {
        setSelectedProducts(checked ? products.map((product: Product) => product.id) : []);
    }, [products]);

    const tableFields = (
        <TableRow>
            <TableCell className="w-[40px] p-2">
                <Checkbox 
                    checked={selectedProducts.length === products.length}
                    onCheckedChange={handleSelectAll}
                    role="checkbox"
                    aria-label="Select all products"
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Name"
                    sortKey="name"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Description"
                    sortKey="description"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Available"
                    sortKey="available"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Created"
                    sortKey="created_at"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>Actions</TableCell>
        </TableRow>
    );
    
    return (
        <ErrorBoundary>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8">Products List</h1>

                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-8"
                                data-testid="product-search-input"
                                role="textbox"
                                aria-label="Search products"
                            />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => setOpenNewSubproductModal(true)}>
                                Add New Product
                            </Button>

                            {selectedProducts.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium" data-testid="selected-count">
                                        {selectedProducts.length} selected
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" data-testid="bulk-actions-menu">
                                                Bulk Actions
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>Delete Selected</DropdownMenuItem>
                                            <DropdownMenuItem>Mark as Available</DropdownMenuItem>
                                            <DropdownMenuItem>Mark as Unavailable</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-card rounded-lg shadow-sm p-6">
                        <Table className="w-full">
                            <TableHeader>{tableFields}</TableHeader>
                            <TableBody>
                                {products?.map((product: any) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="p-2">
                                            <Checkbox 
                                                checked={selectedProducts.includes(product.id)}
                                                onCheckedChange={(checked) => handleSelectProduct(product.id, checked === true)}
                                                role="checkbox"
                                                aria-label={`Select ${product.name}`}
                                            />
                                        </TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.description}</TableCell>
                                        <TableCell>{product.available ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>{moment(product.created_at).format('HH:mm DD.MM.YYYY')}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className="flex items-center gap-2">
                                                    Actions
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setOpenEditProductModal(true);
                                                        }}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setOpenDeleteProductModal(true);
                                                        }}>
                                                        Delete
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setOpenNewSubproductModal(true);
                                                        }}>
                                                        Add Option
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setSubproductsModal(true);
                                                        }}>
                                                        View Options
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-center mt-4">
                        <Paginate links={links} />
                    </div>
                </div>

                {openSubproductsModal && <SubproductsModal />}
                {openNewSubproductModal && <NewSubproductModal />}
                {selectedProduct && openDeleteProductModal && (
                    <DeleteProductModal
                        isOpen={openDeleteProductModal}
                        onClose={() => setOpenDeleteProductModal(false)}
                        productId={selectedProduct.id}
                        productName={selectedProduct.name}
                        onDelete={() => {
                            console.log('delete product', selectedProduct.id);
                            setOpenDeleteProductModal(false);
                        }}
                    />
                )}
                {openEditProductModal && <EditProductModal />}
            </div>
        </ErrorBoundary>
    );
}

ProductsList.layout = (page: any) => <AdminLayout children={page} />;