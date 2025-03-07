export const styles = {
    searchInput: "w-full mb-4",
    brandList: "max-h-60 overflow-y-auto border rounded-md",
    brandItem: (isSelected: boolean) => 
        `p-2 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`,
    brandName: "text-sm",
    noResults: "p-4 text-center text-gray-500"
} as const;