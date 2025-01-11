import * as React from 'react';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { IconChevronLeft, IconChevronRight, IconDotsHorizontal } from '@irsyadadl/paranoid';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
    <nav
        role='navigation'
        aria-label='pagination'
        className={cn('mx-auto flex w-full justify-center', className)}
        {...props}
    />
);

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
    ({ className, ...props }, ref) => (
        <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
    )
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

interface PaginationLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
    isActive?: boolean;
}

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
    ({ className, isActive, href, children, ...props }, ref) => (
        <PaginationItem>
            <Link
                ref={ref}
                href={href}
                className={cn(
                    'h-9 px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground',
                    className
                )}
                {...props}
            >
                {children}
            </Link>
        </PaginationItem>
    )
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
    <PaginationLink
        aria-label='Go to previous page'
        className={cn('gap-1 pl-2.5', className)}
        {...props}
    >
        <IconChevronLeft className='size-4' />
        <span>Previous</span>
    </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
    <PaginationLink
        aria-label='Go to next page'
        className={cn('gap-1 pr-2.5', className)}
        {...props}
    >
        <span>Next</span>
        <IconChevronRight className='size-4' />
    </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
    <span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
        <IconDotsHorizontal className='size-4' />
        <span className='sr-only'>More pages</span>
    </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
};
