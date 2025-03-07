import { ChangeEvent, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-toastify';
import ImageModal from '@/components/Admin/ImageModal/ImageModal';
import { AdminLayout } from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Link, usePage } from '@inertiajs/react';
import Paginate from '@/components/pagination';
import { updateLinks } from '@/lib/utils';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import moment from 'moment';
import { router } from '@inertiajs/react';
import { Point, Area } from 'react-easy-crop';
import { CustomImage } from "@/types";
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { imageApi } from '@/api/imageApi';
import CropModal from './CropModal';
import { useUserStore } from "@/stores/useUserStore";
import DeleteUserDialog from "@/components/Admin/DeleteUserModal/DeleteUserModal";
import EditUserDialog from "@/components/Admin/EditUserModal/EditUserModal";

const UsersPage = () => {
    const pageProps: any = usePage().props;
    const {
        users, openDeleteModal, openEditModal,
        modalUser, modalMode, setUsers,
        setOpenDeleteModal, setOpenEditModal, setModalUser, setModalMode
    } = useUserStore();

    const { sortConfig, getSortedUrl } = useTableSort({
        key: pageProps.sortkey,
        direction: pageProps.sortdirection
    }, pageProps.users.current_page);

    const [links, setLinks] = useState(updateLinks(pageProps.users.links, sortConfig.key, sortConfig.direction));

    useEffect(() => {
        if (pageProps.users) {
            setUsers(pageProps.users.data);
            setLinks(updateLinks(pageProps.users.links, sortConfig.key, sortConfig.direction));
        }
    }, [pageProps]);

    const tableFields = (
        <TableRow>
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
                <div className="bg-card rounded-lg shadow-sm p-6">
                    <Table className="w-full text-center">
                        <TableHeader>{tableFields}</TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{moment(user.created_at).format('HH:mm DD.MM.YYYY')}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center gap-2">
                                                Open
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setModalUser(user);
                                                        setOpenDeleteModal(true);
                                                    }}>
                                                    Delete
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setModalUser(user);
                                                        setModalMode('update');
                                                        setOpenEditModal(true);
                                                    }}>
                                                    Edit
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-center">
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