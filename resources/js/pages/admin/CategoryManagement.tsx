import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Category } from '@/types';
import { categoryApi } from '@/api/categoryApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { debounce } from 'lodash';
import CreateCategoryModal from '@/components/Admin/CreateCategoryModal/CreateCategoryModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EditCategoryModal from '@/components/Admin/EditCategoryModal/EditCategoryModal';

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    // New Category Form State
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        parent_id: null as number | null
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const fetchedCategories = await categoryApi.fetchCategories();
            setCategories(fetchedCategories);
        } catch (error) {
            toast.error('Failed to load categories');
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return;

        setIsLoading(true);
        try {
            await categoryApi.createCategory(newCategory);
            toast.success('Category created successfully');
            setNewCategory({ name: '', description: '', parent_id: null });
            loadCategories();
        } catch (error) {
            toast.error('Failed to create category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (category: Category) => {
        try {
            await categoryApi.deleteCategory(category.id);
            toast.success('Category deleted successfully');
            loadCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        } finally {
            setCategoryToDelete(null);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedCategories.length) return;

        try {
            await categoryApi.bulkDeleteCategories(selectedCategories);
            toast.success('Categories deleted successfully');
            setSelectedCategories([]);
            loadCategories();
        } catch (error) {
            toast.error('Failed to delete categories');
        }
    };

    const debouncedSearch = debounce(async (query: string) => {
        if (!query.trim()) {
            loadCategories();
            return;
        }

        try {
            const results = await categoryApi.searchCategories(query);
            setCategories(results);
        } catch (error) {
            toast.error('Failed to search categories');
        }
    }, 300);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const toggleSelectAll = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map(cat => cat.id));
        }
    };

    const toggleSelectCategory = (categoryId: number) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Category Management</h1>

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <Input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="max-w-md"
                    />
                    <Button onClick={() => setOpenCreateModal(true)}>
                        Create New Category
                    </Button>
                </div>

                <div className="bg-card rounded-lg shadow-sm p-6">
                    <Table className="w-full text-center">
                        <TableHeader>
                            <TableRow>
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={selectedCategories.length === categories.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableCell>
                                <TableCell className="text-center">Name</TableCell>
                                <TableCell className="text-center">Description</TableCell>
                                <TableCell className="text-center">Parent Category</TableCell>
                                <TableCell className="text-center">Products Count</TableCell>
                                <TableCell className="text-center">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={selectedCategories.includes(category.id)}
                                            onCheckedChange={() => toggleSelectCategory(category.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">{category.name}</TableCell>
                                    <TableCell className="text-center">{category.description || '-'}</TableCell>
                                    <TableCell className="text-center">{category.parent?.name || '-'}</TableCell>
                                    <TableCell className="text-center">{category.products_count || 0}</TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center gap-2">
                                                Open
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingCategory(category);
                                                        setOpenEditModal(true);
                                                    }}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setCategoryToDelete(category)}
                                                    className="text-red-600"
                                                >
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

            <CreateCategoryModal
                open={openCreateModal}
                setOpen={setOpenCreateModal}
                categories={categories}
                onSuccess={loadCategories}
            />

            <EditCategoryModal
                open={openEditModal}
                setOpen={setOpenEditModal}
                category={editingCategory}
                categories={categories}
                onSuccess={loadCategories}
            />

            <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <p className="text-red-600 mb-2">This action cannot be undone.</p>
                            <p>
                                This will permanently delete the category "{categoryToDelete?.name}".
                                {categoryToDelete?.products_count ? (
                                    <span className="text-red-600">
                                        {' '}This category has {categoryToDelete.products_count} products associated with it.
                                    </span>
                                ) : null}
                                {categoryToDelete?.subcategories_count ? (
                                    <span className="text-red-600">
                                        {' '}This category has {categoryToDelete.subcategories_count} subcategories that will also be deleted.
                                    </span>
                                ) : null}
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

CategoryManagement.layout = (page: any) => <AdminLayout children={page} />; 