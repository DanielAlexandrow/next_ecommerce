import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { useUserStore } from '@/stores/useUserStore';
import { userApi } from '@/api/userApi';
import { useUserForm } from './EditUserModal.hooks';
import type { UserFormData } from './EditUserModal.hooks';

export default function EditUserDialog() {
    const { modalUser, users, setUsers, setOpenEditModal, setModalUser } = useUserStore();
    const { form, isSubmitting, setIsSubmitting, handleError } = useUserForm('edit', modalUser);

    const onSubmit = async (values: UserFormData) => {
        if (!modalUser || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            const response = await userApi.updateUser(modalUser.id, values);
            const updatedUsers = users.map(user => 
                user.id === modalUser.id ? { ...user, ...response.data } : user
            );
            setUsers(updatedUsers);
            toast.success(response.message || 'User updated successfully');
            setOpenEditModal(false);
            setModalUser(null);
        } catch (error: any) {
            handleError(error);
        }
    };

    return (
        <Dialog open={true} onOpenChange={setOpenEditModal}>
            <DialogContent className="max-w-md">
                <DialogTitle>Edit User</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Name</Label>
                                    <FormControl>
                                        <Input {...field} data-testid="user-name-input" />
                                    </FormControl>
                                    <FormMessage className="text-red-600" />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Email</Label>
                                    <FormControl>
                                        <Input type="email" {...field} data-testid="user-email-input" />
                                    </FormControl>
                                    <FormMessage className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Role</Label>
                                    <Select 
                                        value={field.value} 
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger data-testid="user-role-select">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="driver">Driver</SelectItem>
                                            <SelectItem value="customer">Customer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>New Password (optional)</Label>
                                    <FormControl>
                                        <Input 
                                            type="password" 
                                            {...field}
                                            placeholder="Leave blank to keep current password" 
                                            data-testid="user-password-input"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                data-testid="submit-edit-user"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setOpenEditModal(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}