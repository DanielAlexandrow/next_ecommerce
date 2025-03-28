import { AdminLayout } from "@/layouts/app-layout";
import { updateLinks } from "@/lib/utils";
import { usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Paginate from '@/components/pagination';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useBrandStore } from "@/stores/useBrandStore";
import DeleteConfirmationDialog from "@/components/Admin/DeleteBrandModal/DeleteBrandModal";
import AddNewBrandDialog from "@/components/Admin/AddNewBrandModal/AddNewBrandModal";
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const BrandPage = () => {
    const pageProps: any = usePage().props;
    const {
        brands, openDeleteModal, openAddBrandModal,
        modalBrand, modalMode, setBrands,
        setOpenDeleteModal, setOpenAddBrandModal, setModalBrand, setModalMode
    } = useBrandStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

    const { sortConfig, getSortedUrl } = useTableSort({
        key: pageProps.sortkey,
        direction: pageProps.sortdirection
    }, pageProps.brands.current_page);

    const [links, setLinks] = useState(updateLinks(pageProps.brands.links, sortConfig.key, sortConfig.direction));

    useEffect(() => {
        if (pageProps.brands) {
            setBrands(pageProps.brands.data);
            setLinks(updateLinks(pageProps.brands.links, sortConfig.key, sortConfig.direction));
        }
    }, [pageProps]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        
        if (value === '') {
            setBrands(pageProps.brands.data);
            return;
        }
        
        const filteredBrands = pageProps.brands.data.filter((brand: any) => 
            brand.name.toLowerCase().includes(value.toLowerCase())
        );
        
        setBrands(filteredBrands);
    };

    const handleSelectBrand = (brandId: number, checked: boolean) => {
        if (checked) {
            setSelectedBrands([...selectedBrands, brandId]);
        } else {
            setSelectedBrands(selectedBrands.filter(id => id !== brandId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedBrands(brands.map(brand => brand.id));
        } else {
            setSelectedBrands([]);
        }
    };

    const tableFields = (
        <TableRow>
            <TableCell className="w-[40px] p-2">
                <Checkbox 
                    checked={selectedBrands.length === brands.length}
                    onCheckedChange={handleSelectAll}
                    role="checkbox"
                    aria-label="Select all brands"
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="ID"
                    sortKey="id"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
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
            <TableCell>Actions</TableCell>
        </TableRow>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Brands</h1>

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search brands..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8"
                            role="textbox"
                            aria-label="Search brands"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => {
                                setModalMode('add');
                                setModalBrand(null);
                                setOpenAddBrandModal(true);
                            }}
                        >
                            Add New Brand
                        </Button>

                        {selectedBrands.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {selectedBrands.length} selected
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            Bulk Actions
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Delete Selected</DropdownMenuItem>
                                        <DropdownMenuItem>Export Selected</DropdownMenuItem>
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
                            {brands.map((brand) => (
                                <TableRow key={brand.id}>
                                    <TableCell className="p-2">
                                        <Checkbox 
                                            checked={selectedBrands.includes(brand.id)}
                                            onCheckedChange={(checked) => handleSelectBrand(brand.id, checked === true)}
                                            role="checkbox"
                                            aria-label={`Select ${brand.name}`}
                                        />
                                    </TableCell>
                                    <TableCell>{brand.id}</TableCell>
                                    <TableCell>{brand.name}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center gap-2">
                                                Actions
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setModalBrand(brand);
                                                        setModalMode('update');
                                                        setOpenAddBrandModal(true);
                                                    }}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setModalBrand(brand);
                                                        setOpenDeleteModal(true);
                                                    }}>
                                                    Delete
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

            {openDeleteModal && <DeleteConfirmationDialog />}
            {openAddBrandModal && <AddNewBrandDialog />}
        </div>
    );
};

BrandPage.layout = (page: any) => <AdminLayout children={page} />;

export default BrandPage;
