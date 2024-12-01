
import { useState } from 'react';

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export const useTableSort = (initialSort: SortConfig, currentPage?: number) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);

    const getSortedUrl = (key: string) => {
        const newDirection = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        const pageParam = currentPage ? `&page=${currentPage}` : '';
        return `${baseUrl}?sortkey=${key}&sortdirection=${newDirection}${pageParam}`;
    };

    return {
        sortConfig,
        setSortConfig,
        getSortedUrl
    };
};