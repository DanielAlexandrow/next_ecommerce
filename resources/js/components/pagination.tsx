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
    onPageChange?: (page: number) => void;
}

const Paginate: React.FC<PaginateProps> = ({ links, onPageChange }) => {
    if (!links) return null;

    return (
        <Pagination>
            <PaginationContent>
                {links[0].url && (
                    <PaginationPrevious href={links[0].url} />
                )}

                {links.slice(1, -1).map((link, i) => (
                    <PaginationLink
                        key={i}
                        href={link.url}
                        isActive={link.active}
                        preserveState
                        onClick={(e) => {
                            if (onPageChange) {
                                e.preventDefault();
                                onPageChange(i + 1);
                            }
                        }}
                    >
                        {i + 1}
                    </PaginationLink>
                ))}

                {links[links.length - 1].url && (
                    <PaginationNext href={links[links.length - 1].url} />
                )}
            </PaginationContent>
        </Pagination>
    );
};

export default Paginate;
