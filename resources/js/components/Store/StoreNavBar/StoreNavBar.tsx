import type { NavigationHeader } from '@/types';
import React from 'react';
import axios from 'axios';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ShoppingCartIcon } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuItem,
} from '../../ui/dropdown-menu';
import { CgProfile } from 'react-icons/cg';
import { navigationApi } from '@/api/navigationApi';
import { useQuery } from '@tanstack/react-query';

const fetchNavData = async () => {
	const data = await navigationApi.fetchNavData();
	return data;
};

const StoreNavBar = () => {
	const pageProps: any = usePage().props;
	const { data: headers = [], isLoading, error } = useQuery({
		queryKey: ['navData'],
		queryFn: fetchNavData,
		staleTime: 600000, // 10 minutes
	});

	function logout() {
		axios.post('/logout').then((response) => {
			window.location.href = '/productsearch';
		});
	}

	if (isLoading) {
		return <div className="w-full h-16 bg-gray-100 animate-pulse"></div>;
	}

	if (error) {
		return <div className="w-full h-16 bg-red-50 text-red-500 flex items-center justify-center">Error loading navigation data</div>;
	}

	return (
		<div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<NavigationMenu>
						<NavigationMenuList className="gap-2">
							<NavigationMenuItem key={9999}>
								<Link
									className={cn(
										'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50'
									)}
									href={'/productsearch'}
								>
									Search Products
								</Link>
							</NavigationMenuItem>
							{headers.map((header) => (
								<NavigationMenuItem key={header.id}>
									<NavigationMenuTrigger className="bg-background hover:bg-gray-100 hover:text-gray-900">
										{header.name}
									</NavigationMenuTrigger>
									<NavigationMenuContent>
										<ul className="grid w-[700px] gap-3 p-4 md:w-[800px] md:grid-cols-2 lg:w-[800px]">
											{header.navigation_items.map((item) => (
												<li key={item.id}>
													<Link
														className={cn(
															'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900'
														)}
														href={'productsnav/' + item.id.toString()}
													>
														<div className="text-sm font-medium leading-none">{item.name}</div>
														<p className="line-clamp-2 text-sm leading-snug text-gray-500">
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

					<div className="flex items-center gap-4">
						<Link
							href="/cart"
							className="p-2 rounded-md hover:bg-gray-100 transition-colors"
						>
							<ShoppingCartIcon className="h-5 w-5 text-gray-700" />
						</Link>
						{!pageProps.auth.user ? (
							<Link
								href="/login"
								className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-md transition-colors"
							>
								Login
							</Link>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
									<CgProfile className="h-5 w-5 text-gray-700" />
									<span className="text-sm font-medium text-gray-700">
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
			</div>
		</div>
	);
};

export default StoreNavBar;
