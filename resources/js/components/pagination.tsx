import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginateProps {
    links: { url: string; active: boolean }[];
    onPageChange?: (page: number) => void;  // Optional callback for page changes
}

const Paginate: React.FC<PaginateProps> = ({ links, onPageChange }) => {
    let items: any = [];

    console.log(links)
    if (!links) return null;

    for (let i = 1; i < links.length - 1; i++) {
        items.push(
            <PaginationItem
                className='text-sm'
                key={i}
                style={links[i].active ? { border: '1px solid gray', borderRadius: '5px' } : {}}>
                <PaginationLink
                    href={links[i].url}
                    preserveState
                    onClick={(e) => {
                        if (onPageChange) {
                            e.preventDefault();  // Prevent default link behavior
                            onPageChange(i);  // Call the onPageChange callback
                        }
                    }}>
                    {i}
                </PaginationLink>
            </PaginationItem>
        );
    }
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href={links[0].url} />
                </PaginationItem>
                {items}
                <PaginationItem>
                    <PaginationNext href={links[links.length - 1].url} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default Paginate;
