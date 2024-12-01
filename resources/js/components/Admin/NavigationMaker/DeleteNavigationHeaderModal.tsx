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

const DeleteHeaderNavigationModal = () => {
    const [headers, setHeaders, selectedHeader, open, setOpen] = navigationStore((state) => [
        state.headers,
        state.setHeaders,
        state.selectedHeader,
        state.openDeleteHeaderModal,
        state.setOpenDeleteHeaderModal,
    ]);

    if (!selectedHeader) {
        return null;
    }

    const deleteNavigationHeader = () => {
        const items = Array.from(headers);
        const index = items.findIndex((header) => header.id === selectedHeader.id);
        items.splice(index, 1);
        items.forEach((header, index) => {
            header.order_num = index + 1;
        });
        setHeaders(items);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>Delete Header {selectedHeader?.name}?</DialogTitle>
                <DialogFooter className='mt-10'>
                    <Button onClick={deleteNavigationHeader}>Delete</Button>{' '}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteHeaderNavigationModal;
