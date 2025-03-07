import { useEffect, useState } from 'react';
import { useStoreFront } from '@/stores/storefront/storeFrontStore';
import { Link, usePage } from '@inertiajs/react';
import { navigationApi } from '@/api/navigationApi';
import { CgProfile } from 'react-icons/cg';
import { ShoppingCartIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { styles } from './StoreNavBar.styles';

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const StoreNavBar = () => {
    const pageProps: any = usePage().props;
    const { headers } = useStoreFront();

    const logout = async () => {
        try {
            await navigationApi.logout();
            window.location.href = '/';
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    return (
        <header className={styles.header.container}>
            <div className={styles.header.innerWrapper}>
                <NavigationMenu>
                    <NavigationMenuList className={styles.nav.wrapper}>
                        <NavigationMenuItem>
                            <Link
                                className={styles.navTrigger}
                                href={'/productsearch'}
                            >
                                Search Products
                            </Link>
                        </NavigationMenuItem>
                        {headers.map((header) => (
                            <NavigationMenuItem key={header.id}>
                                <NavigationMenuTrigger className={styles.nav.trigger}>
                                    {header.name}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className={styles.nav.content}>
                                        {header.navigation_items.map((item) => (
                                            <li key={item.id}>
                                                <Link
                                                    className={cn(styles.nav.link)}
                                                    href={'/productsnav/' + item.id.toString()}
                                                >
                                                    <div className={styles.navItem.title}>
                                                        {item.name}
                                                    </div>
                                                    <p className={styles.navItem.description}>
                                                        {item.description}
                                                    </p>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                <div className={styles.nav.wrapper}>
                    <Link
                        href="/cart"
                        className={styles.cartButton}
                    >
                        <ShoppingCartIcon className={styles.cartIcon} />
                    </Link>
                    {!pageProps.auth.user ? (
                        <Link
                            href="/login"
                            className={styles.loginLink}
                        >
                            Login
                        </Link>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger className={styles.userMenu.trigger}>
                                <CgProfile className={styles.userMenu.icon} />
                                <span className={styles.userMenu.userName}>
                                    {pageProps.auth.user.data.name}
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem>
                                    <Link href="/profile/adressinfo" className="w-full">
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
};

export default StoreNavBar;
