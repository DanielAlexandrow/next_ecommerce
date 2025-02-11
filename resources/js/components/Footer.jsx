import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="text-lg font-semibold mb-4">About Us</h3>
                        <p className="text-gray-400">
                            Your one-stop shop for all your needs. We provide quality products
                            with excellent customer service.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/products"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categories"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
                        <p className="text-gray-400 mb-4">
                            Subscribe to our newsletter for updates and exclusive offers.
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 rounded-l-md text-gray-900 focus:outline-none"
                            />
                            <motion.button
                                className="bg-primary-500 px-4 py-2 rounded-r-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Subscribe
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <p>&copy; 2024 Your Store. All rights reserved.</p>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer; 