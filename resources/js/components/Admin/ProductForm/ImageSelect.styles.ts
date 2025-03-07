export const styles = {
    titleText: 'text-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-5 mt-5',
    noImagesMessage: 'text-center text-sm text-gray-500 mb-4',
    searchInput: 'mb-4',
    imageGrid: 'grid grid-cols-3 gap-4 mt-4',
    imageOption: (isSelected: boolean) => `
        relative aspect-square cursor-pointer rounded-md overflow-hidden
        ${isSelected ? 'opacity-50' : 'hover:opacity-80'}
    `,
    imageName: 'text-sm truncate',
};