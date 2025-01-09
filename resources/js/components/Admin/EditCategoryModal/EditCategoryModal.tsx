import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { categoryApi } from '@/api/categoryApi';
import { Category } from '@/types';

interface EditCategoryModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    category: Category | null;
    categories: Category[];
    onSuccess: () => void;
}

export default function EditCategoryModal({ open, setOpen, category, categories, onSuccess }: EditCategoryModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(category);

    React.useEffect(() => {
        setEditingCategory(category);
    }, [category]);

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        setIsLoading(true);
        try {
            await categoryApi.updateCategory(editingCategory.id, editingCategory);
            toast.success('Category updated successfully');
            onSuccess();
            setOpen(false);
        } catch (error) {
            toast.error('Failed to update category');
        } finally {
            setIsLoading(false);
        }
    };

    if (!editingCategory) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateCategory} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Category Name"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        maxLength={50}
                    />
                    <Input
                        type="text"
                        placeholder="Description"
                        value={editingCategory.description || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        maxLength={255}
                    />
                    <Select
                        value={editingCategory.parent_id?.toString() || "0"}
                        onValueChange={(value) => setEditingCategory({
                            ...editingCategory,
                            parent_id: value === "0" ? null : parseInt(value)
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Parent Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">No Parent</SelectItem>
                            {categories
                                .filter(cat => cat.id !== editingCategory.id)
                                .map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            Update Category
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 