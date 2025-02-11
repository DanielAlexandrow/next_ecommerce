import { motion } from 'framer-motion';
import React from 'react';
import { Link } from '@inertiajs/react';
import { Product } from '@/types';

interface AnimatedProductCardProps {
    product: Product;
}

const AnimatedProductCard: React.FC<AnimatedProductCardProps> = ({ product }) => {
    const cardVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.05,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 10
            }
        }
    };

    const imageVariants = {
        hover: {
            scale: 1.1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const infoVariants = {
        initial: { y: 0 },
        hover: {
            y: -10,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        }
    };

    return (
        <Link href={`/products/${product.id}`}>
            <motion.div
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer relative group"
                variants={cardVariants}
                initial="initial"
                whileHover="hover"
                layoutId={`product-${product.id}`}
            >
                <motion.div className="relative h-64 overflow-hidden">
                    <motion.img
                        src={product.images?.[0]?.path}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        variants={imageVariants}
                    />
                    <motion.div
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                    />
                </motion.div>

                <motion.div
                    className="p-4"
                    variants={infoVariants}
                >
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-primary-600 font-bold">
                            From ${product.subproducts?.[0]?.price}
                        </span>
                        <motion.button
                            className="bg-primary-500 text-white px-4 py-2 rounded-full"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View Details
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </Link>
    );
};

export default AnimatedProductCard; 