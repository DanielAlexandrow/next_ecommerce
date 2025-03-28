import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

// Mock ResizeObserver
class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

window.ResizeObserver = ResizeObserver;

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
    router: {
        visit: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock cartApi
vi.mock('@/api/cartApi', () => ({
    cartApi: {
        addItem: vi.fn(),
        removeItem: vi.fn(),
        checkout: vi.fn(),
    },
}));

// Mock toast
vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

// Mock dialog components
vi.mock("@/components/ui/dialog", () => {
    const Dialog = vi.fn(({ children, open, onOpenChange }) =>
        React.createElement("div", { "data-testid": "dialog", "data-state": open ? "open" : "closed", onClick: () => onOpenChange?.(false) }, children)
    );
    const DialogTrigger = vi.fn(({ children }) =>
        React.createElement("div", { "data-testid": "dialog-trigger" }, children)
    );
    const DialogContent = vi.fn(({ children }) =>
        React.createElement("div", { "data-testid": "dialog-content" }, children)
    );
    const DialogHeader = vi.fn(({ children }) =>
        React.createElement("div", { "data-testid": "dialog-header" }, children)
    );
    const DialogFooter = vi.fn(({ children }) =>
        React.createElement("div", { "data-testid": "dialog-footer" }, children)
    );
    const DialogTitle = vi.fn(({ children }) =>
        React.createElement("div", { "data-testid": "dialog-title" }, children)
    );
    const DialogDescription = vi.fn(({ children }) =>
        React.createElement("div", { "data-testid": "dialog-description" }, children)
    );
    const DialogClose = vi.fn(({ children }) =>
        React.createElement("div", { "data-testid": "dialog-close" }, children)
    );

    return {
        Dialog,
        DialogTrigger,
        DialogContent,
        DialogHeader,
        DialogFooter,
        DialogTitle,
        DialogDescription,
        DialogClose,
    };
});

// Mock Star component from lucide-react
vi.mock("lucide-react", () => ({
    Star: vi.fn(({ className, onClick }) => React.createElement("button", {
        className,
        onClick,
        role: "button",
        "aria-label": "star-rating",
        type: "button",
        "data-testid": "star-rating-star",
        style: { cursor: className?.includes('cursor-default') ? 'default' : 'pointer' }
    })),
}));