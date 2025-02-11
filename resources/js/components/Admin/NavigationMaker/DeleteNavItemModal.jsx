import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';

const DeleteNavigationItemModal = () => {
    const [headers, setHeaders, selectedNavigationItem, open, setOpen] = navigationStore((state) => [
        state.headers,
        state.setHeaders,
        state.selectedNavigationItem,
        state.openDeleteNavigationItemModal,
        state.setOpenDeleteNavigationItemModal,
    ]);

    if (!selectedNavigationItem) {
        return null;
    }

    const deleteNavigationItem = () => {
        const items = Array.from(headers);
        items.forEach((header) => {
            const navItems = header.navigation_items;
            for (let i = 0; i < navItems.length; i++) {
                if (
                    navItems[i].header_id === selectedNavigationItem.header_id &&
                    navItems[i].order_num === selectedNavigationItem.order_num
                ) {
                    navItems.splice(i, 1);
                    break;
                }
            }
            navItems.forEach((navItem, index) => {
                navItem.order_num = index + 1;
            });
        });

        setHeaders(items);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>Delete Menu Option {selectedNavigationItem?.name}?</DialogTitle>
                <DialogFooter className='mt-10'>
                    <Button onClick={deleteNavigationItem}>Delete</Button>{' '}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteNavigationItemModal;
