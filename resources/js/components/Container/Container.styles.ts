import { cn } from '@/lib/utils';

export const styles = {
  container: (withNoHorizontalPadding: boolean) => cn(
    'mx-auto max-w-7xl py-4 sm:px-6 sm:py-10 lg:px-8',
    withNoHorizontalPadding ? null : 'px-4 sm:px-0'
  )
};