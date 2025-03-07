export const styles = {
    container: "container mx-auto px-4 py-8",
    grid: "grid grid-cols-1 lg:grid-cols-2 gap-8",
    content: {
        wrapper: "space-y-8",
        header: {
            container: "space-y-2",
            title: "text-4xl font-bold tracking-tighter",
            description: "text-gray-500 dark:text-gray-400"
        },
        details: {
            container: "space-y-6",
            section: "space-y-2",
            label: "text-lg font-semibold"
        },
        price: {
            amount: "text-3xl font-bold"
        },
        addToCart: {
            button: "w-full bg-primary hover:bg-primary/90 text-white dark:text-black"
        }
    }
} as const;