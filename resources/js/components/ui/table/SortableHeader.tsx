
import { Link } from '@inertiajs/react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { SortConfig } from '@/hooks/useTableSort';

interface SortableHeaderProps {
    label: string;
    sortKey: string;
    sortConfig: SortConfig;
    getSortedUrl: (key: string) => string;
}

export const SortableHeader = ({ label, sortKey, sortConfig, getSortedUrl }: SortableHeaderProps) => {
    return (
        <Link href={getSortedUrl(sortKey)}>
            <span className="flex items-center justify-center gap-2">
                {label}
                {sortConfig.key === sortKey && (
                    sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                )}
            </span>
        </Link>
    );
};