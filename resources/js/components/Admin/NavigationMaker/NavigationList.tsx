import React from 'react';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import NavigationItem from './NavigationItem';
import { AnimatePresence, motion } from 'framer-motion';
import { styles } from './NavigationList.styles';

const NavigationList: React.FC = () => {
    const headers = navigationStore((state) => state.headers);

    return (
        <motion.table className={styles.table} layout>
            <thead>
                <tr className={styles.header.row}>
                    <th className={styles.header.cell}>Delete</th>
                    <th className={styles.header.cell}>Edit</th>
                    <th className={styles.header.cell}>Name</th>
                    <th className={styles.header.cell}>Actions</th>
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