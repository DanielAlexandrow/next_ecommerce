import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { useUserStore } from '@/stores/useUserStore';
import { userApi } from '@/api/userApi';
import { useState } from 'react';
import { UserData } from '@/api/userApi';

export default function EditUserDialog() {
    const { modalUser, users, setUsers, setOpenEditModal, setModalUser } = useUserStore();

    const [formData, setFormData] = useState<Partial<UserData>>({
        name: modalUser?.name || '',
        email: modalUser?.email || '',
        role: modalUser?.role || 'customer',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalUser) return;

        try {
            const response = await userApi.updateUser(modalUser.id, formData);
            const updatedUsers = users.map(user => 
                user.id === modalUser.id ? { ...user, ...response.data } : user
            );
            setUsers(updatedUsers);
            toast.success(response.message || 'User updated successfully');
            setOpenEditModal(false);
            setModalUser(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update user');
            console.error(error);
        }
    };

    return (
        <Dialog open={true} onOpenChange={setOpenEditModal}>
            <DialogContent>
                <DialogTitle>Edit User</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value as UserData['role'] })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="driver">Driver</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="password">New Password (optional)</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>
                    <div className="flex justify-between">
                        <Button type="submit">Save Changes</Button>
                        <Button type="button" variant="outline" onClick={() => setOpenEditModal(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}