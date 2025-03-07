import React from 'react';
import { usePage } from '@inertiajs/react';
import Paginate from '@/components/pagination';

interface PaginatedContainerProps {
  children: React.ReactNode;
  links: { url: string | null; active: boolean; label: string; }[];
  className?: string;
}

/**
 * A container component that wraps content with pagination links at the top and bottom
 */
const PaginatedContainer: React.FC<PaginatedContainerProps> = ({ 
  children, 
  links, 
  className = '' 
}) => {
  return (
    <div className={className}>
      <div className="mt-10">
        <Paginate links={links} />
      </div>
      
      {children}
      
      <div className="mt-4">
        <Paginate links={links} />
      </div>
    </div>
  );
};

/**
 * A hook to load pagination props from Inertia's page props
 * @param dataKey - The key for the paginated data in page props
 * @param sortKeyProp - The prop name for sort key (default: 'sortkey')  
 * @param sortDirectionProp - The prop name for sort direction (default: 'sortdirection')
 */
export const usePaginatedData = <T,>(
  dataKey: string, 
  sortKeyProp = 'sortkey', 
  sortDirectionProp = 'sortdirection'
) => {
  const pageProps: any = usePage().props;
  const [data, setData] = React.useState<T[]>(pageProps[dataKey]?.data || []);
  const [sortKey, setSortKey] = React.useState(pageProps[sortKeyProp]);
  const [sortDirection, setSortDirection] = React.useState(pageProps[sortDirectionProp]);
  const [links, setLinks] = React.useState(pageProps[dataKey]?.links || []);
  const currentPage = pageProps[dataKey]?.current_page || 1;

  React.useEffect(() => {
    if (pageProps[dataKey]) {
      setData(pageProps[dataKey].data);
      setLinks(pageProps[dataKey].links);
    }
    setSortKey(pageProps[sortKeyProp]);
    setSortDirection(pageProps[sortDirectionProp]);
  }, [pageProps[dataKey], pageProps[sortKeyProp], pageProps[sortDirectionProp]]);

  const getSortUrl = (key: string) => {
    const newDirection = key === sortKey ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    return `${window.location.pathname}?page=${currentPage}&sortkey=${key}&sortdirection=${newDirection}`;
  };

  return {
    data,
    sortKey,
    sortDirection,
    links,
    currentPage,
    getSortUrl
  };
};

export default PaginatedContainer;