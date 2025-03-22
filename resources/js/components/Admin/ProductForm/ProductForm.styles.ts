export const styles = {
    form: {
        wrapper: "w-full p-6 bg-card text-card-foreground",
        grid: "grid grid-cols-1 lg:grid-cols-2 gap-8"
    },
    section: {
        wrapper: "space-y-6",
        header: "flex items-center gap-2 mb-4",
        title: "text-lg font-medium text-foreground",
        content: "space-y-4"
    },
    formField: {
        label: "text-sm font-medium text-foreground",
        input: "bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring",
        message: "text-destructive"
    },
    checkbox: {
        wrapper: "flex flex-row items-center space-x-3 space-y-0 rounded-md border border-input p-4 bg-background",
        label: {
            wrapper: "space-y-1 leading-none",
            title: "text-sm font-medium text-foreground",
            description: "text-sm text-muted-foreground"
        }
    },
    selectors: {
        wrapper: "p-4 border border-input rounded-md bg-background"
    },
    submit: {
        wrapper: "flex justify-end mt-8",
        button: "bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2 rounded-md transition-colors"
    }
} as const;