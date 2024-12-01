import React from 'react';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import NavigationItem from './NavigationItem';
import { AnimatePresence, motion } from 'framer-motion';

const NavigationList: React.FC = () => {
    const headers = navigationStore((state) => state.headers);

    return (
        <motion.table className='w-full' layout>
            <thead>
                <tr className='bg-gray-800 text-white'>
                    <th className='p-2'>Delete</th>
                    <th className='p-2'>Edit</th>
                    <th className='p-2'>Name</th>
                    <th className='p-2'>Actions</th>
                </tr>
            </thead>
            <motion.tbody>
                <AnimatePresence>
                    {headers.map((header) =>
                        header.navigation_items.map((item) => (
                            <NavigationItem
                                key={`${header.id}-${item.id}-${item.isTemporary ? 'temp' : 'perm'}`}
                                item={item}
                            />
                        ))
                    )}
                </AnimatePresence>
            </motion.tbody>
        </motion.table>
    );
};

export default NavigationList; 