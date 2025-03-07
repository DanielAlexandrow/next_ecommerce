export const styles = {
    sidebar: {
        container: "w-[300px] bg-gray-800 h-screen fixed top-0 left-0 text-white z-50 transition-all duration-300",
        minimized: "w-[80px]"
    },
    header: {
        container: "flex justify-between items-center p-4 border-b border-gray-700",
        title: "text-xl font-bold",
        minimized: "opacity-0 pointer-events-none"
    },
    nav: {
        container: "flex flex-col gap-2 p-4",
        item: {
            base: "flex items-center space-x-2 text-white hover:bg-gray-900 hover:text-white px-2 py-1 rounded-md",
            text: "text-opacity-100 transition-all duration-300",
            minimized: "text-opacity-0 pointer-events-none"
        }
    },
    profile: {
        container: "flex items-center justify-between p-4 border-t border-gray-700",
        button: "hover:bg-gray-90",
        username: (minimized: boolean) => 
            `hover:bg-gray-90 ${minimized ? "hidden" : "block"}`,
        icon: "m-auto hover:bg-gray-90"
    },
    minimizeButton: {
        container: "absolute -right-3 top-6 bg-gray-800 rounded-full p-1.5 cursor-pointer",
        icon: "text-white text-lg"
    }
} as const;