import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

export interface BaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string | ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    variant?: 'default' | 'destructive';
    testId?: string;
}

export function BaseModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    variant = 'default',
    testId
}: BaseModalProps) {
    const titleColor = variant === 'destructive' ? 'text-red-600' : '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent data-testid={testId}>
                <DialogHeader>
                    <DialogTitle className={titleColor}>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                {children}
                {footer && (
                    <DialogFooter>
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function DefaultModalFooter({
    onCancel,
    onConfirm,
    confirmText = 'Submit',
    confirmVariant = 'default'
}: {
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    confirmVariant?: 'default' | 'destructive';
}) {
    return (
        <>
            <Button variant="outline" onClick={onCancel}>
                Cancel
            </Button>
            <Button
                variant={confirmVariant}
                onClick={onConfirm}
                className={confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            >
                {confirmText}
            </Button>
        </>
    );
} 