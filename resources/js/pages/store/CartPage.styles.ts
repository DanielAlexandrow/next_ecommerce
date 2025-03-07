export const styles = {
    container: "space-y-8 p-8",
    header: {
        wrapper: "rounded-xl border bg-card text-card-foreground shadow",
        flex: "flex items-center justify-between",
        title: "text-2xl font-bold",
        cartInfo: "flex items-center gap-2"
    },
    itemList: "space-y-4",
    item: {
        container: "flex items-center justify-between",
        info: "flex items-center gap-4",
        imageWrapper: "aspect-square rounded-md",
        image: "rounded-md",
        details: {
            title: "font-medium",
            variant: "text-gray-400 text-sm"
        },
        controls: {
            wrapper: "flex items-center gap-4",
            quantity: "flex items-center gap-2",
            button: "text-gray-400 hover:text-gray-50",
            price: "font-medium"
        }
    },
    guestCheckout: {
        title: "text-2xl font-bold"
    },
    summary: {
        container: "border-t border-gray-800 pt-4 mt-4 flex items-center justify-between",
        label: "text-gray-400",
        total: "font-bold text-2xl"
    },
    actions: {
        container: "mt-4 flex justify-end",
        checkoutButton: "bg-white text-black"
    }
} as const;