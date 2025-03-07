import { Link } from "@inertiajs/react";
import { styles } from './ProfileTabs.styles';

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
		<div className={styles.container}>
			<nav className={styles.nav}>
				{items.map((item, index) => (
					<Link
						key={index}
						href={item.href}
						className={styles.link(selected === item.value)}
					>
						{item.value}
					</Link>
				))}
			</nav>
		</div>
	);
}

export default ProfileTabs;
