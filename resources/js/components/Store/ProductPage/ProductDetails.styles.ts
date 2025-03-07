export const styles = {
    container: "space-y-4",
    header: "space-y-2",
    title: "text-3xl font-bold",
    brand: "text-gray-500",
    description: "text-gray-600 mt-4",
    priceContainer: "flex items-baseline gap-2 mt-4",
    price: "text-2xl font-bold",
    originalPrice: "text-gray-400 line-through",
    discount: "text-green-600 font-semibold",
    optionsContainer: "space-y-4 mt-6",
    optionsTitle: "font-medium text-lg",
    optionsGrid: "grid grid-cols-2 gap-2 mt-2",
    optionButton: (isSelected: boolean) => 
        `w-full p-3 text-sm border rounded-md transition-colors
        ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'hover:border-gray-400'}`,
    addToCartContainer: "mt-6",
    addToCartButton: "w-full",
    notAvailable: "text-red-500 mt-2"
} as const;