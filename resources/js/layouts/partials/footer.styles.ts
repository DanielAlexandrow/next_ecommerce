export const styles = {
    container: "mx-auto max-w-7xl px-6 pb-8 pt-20 sm:pt-24 lg:px-8 lg:pt-32",
    grid: "xl:grid xl:grid-cols-3 xl:gap-8",
    navigation: {
        container: "grid grid-cols-2 gap-8 xl:col-span-2",
        grid: "md:grid md:grid-cols-2 md:gap-8",
        section: {
            title: "text-sm font-semibold leading-6 text-primary",
            list: "mt-6 space-y-4",
            link: "text-sm leading-6 text-muted-foreground hover:text-foreground"
        }
    },
    newsletter: {
        container: "mt-10 xl:mt-0",
        title: "text-sm font-semibold leading-6 text-primary",
        description: "mt-2 text-sm leading-6 text-muted-foreground",
        form: "mt-6 sm:flex sm:max-w-md",
        input: {
            label: "sr-only",
            wrapper: "mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0"
        }
    },
    footer: {
        container: "mt-16 border-t border-slate-900/10 pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24",
        social: {
            container: "flex space-x-6 md:order-2",
            link: "text-muted-foreground hover:text-foreground [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-[1.5]",
            label: "sr-only"
        },
        copyright: {
            text: "mt-8 text-xs leading-5 text-muted-foreground md:order-1 md:mt-0",
            link: "font-semibold text-foreground"
        }
    }
} as const;