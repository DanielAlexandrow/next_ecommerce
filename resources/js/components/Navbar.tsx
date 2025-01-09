import React from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart } from 'react-icons/fi';

interface NavbarProps {
    onCartClick: () => void;
    cartItemCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onCartClick, cartItemCount }) => {
    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-xl font-bold text-primary-600">
                        Your Store
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link
                            href="/products"
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            Products
                        </Link>
                        <Link
                            href="/categories"
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            Categories
                        </Link>

                        <motion.button
                            onClick={onCartClick}
                            className="relative p-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FiShoppingCart className="w-6 h-6 text-gray-600" />
                            <AnimatePresence>
                                {cartItemCount > 0 && (
                                    <motion.span
                                        key="cart-count"
                                        className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                    >
                                        {cartItemCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 