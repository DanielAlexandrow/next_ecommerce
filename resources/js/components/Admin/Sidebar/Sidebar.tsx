
import { Button } from '@/components/ui/button';
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



import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from '../../ui/dropdown-menu';
import axios from 'axios';

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
	,
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
		icon: <IoSettingsOutline />,
		text: 'Settings',
		href: '/shop-settings',
	},
];

export default function Sidebar({
	sidebarMinimized,
	setSidebarMinimized,
}: {
	sidebarMinimized: boolean;
	setSidebarMinimized: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const props: any = usePage().props;
	const username = props.auth.user.data.name;

	function logout() {
		axios.post('/logout').then((response) => {
			window.location.href = '/login';
		});
	}

	return (
		<div className='flex h-screen fixed border-b border-white mx-auto' style={{ borderRight: '1px solid white' }}>
			<div
				className={`w-${sidebarMinimized ? '16' : '50'} md:w-${sidebarMinimized ? '16' : '50'
					} bg-background text-white flex flex-col mx-auto`}>
				<div className='flex-1 overflow-auto'>
					<nav className='px-4 py-2 space-y-2'>
						<div style={{ borderBottom: '1px solid white' }} title='Profile'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<div>
										{sidebarMinimized ? (
											<CgProfile
												className='m-auto hover:bg-gray-90'
												style={{ fontSize: '20px' }}
											/>
										) : (
											<div className='hover:bg-gray-90'>{'Welcome, ' + username}</div>
										)}
									</div>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='w-56'>
									<DropdownMenuItem onClick={logout} className='text-center'>
										Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						{sidebarItems.map((item, index) => (
							<Link
								key={index}
								href={item!.href}
								className='flex items-center m-auto space-x-2 text-white hover:bg-gray-900 hover:text-white px-2 py-1 rounded-md'
								style={{ fontSize: '20px' }}
								title={item!.text}>
								<span className='w-5 h-5'>{item!.icon}</span>
								{!sidebarMinimized && <span className='md:inline text-sm'>{item!.text}</span>}
							</Link>
						))}
					</nav>
				</div>

				<div className={`p-4 ${!sidebarMinimized ? 'flex justify-center items-center' : ''}`}>
					<MinimizeButton isMinimized={sidebarMinimized} setIsMinimized={setSidebarMinimized} />
				</div>
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
		<Button className='text-white' size='icon' variant='ghost' onClick={() => setIsMinimized(!isMinimized)}>
			{isMinimized ? (
				<FaChevronRight className='w-4 h-4 md:w-6 md:h-6' onClick={() => setIsMinimized(false)} />
			) : (
				<FaChevronLeft className='w-4 h-4 md:w-6 md:h-6' onClick={() => setIsMinimized(true)} />
			)}
			<span className='sr-only'>Toggle Sidebar</span>
		</Button>
	);
}

// Add the minimized class to hide text
const minimizedStyles = 'text-opacity-0 pointer-events-none';
