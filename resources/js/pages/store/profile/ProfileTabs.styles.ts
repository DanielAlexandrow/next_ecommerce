export const styles = {
    container: "border-b border-gray-200 dark:border-gray-800",
    nav: "container mx-auto flex justify-center space-x-4",
    link: (isSelected: boolean) => `
        px-4 py-2 text-sm font-medium transition-colors duration-200
        ${isSelected 
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground hover:text-primary'
        }
    `
} as const;