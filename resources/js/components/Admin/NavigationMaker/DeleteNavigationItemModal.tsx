import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteNavigationItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    itemName: string;
}

export default function DeleteNavigationItemModal({
    isOpen,
    onClose,
    onDelete,
    itemName
}: DeleteNavigationItemModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Navigation Item</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the navigation item "{itemName}"? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
