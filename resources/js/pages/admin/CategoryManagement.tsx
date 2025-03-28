import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLayout } from '@/layouts/app-layout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search } from 'lucide-react';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';
import { useCategoryStore } from '@/stores/useCategoryStore';
import DeleteCategoryModal from '@/components/Admin/DeleteCategoryModal/DeleteCategoryModal';
import EditCategoryModal from '@/components/Admin/EditCategoryModal/EditCategoryModal';

export default function CategoryManagement() {
    const {
        categories, openDeleteModal, openEditModal,
        modalCategory, modalMode, setCategories,
        setOpenDeleteModal, setOpenEditModal, setModalCategory, setModalMode
    } = useCategoryStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const { sortConfig, getSortedUrl } = useTableSort({
        key: 'name',
        direction: 'asc'
    }, 1);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        
        if (value === '') {
            setCategories(categories);
            return;
        }
        
        const filteredCategories = categories.filter(category => 
            category.name.toLowerCase().includes(value.toLowerCase()) ||
            category.description?.toLowerCase().includes(value.toLowerCase())
        );
        
        setCategories(filteredCategories);
    };

    const handleSelectCategory = (categoryId: number, checked: boolean) => {
        if (checked) {
            setSelectedCategories([...selectedCategories, categoryId]);
        } else {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCategories(categories.map(category => category.id));
        } else {
            setSelectedCategories([]);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Category Management</h1>

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8"
                            role="textbox"
                            aria-label="Search categories"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => {
                                setModalMode('create');
                                setModalCategory(null);
                                setOpenEditModal(true);
                            }}
                        >
                            Add New Category
                        </Button>

                        {selectedCategories.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {selectedCategories.length} selected
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            Bulk Actions
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem className="text-destructive">Delete Selected</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-lg shadow-sm p-6">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableCell className="w-[40px] p-2">
                                    <Checkbox
                                        checked={selectedCategories.length === categories.length}
                                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                        role="checkbox"
                                        aria-label="Select all categories"
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
                                        label="Parent Category"
                                        sortKey="parent_name"
                                        sortConfig={sortConfig}
                                        getSortedUrl={getSortedUrl}
                                    />
                                </TableCell>
                                <TableCell>
                                    <SortableHeader
                                        label="Products Count"
                                        sortKey="products_count"
                                        sortConfig={sortConfig}
                                        getSortedUrl={getSortedUrl}
                                    />
                                </TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="p-2">
                                        <Checkbox 
                                            checked={selectedCategories.includes(category.id)}
                                            onCheckedChange={(checked) => handleSelectCategory(category.id, checked === true)}
                                            role="checkbox"
                                            aria-label={`Select ${category.name}`}
                                        />
                                    </TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.description || '-'}</TableCell>
                                    <TableCell>{category.parent?.name || '-'}</TableCell>
                                    <TableCell>{category.products_count || 0}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center gap-2">
                                                Actions
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setModalCategory(category);
                                                        setModalMode('update');
                                                        setOpenEditModal(true);
                                                    }}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => {
                                                        setModalCategory(category);
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
            </div>

            {openDeleteModal && <DeleteCategoryModal />}
            {openEditModal && <EditCategoryModal />}
        </div>
    );
}

CategoryManagement.layout = (page: any) => <AdminLayout children={page} />;