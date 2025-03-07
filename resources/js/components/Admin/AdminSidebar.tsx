import { Link } from '@inertiajs/react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { styles } from './AdminSidebar.styles';

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Tags,
    BarChart3,
    Truck,
    Menu
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AdminSidebar({ className }: SidebarProps) {
    const isMobile = useIsMobile();

    const nav = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            href: "/admin/dashboard",
        },
        {
            title: "Products",
            icon: Package,
            href: "/admin/products",
        },
        {
            title: "Orders",
            icon: ShoppingCart,
            href: "/admin/orders",
        },
        {
            title: "Customers",
            icon: Users,
            href: "/admin/customers",
        },
        {
            title: "Categories",
            icon: Tags,
            href: "/admin/categories",
        },
        {
            title: "Analytics",
            icon: BarChart3,
            href: "/admin/analytics",
        },
        {
            title: "Delivery",
            icon: Truck,
            href: "/admin/delivery",
        },
        {
            title: "Settings",
            icon: Settings,
            href: "/admin/settings",
        },
    ];

    const SidebarContent = () => (
        <Sidebar className={styles.sidebar}>
            <div className={styles.container}>
                <div className={styles.nav}>
                    <h2 className={styles.title}>Admin Panel</h2>
                    <div className={styles.navItems}>
                        {nav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={styles.button}
                                >
                                    <item.icon className={styles.icon} />
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </Sidebar>
    );

    if (isMobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={styles.mobileButton}>
                        <Menu className={styles.mobileIcon} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className={styles.mobileSheet}>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <ScrollArea className={cn(styles.scrollArea, className)}>
            <SidebarContent />
        </ScrollArea>
    );
}