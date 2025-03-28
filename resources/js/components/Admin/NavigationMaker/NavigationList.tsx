import React from 'react';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import NavigationItem from './NavigationItem';
import { AnimatePresence, motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/table/SortableHeader';

const NavigationList: React.FC = () => {
    const headers = navigationStore((state) => state.headers);
    const [searchTerm, setSearchTerm] = React.useState('');

    const { sortConfig, getSortedUrl } = useTableSort({
        key: 'name',
        direction: 'asc'
    }, 1);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search navigation items..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8"
                            role="textbox"
                            aria-label="Search navigation items"
                        />
                    </div>
                </div>

                <div className="bg-card rounded-lg shadow-sm p-6"></div>
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
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
                                        label="Description"
                                        sortKey="description"
                                        sortConfig={sortConfig}
                                        getSortedUrl={getSortedUrl}
                                    />
                                </TableCell>
                                <TableCell>
                                    <SortableHeader
                                        label="Header"
                                        sortKey="header_name"
                                        sortConfig={sortConfig}
                                        getSortedUrl={getSortedUrl}
                                    />
                                </TableCell>
                                <TableCell>
                                    <SortableHeader
                                        label="Order"
                                        sortKey="order_num"
                                        sortConfig={sortConfig}
                                        getSortedUrl={getSortedUrl}
                                    />
                                </TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {headers.map((header) =>
                                    header.navigation_items.map((item) => (
                                        <NavigationItem
                                            key={`${header.id}-${item.id}-${item.isTemporary ? 'temp' : 'perm'}`}
                                            item={item}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default NavigationList;