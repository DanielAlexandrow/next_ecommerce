import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CategorySelect from '@/components/Admin/ProductForm/CategorySelect';

import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import { useEffect, useRef, useState } from 'react';
import { NavigationCategory } from '@/types';
import { Input } from '@/components/ui/input';

const EditNavigationItemModal = () => {
	const [headers, setHeaders, open, setOpen, item, setItem] = navigationStore((state) => [
		state.headers,
		state.setHeaders,
		state.openEditNavigationItemModal,
		state.setOpenEditNavigationItemModal,
		state.selectedNavigationItem,
		state.setSelectedNavigationItem,
	]);

	if (!item) return null;
	const [selectedCategories, setSelectedCategories] = useState<NavigationCategory[]>(item?.categories || []);
	const [description, setDescription] = useState("");
	const isMounted = useRef(false);

	useEffect(() => {
		if (!isMounted.current) {
			isMounted.current = true;
			return;
		}

		const headerItems = Array.from(headers);
		headerItems.forEach((header) => {
			const navItems = header.navigation_items;
			for (let i = 0; i < navItems.length; i++) {
				if (navItems[i].header_id === item.header_id && navItems[i].order_num === item.order_num) {
					navItems[i].categories = selectedCategories;
					navItems[i].description = description;
					break;
				}
			}
		});
		setHeaders(headerItems);
	}, [selectedCategories, description]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild></DialogTrigger>
			<DialogContent>
				<DialogTitle>This menu option will lead to products of the following categories.</DialogTitle>
				<div className='w-100'>
					<div className='text-sm text-center font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-5 mt-5 '>
						Manu Item: {item?.name}
					</div>
					<div className='text-sm text-center font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-5 mt-5 '>
						Description:
					</div>

					<Input
						placeholder='Description'
						type='text'
						onChange={(e) => setDescription(e.target.value)}
						maxLength={30}
					/>
					<CategorySelect
						selectedCategories={selectedCategories}
						setSelectedCategories={setSelectedCategories}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default EditNavigationItemModal;
