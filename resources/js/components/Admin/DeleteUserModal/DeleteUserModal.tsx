import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useUserStore } from '@/stores/useUserStore';
import { userApi } from '@/api/userApi';
import { useState } from 'react';

export default function DeleteUserDialog() {
    const { modalUser, users, setUsers, setOpenDeleteModal, setModalUser } = useUserStore();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!modalUser || isDeleting) return;
        
        setIsDeleting(true);
        try {
            await userApi.deleteUser(modalUser.id);
            setUsers(users.filter((user) => user.id !== modalUser.id));
            toast.success('User deleted successfully');
            setOpenDeleteModal(false);
            setModalUser(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!modalUser) return null;

    return (
        <Dialog open={true} onOpenChange={setOpenDeleteModal}>
            <DialogContent aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
                <DialogTitle id="delete-dialog-title" data-testid="dialog-title">Delete User</DialogTitle>
                <DialogDescription id="delete-dialog-description">
                    Are you sure you want to delete {modalUser.name}? This action cannot be undone.
                </DialogDescription>
                <div className="mt-4 space-y-4">
                    <div className="text-sm text-gray-500">
                        This will permanently remove:
                        <ul className="list-disc list-inside mt-2">
                            <li>User account and profile</li>
                            <li>Order history</li>
                            <li>Address information</li>
                            <li>Reviews and ratings</li>
                        </ul>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpenDeleteModal(false)}
                            disabled={isDeleting}
                            data-testid="cancel-delete-user"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            data-testid="confirm-delete-user"
                        >
                            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}