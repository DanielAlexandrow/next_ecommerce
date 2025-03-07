export const styles = {
    row: {
        base: "transition-opacity",
        exit: "opacity-0",
        enter: "opacity-100",
    },
    cell: {
        base: "border-b p-4",
        actions: "flex items-center space-x-2"
    },
    button: {
        base: "flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent",
        delete: "text-red-500 hover:text-red-600",
        edit: "text-blue-500 hover:text-blue-600"
    }
} as const;