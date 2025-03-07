export const styles = {
    card: "group hover:shadow-lg transition-shadow cursor-pointer",
    content: {
        container: "p-0",
        imageContainer: "relative aspect-square",
        image: "object-cover w-full h-full rounded-t-lg",
        badge: "absolute top-2 right-2 bg-green-500",
        details: {
            container: "p-4",
            title: "font-semibold text-lg truncate",
            priceContainer: "flex items-center gap-2 mt-2",
            price: "text-lg font-bold"
        }
    }
} as const;