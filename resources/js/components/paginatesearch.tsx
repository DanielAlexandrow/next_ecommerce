import { updateLinks } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import Paginate from "./pagination";


interface PaginatedSearchProps<T> {
    fetchData: (page: number, search: string) => Promise<{
        data: T[];
        links: any[];
        last_page: number;
    }>;
    renderItem: (item: T) => React.ReactNode;
    itemsPerPage?: number;
}

function PaginatedSearch<T>({ fetchData, renderItem, itemsPerPage = 10 }: PaginatedSearchProps<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [links, setLinks] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetchData(currentPage, searchTerm);
                setItems(response.data);
                setTotalPages(response.last_page);
                setLinks(updateLinks(response.links, 'name', 'asc'));
            } catch (error) {
                console.error('Failed to fetch items:', error);
            }
        };

        fetchItems();
    }, [currentPage, searchTerm, fetchData]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <>
            <Input
                type='text'
                placeholder='Search...'
                value={searchTerm}
                onChange={handleSearch}
                className='mb-4'
            />

            <div className='grid grid-cols-4 gap-4' style={{ overflow: 'auto' }}>
                {items.map(renderItem)}
            </div>

            <div className='mt-4'>
                {links.length > 0 && <Paginate links={links} />}
            </div>
        </>
    );
}


export default PaginatedSearch; 
