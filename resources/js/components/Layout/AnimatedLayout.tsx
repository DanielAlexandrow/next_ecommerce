import { motion, AnimatePresence } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import React from 'react';

interface AnimatedLayoutProps {
    children: React.ReactNode;
}

const pageVariants = {
    initial: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0
    }),
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }
    },
    exit: (direction: number) => ({
        x: direction > 0 ? '-100%' : '100%',
        opacity: 0,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }
    })
};

const AnimatedLayout: React.FC<AnimatedLayoutProps> = ({ children }) => {
    if (!children) {
        console.error('AnimatedLayout: Children prop is required but was not provided');
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <p>Error: No content provided to layout</p>
            </div>
        );
    }

    const { url } = usePage();
    if (!url) {
        console.error('AnimatedLayout: URL from usePage is undefined');
        return (
            <div className="w-full min-h-screen">
                {children}
            </div>
        );
    }

    const [prevPath, setPrevPath] = React.useState<string>(url);
    const direction = React.useMemo(() => {
        if (!prevPath || !url) {
            console.warn('AnimatedLayout: Previous path or current URL is undefined');
            return 0;
        }
        const direction = url.length > prevPath.length ? 1 : -1;
        setPrevPath(url);
        return direction;
    }, [url, prevPath]);

    return (
        <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
                key={url}
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default AnimatedLayout;