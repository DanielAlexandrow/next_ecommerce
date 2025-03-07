export const styles = {
    dialogHeader: "space-y-1.5 text-center sm:text-left",
    dialogTitle: "text-lg font-semibold",
    dialogDescription: "text-sm text-muted-foreground",
    form: "grid gap-4 py-4",
    ratingLabel: "text-sm font-medium leading-none mb-1",
    starContainer: "flex gap-1",
    star: (isActive: boolean) => `h-6 w-6 cursor-pointer ${isActive ? 'text-yellow-400' : 'text-gray-300'}`,
    footer: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
} as const;