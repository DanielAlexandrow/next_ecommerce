import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    Tags,
    Users,
    Settings,
    DollarSign,
    Menu,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const navigationItems = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        name: 'Products',
        href: '/admin/products',
        icon: <Package className="h-5 w-5" />,
    },
    {
        name: 'Categories',
        href: '/admin/categories',
        icon: <Tags className="h-5 w-5" />,
    },
    {
        name: 'Users',
        href: '/admin/users',
        icon: <Users className="h-5 w-5" />,
    },
    {
        name: 'Finance',
        href: '/admin/finance',
        icon: <DollarSign className="h-5 w-5" />,
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: <Settings className="h-5 w-5" />,
    },
];

interface AdminNavigationProps {
    className?: string;
}

export default function AdminNavigation({ className }: AdminNavigationProps) {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="relative"
                    aria-label="Toggle navigation menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </Button>
            </div>

            {/* Navigation menu */}
            <nav
                className={cn(
                    'fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30',
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                    className
                )}
            >
                <ScrollArea className="h-full w-64 bg-white border-r px-3 py-4">
                    <div className="space-y-4">
                        <div className="px-3 py-2">
                            <h2 className="mb-2 px-4 text-lg font-semibold">
                                Admin Panel
                            </h2>
                            <div className="space-y-1">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={cn(
                                            'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100',
                                            location.pathname === item.href
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700 hover:text-gray-900'
                                        )}
                                    >
                                        {item.icon}
                                        <span className="ml-3">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </nav>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
} 