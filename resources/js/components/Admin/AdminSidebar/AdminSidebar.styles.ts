import { cn } from "@/lib/utils";

export const styles = {
  scrollArea: 'hidden lg:block',
  sheetContent: 'w-[240px] p-0',
  navMenuItem: (isActive: boolean) => cn(
    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100',
    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:text-gray-900'
  ),
  navIcon: 'mr-3 h-5 w-5',
  navLabel: 'ml-3'
};