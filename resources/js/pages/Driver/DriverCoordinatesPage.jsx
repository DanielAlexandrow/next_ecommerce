import React from 'react';
import { AdminLayout } from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Link, usePage } from '@inertiajs/react';
import moment from 'moment';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import Paginate from '@/components/pagination';

export default function DriverCoordinatesPage(): React.ReactNode {
    const pageProps: any = usePage().props;
    const drivers = pageProps.drivers;
    const sortKey = pageProps.sortkey;
    const sortDirection = pageProps.sortdirection;

    const handleSortChange = (key: string) => {
        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        return `${window.location.pathname}?sortkey=${key}&sortdirection=${newDirection}&page=${drivers.current_page}`;
    };

    return (
        <div style={{ width: '1000px', margin: 'auto' }}>
            <h1 className="text-center text-2xl font-bold mb-6">Driver Coordinates</h1>

            <div className="mt-10">
                <Paginate links={drivers.links} />
            </div>

            <Table className="text-center">
                <TableHeader>
                    <TableRow>
                        <TableCell>
                            <Link href={handleSortChange('name')}>
                                <span className="flex items-center justify-center">
                                    Driver Name
                                    {sortKey === 'name' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </span>
                            </Link>
                        </TableCell>
                        <TableCell>Latitude</TableCell>
                        <TableCell>Longitude</TableCell>
                        <TableCell>Last Updated</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {drivers.data?.map((driver: any) => (
                        <TableRow key={driver.id}>
                            <TableCell>{driver.name}</TableCell>
                            <TableCell>{driver.coordinates?.latitude || 'N/A'}</TableCell>
                            <TableCell>{driver.coordinates?.longitude || 'N/A'}</TableCell>
                            <TableCell>
                                {driver.coordinates?.updated_at
                                    ? moment(driver.coordinates.updated_at).format('HH:mm DD.MM.YYYY')
                                    : 'Never'
                                }
                            </TableCell>
                            <TableCell>
                                {driver.coordinates ? 'Active' : 'Inactive'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-4">
                <Paginate links={drivers.links} />
            </div>
        </div>
    );
}

DriverCoordinatesPage.layout = (page: any) => <AdminLayout children={page} />;