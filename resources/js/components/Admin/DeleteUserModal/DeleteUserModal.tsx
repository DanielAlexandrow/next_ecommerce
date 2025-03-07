import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useUserStore } from '@/stores/useUserStore';
import { userApi } from '@/api/userApi';

export default function DeleteUserDialog() {
    const { modalUser, users, setUsers, setOpenDeleteModal, setModalUser } = useUserStore();

    const deleteUser = async () => {
        if (!modalUser) return;
        
        try {
            const response = await userApi.deleteUser(modalUser.id);
            if (response.status === 204) {
                setUsers(users.filter((user) => user.id !== modalUser.id));
                toast.success(response.headers['x-message']);
            }
        } catch (error) {
            toast.error('Failed to delete user');
            console.error(error);
        }
        setOpenDeleteModal(false);
        setModalUser(null);
    };

    return (
        <Dialog open={true} onOpenChange={setOpenDeleteModal}>
            <DialogContent>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete user {modalUser?.name}?
                </DialogDescription>
                <div className="flex justify-between">
                    <Button variant="destructive" onClick={deleteUser}>Delete</Button>
                    <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}