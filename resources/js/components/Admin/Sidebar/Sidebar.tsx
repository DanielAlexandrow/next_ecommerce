import { CiFileOn } from 'react-icons/ci';
import { FaProductHunt } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';
import { Link, usePage } from '@inertiajs/react';
import { CgProfile } from 'react-icons/cg';
import { FiAlignJustify } from 'react-icons/fi';
import { FaChevronLeft } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';
import { FaStore } from "react-icons/fa";
import { ShoppingCartIcon } from 'lucide-react';
import { FaTrademark } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoLocationOutline } from "react-icons/io5";
import { FiTag } from "react-icons/fi";
import { styles } from './Sidebar.styles';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { FaUser } from 'react-icons/fa';

const sidebarItems = [
    {
        icon: <FaProductHunt />,
        text: 'New Product',
        href: '/products/create',
    },
    {
        icon: <GrNotes />,
        text: 'Product List',
        href: '/products',
    },
    {
        icon: <CiFileOn />,
        text: 'Images',
        href: '/images',
    },
    {
        icon: <FiAlignJustify />,
        text: 'Navigation Maker',
        href: '/navigation',
    },
    {
        icon: <ShoppingCartIcon />,
        text: 'Orders',
        href: '/orders',
    },
    {
        icon: <FaTrademark />,
        text: 'Brands',
        href: '/brands',
    },
    {
        icon: <FaStore />,
        text: 'Store',
        href: '/productsearch',
    },
    {
        icon: <IoLocationOutline />,
        text: 'Driver Location',
        href: '/driver/coordinates',
    },
    {
        icon: <IoSettingsOutline />,
        text: 'Settings',
        href: '/shop-settings',
    },
    // Updated user management section
    {
        icon: <FaUser />,
        text: 'Users',
        href: '/admin/users',
    },
    {
        icon: <FaUser />,
        text: 'Customers',
        href: '/admin/customers',
    },
    {
        icon: <FiAlignJustify />,
        text: 'Categories',
        href: '/admin/categories',
    },
    {
        icon: <FiTag />,
        text: 'Deals',
        href: '/admin/deals',
    },
];

export default function Sidebar({
    sidebarMinimized,
    setSidebarMinimized,
}: {
    sidebarMinimized: boolean;
    setSidebarMinimized: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const pageProps: any = usePage().props;
    const username = pageProps?.auth?.user?.data?.name || '';

    const logout = async () => {
        try {
            await axios.post('/logout');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div 
            className={`${styles.sidebar.container} ${sidebarMinimized ? styles.sidebar.minimized : ''}`}
            data-testid="admin-sidebar"
        >
            <div className={styles.header.container}>
                <div 
                    className={`${styles.header.title} ${sidebarMinimized ? styles.header.minimized : ''}`}
                    data-testid="sidebar-header"
                >
                    Admin Panel
                </div>
                <MinimizeButton isMinimized={sidebarMinimized} setIsMinimized={setSidebarMinimized} />
            </div>

            <div className={styles.nav.container} data-testid="sidebar-nav-container">
                {sidebarItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={styles.nav.item.base}
                        data-testid={`sidebar-nav-item-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                        {item.icon}
                        <div className={`${styles.nav.item.text} ${sidebarMinimized ? styles.nav.item.minimized : ''}`}>
                            {item.text}
                        </div>
                    </Link>
                ))}
            </div>

            <div className={styles.profile.container} data-testid="sidebar-profile">
                <DropdownMenu>
                    <DropdownMenuTrigger data-testid="profile-dropdown-trigger">
                        <div className={styles.profile.button}>
                            {sidebarMinimized ? (
                                <CgProfile
                                    className={styles.profile.icon}
                                    style={{ fontSize: '20px' }}
                                />
                            ) : (
                                <div className={styles.profile.username(sidebarMinimized)}>
                                    {'Welcome, ' + username}
                                </div>
                            )}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-56'>
                        <DropdownMenuItem onClick={logout} className='text-center' data-testid="logout-button">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function MinimizeButton({
    isMinimized,
    setIsMinimized,
}: {
    isMinimized: boolean;
    setIsMinimized: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    return (
        <div
            className={styles.minimizeButton.container}
            onClick={() => setIsMinimized(!isMinimized)}
            data-testid="sidebar-minimize-button"
        >
            {isMinimized ? (
                <FaChevronRight className={styles.minimizeButton.icon} />
            ) : (
                <FaChevronLeft className={styles.minimizeButton.icon} />
            )}
        </div>
    );
}
