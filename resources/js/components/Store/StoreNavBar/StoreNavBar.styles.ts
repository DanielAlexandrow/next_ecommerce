export const styles = {
    header: {
        container: "sticky top-0 z-50 w-full bg-background",
        innerWrapper: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    },
    nav: {
        wrapper: "flex items-center gap-4",
        content: "grid w-[700px] gap-3 p-4 md:w-[800px] md:grid-cols-2 lg:w-[800px]",
        trigger: "bg-background hover:bg-gray-100 hover:text-gray-900",
        link: `
            block select-none space-y-1 rounded-md p-3 leading-none no-underline 
            outline-none transition-colors hover:bg-accent hover:text-accent-foreground 
            focus:bg-accent focus:text-accent-foreground
        `
    },
    navItem: {
        title: "text-sm font-medium leading-none",
        description: "line-clamp-2 text-sm leading-snug text-muted-foreground"
    },
    navTrigger: `
        inline-flex items-center justify-center rounded-md bg-background 
        px-4 py-2 text-sm font-medium transition-colors hover:bg-accent 
        hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground 
        focus:outline-none disabled:pointer-events-none disabled:opacity-50
    `,
    cartButton: `
        flex h-9 w-9 items-center justify-center rounded-md border border-input 
        bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground
    `,
    cartIcon: "h-4 w-4",
    loginLink: "text-sm font-medium hover:text-primary",
    userMenu: {
        trigger: "flex items-center gap-2 hover:text-primary",
        icon: "text-lg",
        userName: "text-sm font-medium"
    }
} as const;