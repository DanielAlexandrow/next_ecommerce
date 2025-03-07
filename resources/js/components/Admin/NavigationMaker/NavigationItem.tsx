import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import { styles } from './NavigationItem.styles';
import { NavigationIt } from '@/types';

interface NavigationItemProps {
    item: NavigationIt;
}

const NavigationItem = ({ item }: NavigationItemProps) => {
    const deleteItem = navigationStore((state) => state.deleteItem);
    const setEditItem = navigationStore((state) => state.setEditItem);

    return (
        <motion.tr
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.row.base}
        >
            <td className={styles.cell.base}>
                <Button
                    size="sm"
                    variant="ghost"
                    className={`${styles.button.base} ${styles.button.delete}`}
                    onClick={() => deleteItem(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </td>
            <td className={styles.cell.base}>
                <Button
                    size="sm"
                    variant="ghost"
                    className={`${styles.button.base} ${styles.button.edit}`}
                    onClick={() => setEditItem(item)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </td>
            <td className={styles.cell.base}>{item.name}</td>
            <td className={styles.cell.base}>
                <div className={styles.cell.actions}>
                    {/* Additional actions can be added here */}
                </div>
            </td>
        </motion.tr>
    );
};

export default NavigationItem;
