import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { AdminLayout } from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import Paginate from '@/components/pagination';
import { updateLinks } from '@/lib/utils';
import { Search } from 'lucide-react';
import moment from 'moment';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';
import { useUserStore } from "@/stores/useUserStore";
import DeleteUserDialog from "@/components/Admin/DeleteUserModal/DeleteUserModal";
import EditUserDialog from "@/components/Admin/EditUserModal/EditUserModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UsersPage = () => {
    const pageProps: any = usePage().props;
    const {
        users, openDeleteModal, openEditModal,
        modalUser, modalMode, setUsers,
        setOpenDeleteModal, setOpenEditModal, setModalUser, setModalMode
    } = useUserStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const { sortConfig, getSortedUrl } = useTableSort({
        key: pageProps.sortkey,
        direction: pageProps.sortdirection
    }, pageProps.users.current_page);

    const [links, setLinks] = useState(updateLinks(pageProps.users.links || [], sortConfig.key, sortConfig.direction));

    useEffect(() => {
        if (pageProps.users?.data) {
            setUsers(pageProps.users.data);
        }
    }, [pageProps.users?.data, setUsers]);

    useEffect(() => {
        if (pageProps.users?.links) {
            setLinks(updateLinks(pageProps.users.links, sortConfig.key, sortConfig.direction));
        }
    }, [pageProps.users?.links, sortConfig.key, sortConfig.direction]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        if (value === '') {
            setUsers(pageProps.users.data);
            return;
        }
        
        const filteredUsers = pageProps.users.data.filter((user: any) => 
            user.name.toLowerCase().includes(value.toLowerCase()) || 
            user.email.toLowerCase().includes(value.toLowerCase()) ||
            user.role.toLowerCase().includes(value.toLowerCase())
        );
        
        setUsers(filteredUsers);
    };

    const handleSelectUser = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, userId]);
        } else {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(users.map(user => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const tableFields = (
        <TableRow>
            <TableCell className="w-[40px] p-2">
                <Checkbox 
                    checked={selectedUsers.length === users.length}
                    onCheckedChange={handleSelectAll}
                    role="checkbox"
                    aria-label="Select all users"
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
            <TableCell>
                <SortableHeader
                    label="Email"
                    sortKey="email"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Role"
                    sortKey="role"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>
                <SortableHeader
                    label="Joined"
                    sortKey="created_at"
                    sortConfig={sortConfig}
                    getSortedUrl={getSortedUrl}
                />
            </TableCell>
            <TableCell>Actions</TableCell>
        </TableRow>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Users</h1>

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-8"
                            data-testid="user-search-input"
                            role="textbox"
                            aria-label="Search users"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => {
                            setModalMode('add');
                            setOpenEditModal(true);
                        }}>
                            Add New User
                        </Button>

                        {selectedUsers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium" data-testid="selected-count">
                                    {selectedUsers.length} selected
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" data-testid="bulk-actions-menu">
                                            Bulk Actions
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Delete Selected</DropdownMenuItem>
                                        <DropdownMenuItem>Change Role</DropdownMenuItem>
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
                            {users.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell className="p-2">
                                        <Checkbox 
                                            checked={selectedUsers.includes(user.id)}
                                            onCheckedChange={(checked) => handleSelectUser(user.id, checked === true)}
                                            role="checkbox"
                                            aria-label={`Select ${user.name}`}
                                        />
                                    </TableCell>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{moment(user.created_at).format('HH:mm DD.MM.YYYY')}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center gap-2">
                                                Actions
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setModalUser(user);
                                                        setModalMode('update');
                                                        setOpenEditModal(true);
                                                    }}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setModalUser(user);
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

            {openDeleteModal && <DeleteUserDialog />}
            {openEditModal && <EditUserDialog />}
        </div>
    );
};

UsersPage.layout = (page: any) => <AdminLayout children={page} />;

export default UsersPage;