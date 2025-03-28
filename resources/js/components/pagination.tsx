import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginateProps {
    links: { url: string | null; label: string; active: boolean }[];
    onPageChange?: (page: number) => void;
}

const Paginate: React.FC<PaginateProps> = ({ links, onPageChange }) => {
    // Return null if links is undefined or empty
    if (!links || !links.length) return null;

    const renderLink = (link: { url: string | null; label: string; active: boolean }, index: number) => {
        if (!link.url) return null;

        return (
            <PaginationLink
                key={index}
                href={link.url}
                isActive={link.active}
                preserveScroll
                preserveState
                onClick={(e) => {
                    if (onPageChange) {
                        e.preventDefault();
                        onPageChange(index);
                    }
                }}
                data-testid={`pagination-${index}`}
            >
                {link.label}
            </PaginationLink>
        );
    };

    return (
        <Pagination>
            <PaginationContent>
                {links.length > 0 && links[0] && links[0].url && (
                    <PaginationPrevious
                        href={links[0].url as string}
                        preserveScroll
                        onClick={(e) => {
                            if (onPageChange) {
                                e.preventDefault();
                                onPageChange(1);
                            }
                        }}
                        data-testid="pagination-previous"
                    />
                )}

                {links.length > 2 && links.slice(1, -1).map((link, i) => renderLink(link, i + 1))}

                {links.length > 0 && links[links.length - 1] && links[links.length - 1].url && (
                    <PaginationNext
                        href={links[links.length - 1].url as string}
                        preserveScroll
                        onClick={(e) => {
                            if (onPageChange) {
                                e.preventDefault();
                                onPageChange(links.length - 2);
                            }
                        }}
                        data-testid="pagination-next"
                    />
                )}
            </PaginationContent>
        </Pagination>
    );
};

export default Paginate;
