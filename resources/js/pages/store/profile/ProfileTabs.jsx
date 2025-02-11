import { Link } from "@inertiajs/react";

const items = [
	{
		value: 'Adress',
		href: '/profile/adressinfo',
	},
	{
		value: 'Orders',
		href: '/profile/orders',
	},
	{
		value: 'Password',
		href: '/profile/password',
	}
];

const ProfileTabs = ({ selected }: { selected: string }) => {
	return (
		<div className="border-b border-gray-200 dark:border-gray-800">
			<nav className="container mx-auto flex justify-center space-x-4">
				{items.map((item, index) => (
					<Link
						key={index}
						href={item.href}
						className={`px-4 py-2 text-sm font-medium transition-colors duration-200
                            ${selected === item.value
								? 'border-b-2 border-primary text-primary'
								: 'text-muted-foreground hover:text-primary'
							}`}
					>
						{item.value}
					</Link>
				))}
			</nav>
		</div>
	);
}

export default ProfileTabs;
