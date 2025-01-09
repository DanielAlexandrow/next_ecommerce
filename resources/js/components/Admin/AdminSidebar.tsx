import { Link } from '@inertiajs/react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

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
        <Sidebar className="pb-12">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold">Admin Panel</h2>
                    <div className="space-y-1">
                        {nav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2"
                                >
                                    <item.icon className="h-4 w-4" />
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
                    <Button variant="ghost" size="icon" className="lg:hidden">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <ScrollArea className={cn("hidden lg:block", className)}>
            <SidebarContent />
        </ScrollArea>
    );
} 