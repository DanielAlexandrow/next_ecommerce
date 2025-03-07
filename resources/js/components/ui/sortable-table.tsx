import React from 'react';
import { Table, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

interface SortableHeaderProps {
  field: string;
  label: string;
  currentSortKey: string;
  currentSortDirection: string;
  getSortUrl: (key: string) => string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  currentSortKey,
  currentSortDirection,
  getSortUrl
}) => {
  return (
    <TableCell>
      <a href={getSortUrl(field)}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {label}
          {currentSortKey === field && 
            (currentSortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)
          }
        </span>
      </a>
    </TableCell>
  );
};

interface SortableTableProps {
  children: React.ReactNode;
  headers: {
    field: string;
    label: string;
    sortable?: boolean;
  }[];
  currentSortKey: string;
  currentSortDirection: string;
  currentPage: number | string;
  getSortUrl?: (key: string) => string;
}

export const SortableTable: React.FC<SortableTableProps> = ({
  children,
  headers,
  currentSortKey,
  currentSortDirection,
  currentPage,
  getSortUrl
}) => {
  // Default getSortUrl implementation if not provided
  const defaultGetSortUrl = (key: string) => {
    const newDirection = key === currentSortKey ? 
      (currentSortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    return `${window.location.pathname}?page=${currentPage}&sortkey=${key}&sortdirection=${newDirection}`;
  };

  const sortUrlFunction = getSortUrl || defaultGetSortUrl;

  const tableHeaders = (
    <TableRow>
      {headers.map(header => 
        header.sortable !== false ? (
          <SortableHeader
            key={header.field}
            field={header.field}
            label={header.label}
            currentSortKey={currentSortKey}
            currentSortDirection={currentSortDirection}
            getSortUrl={sortUrlFunction}
          />
        ) : (
          <TableCell key={header.field}>{header.label}</TableCell>
        )
      )}
    </TableRow>
  );

  return (
    <Table className="text-center">
      <TableHeader>{tableHeaders}</TableHeader>
      {children}
      {tableHeaders}
    </Table>
  );
};

export const usePagination = (defaultSortKey = 'created_at', defaultSortDirection = 'asc') => {
  const [sortKey, setSortKey] = React.useState(defaultSortKey);
  const [sortDirection, setSortDirection] = React.useState(defaultSortDirection);
  
  React.useEffect(() => {
    // Parse URL params for sorting
    const params = new URLSearchParams(window.location.search);
    if (params.get('sortkey')) {
      setSortKey(params.get('sortkey') as string);
    }
    if (params.get('sortdirection')) {
      setSortDirection(params.get('sortdirection') as string);
    }
  }, [window.location.search]);
  
  const getSortUrl = (key: string, currentPage: number | string = 1) => {
    const newDirection = key === sortKey ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    return `${window.location.pathname}?page=${currentPage}&sortkey=${key}&sortdirection=${newDirection}`;
  };
  
  return {
    sortKey,
    sortDirection,
    getSortUrl
  };
};