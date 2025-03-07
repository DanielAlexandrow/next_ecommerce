export const styles = {
    container: {
        flex: "flex flex-col md:flex-row gap-8"
    },
    column: {
        left: "flex-1 space-y-4",
        right: "flex-1 space-y-4"
    },
    grid: {
        container: "grid grid-cols-1 md:grid-cols-2 gap-8",
        section: "space-y-4"
    },
    section: {
        label: "font-semibold",
        description: "text-sm text-muted-foreground"
    },
    imageUpload: {
        dropzone: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center",
        preview: {
            container: "mt-4 grid grid-cols-3 gap-4",
            image: "rounded-lg shadow-sm aspect-square object-cover"
        }
    },
    checkbox: {
        container: "flex items-center gap-2"
    },
    submit: "mt-4 w-full",
    brand: {
        container: "space-y-2",
        label: "font-semibold"
    },
    actions: {
        container: "flex justify-end gap-4",
        cancelButton: "text-muted-foreground hover:text-foreground",
        submitButton: "bg-primary text-primary-foreground hover:bg-primary/90"
    }
} as const;