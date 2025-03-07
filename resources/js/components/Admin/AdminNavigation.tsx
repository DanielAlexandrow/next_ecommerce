import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { styles } from './AdminNavigation.styles';

const navigationItems = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: <svg><path d="M2..."/></svg> // Keep existing SVG path
    },
    {
        name: 'Products',
        href: '/admin/products',
        icon: <svg><path d="M2..."/></svg> // Keep existing SVG path
    },
    {
        name: 'Categories',
        href: '/admin/categories',
        icon: <svg><path d="M2..."/></svg> // Keep existing SVG path
    },
    {
        name: 'Users',
        href: '/admin/users',
        icon: <svg><path d="M2..."/></svg> // Keep existing SVG path
    },
    {
        name: 'Finance',
        href: '/admin/finance',
        icon: <svg><path d="M2..."/></svg> // Keep existing SVG path
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: <svg><path d="M2..."/></svg> // Keep existing SVG path
    },
];

interface AdminNavigationProps {
    className?: string;
}

export default function AdminNavigation({ className }: AdminNavigationProps) {
    const location = useLocation();

    return (
        <nav>
            <ScrollArea className={styles.container}>
                <div className={styles.header.container}>
                    <h2 className={styles.header.title}>
                        Admin Panel
                    </h2>
                    <div className={styles.nav.container}>
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={styles.nav.link(location.pathname === item.href)}
                            >
                                {item.icon}
                                <span className={styles.nav.icon}>{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </nav>
    );
}