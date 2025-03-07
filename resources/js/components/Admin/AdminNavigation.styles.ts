export const styles = {
    container: "h-full w-64 bg-white border-r px-3 py-4",
    header: {
        container: "px-3 py-2",
        title: "mb-2 px-4 text-lg font-semibold"
    },
    nav: {
        container: "space-y-1",
        link: (isActive: boolean) => `
            flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100
            ${isActive 
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-700 hover:text-gray-900'
            }
        `,
        icon: "ml-3"
    }
} as const;