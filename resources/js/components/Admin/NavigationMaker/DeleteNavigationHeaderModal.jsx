import { BaseModal, DefaultModalFooter } from '@/components/ui/modal/BaseModal';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import { useState } from 'react';

const DeleteHeaderNavigationModal = () => {
    const [headers, setHeaders, selectedHeader, open, setOpen] = navigationStore((state) => [
        state.headers,
        state.setHeaders,
        state.selectedHeader,
        state.openDeleteHeaderModal,
        state.setOpenDeleteHeaderModal,
    ]);

    const [isLoading, setIsLoading] = useState(false);

    if (!selectedHeader) {
        return null;
    }

    const handleDelete = () => {
        setIsLoading(true);
        try {
            const items = Array.from(headers);
            const index = items.findIndex((header) => header.id === selectedHeader.id);
            items.splice(index, 1);
            items.forEach((header, index) => {
                header.order_num = index + 1;
            });
            setHeaders(items);
            setOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BaseModal
            open={open}
            onOpenChange={setOpen}
            title={`Delete Header ${selectedHeader.name}`}
            variant="destructive"
            testId="delete-header-modal"
            footer={
                <DefaultModalFooter
                    onCancel={() => setOpen(false)}
                    onConfirm={handleDelete}
                    confirmText="Delete"
                    confirmVariant="destructive"
                />
            }
        >
            <></>
        </BaseModal>
    );
};

export default DeleteHeaderNavigationModal;
