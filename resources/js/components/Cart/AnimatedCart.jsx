import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { CartItem } from '@/types';

interface AnimatedCartProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQuantity: (itemId: number, quantity: number) => void;
    onRemoveItem: (itemId: number) => void;
}

const cartVariants = {
    hidden: {
        x: '100%',
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    visible: {
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    }
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }),
    removed: {
        opacity: 0,
        x: -100,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }
};

const AnimatedCart: React.FC<AnimatedCartProps> = ({
    isOpen,
    onClose,
    items,
    onUpdateQuantity,
    onRemoveItem
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-hidden"
                        variants={cartVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <div className="p-4 border-b">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Your Cart</h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </motion.button>
                            </div>
                        </div>

                        <div className="p-4 overflow-y-auto h-[calc(100vh-200px)]">
                            <AnimatePresence>
                                {items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        custom={index}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="removed"
                                        className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg"
                                        layoutId={`cart-item-${item.id}`}
                                    >
                                        <motion.img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded"
                                            whileHover={{ scale: 1.05 }}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium">{item.name}</h3>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => onRemoveItem(item.id)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    ✕
                                                </motion.button>
                                            </div>
                                            <p className="text-gray-600">${item.price}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded"
                                                >
                                                    -
                                                </motion.button>
                                                <span>{item.quantity}</span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded"
                                                >
                                                    +
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                            <motion.button
                                className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Checkout (${items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)})
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AnimatedCart; 