import { cn } from '@/lib/utils';

export const styles = {
  aside: 'lg:flex hidden items-start min-h-screen border-r w-80 p-8 shrink-0',
  list: 'flex gap-y-1 flex-col w-full sticky top-12',
  logoContainer: 'flex items-center justify-between mb-8',
  logo: 'h-10 w-auto fill-red-600',
  asideLink: (active: boolean) => cn(
    active ? 'text-foreground font-semibold' : 'text-muted-foreground',
    'flex items-center [&>svg]:w-4 [&>svg]:stroke-[1.25] [&>svg]:h-4 [&>svg]:mr-3 hover:bg-accent/50 tracking-tight text-sm hover:text-foreground px-4 py-2 rounded-md'
  ),
  asideLabel: 'flex items-center text-muted-foreground [&>svg]:w-4 [&>svg]:stroke-[1.25] [&>svg]:h-4 [&>svg]:mr-3 tracking-tight text-sm px-4 py-2 rounded-md',
  listItem: '-mx-4'
};