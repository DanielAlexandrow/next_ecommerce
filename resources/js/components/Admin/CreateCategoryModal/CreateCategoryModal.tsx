import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { categoryApi } from '@/api/categoryApi';

interface CreateCategoryModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    categories: any[];
    onSuccess: () => void;
}

export default function CreateCategoryModal({ open, setOpen, categories, onSuccess }: CreateCategoryModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        parent_id: null as number | null
    });

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return;

        setIsLoading(true);
        try {
            await categoryApi.createCategory(newCategory);
            toast.success('Category created successfully');
            setNewCategory({ name: '', description: '', parent_id: null });
            onSuccess();
            setOpen(false);
        } catch (error) {
            toast.error('Failed to create category');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Category Name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        maxLength={50}
                    />
                    <Input
                        type="text"
                        placeholder="Description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        maxLength={255}
                    />
                    <Select
                        value={newCategory.parent_id?.toString() || "0"}
                        onValueChange={(value) => setNewCategory({
                            ...newCategory,
                            parent_id: value === "0" ? null : parseInt(value)
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Parent Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">No Parent</SelectItem>
                            {categories.map((category) => (
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
                            Create Category
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 