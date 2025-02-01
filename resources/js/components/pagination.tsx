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
    if (!links) return null;

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
            >
                {link.label}
            </PaginationLink>
        );
    };

    return (
        <Pagination>
            <PaginationContent>
                {links[0].url && (
                    <PaginationPrevious
                        href={links[0].url as string}
                        preserveScroll
                        onClick={(e) => {
                            if (onPageChange) {
                                e.preventDefault();
                                onPageChange(1);
                            }
                        }}
                    />
                )}

                {links.slice(1, -1).map((link, i) => renderLink(link, i + 1))}

                {links[links.length - 1].url && (
                    <PaginationNext
                        href={links[links.length - 1].url as string}
                        preserveScroll
                        onClick={(e) => {
                            if (onPageChange) {
                                e.preventDefault();
                                onPageChange(links.length - 2);
                            }
                        }}
                    />
                )}
            </PaginationContent>
        </Pagination>
    );
};

export default Paginate;
