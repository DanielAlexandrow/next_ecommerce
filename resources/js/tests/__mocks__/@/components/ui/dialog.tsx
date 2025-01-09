import React from 'react';
import { vi } from 'vitest';

const Dialog = vi.fn(() => null);
const DialogPortal = vi.fn(({ children }: { children: React.ReactNode }) => <>{children}</>);
const DialogOverlay = vi.fn(() => null);
const DialogClose = vi.fn(() => null);
const DialogTrigger = vi.fn(() => null);
const DialogContent = vi.fn(({ children }: { children: React.ReactNode }) => <>{children}</>);
const DialogHeader = vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>);
const DialogFooter = vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>);
const DialogTitle = vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>);
const DialogDescription = vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>);

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}; 