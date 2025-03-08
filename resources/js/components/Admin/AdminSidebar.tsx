import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    ShoppingBag, 
    LayoutDashboard, 
    Settings, 
    Users, 
    Package, 
    Navigation
} from 'lucide-react';

const menuItems = [
    { 
        href: '/admin/dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard 
    },
    { 
        href: '/admin/products', 
        label: 'Products', 
        icon: Package 
    },
    { 
        href: '/admin/orders', 
        label: 'Orders', 
        icon: ShoppingBag 
    },
    { 
        href: '/admin/users', 
        label: 'Users', 
        icon: Users 
    },
    { 
        href: '/admin/navigation', 
        label: 'Navigation', 
        icon: Navigation 
    },
    { 
        href: '/admin/settings', 
        label: 'Settings', 
        icon: Settings 
    }
];

export function AdminSidebar() {
    return (
        <aside className="w-64 border-r bg-card h-[calc(100vh-4rem)]">
            <nav className="space-y-1 p-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}