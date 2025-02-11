import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import { IoArrowUp, IoArrowDown } from 'react-icons/io5';
import { MdModeEditOutline } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import { NavigationIt } from '@/types';
import { motion } from 'framer-motion';

interface NavigationItemProps {
    item: NavigationIt;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ item }) => {
    const [
        headers,
        setHeaders,
        setOpenEditNavigationItemModal,
        setSelectedNavigationItem,
        setOpenDeleteModal,
    ] = navigationStore((state) => [
        state.headers,
        state.setHeaders,
        state.setOpenEditNavigationItemModal,
        state.setSelectedNavigationItem,
        state.setOpenDeleteNavigationItemModal,
    ]);

    const handleNameChangeNavigationItem = (item: NavigationIt, newName: string) => {
        const updatedHeaders = headers.map(header => {
            if (header.id !== item.header_id) return header;

            return {
                ...header,
                navigation_items: header.navigation_items.map(navItem => {
                    if (navItem.id === item.id) {
                        return { ...navItem, name: newName };
                    }
                    return navItem;
                })
            };
        });

        setHeaders(updatedHeaders);
    };

    const handleMoveUp = (item: NavigationIt) => {
        const items = headers.map(header => {
            if (header.id !== item.header_id) return header;
            const index = header.navigation_items.findIndex(navItem => navItem.id === item.id);
            if (index > 0) {
                const newOrder = [...header.navigation_items];
                [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                return {
                    ...header,
                    navigation_items: newOrder.map((navItem, idx) => ({
                        ...navItem,
                        order_num: idx + 1
                    }))
                };
            }
            return header;
        });
        setHeaders(items);
    };

    const handleMoveDown = (item: NavigationIt) => {
        const items = headers.map(header => {
            if (header.id !== item.header_id) return header;
            const index = header.navigation_items.findIndex(navItem => navItem.id === item.id);
            if (index < header.navigation_items.length - 1) {
                const newOrder = [...header.navigation_items];
                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                return {
                    ...header,
                    navigation_items: newOrder.map((navItem, idx) => ({
                        ...navItem,
                        order_num: idx + 1
                    }))
                };
            }
            return header;
        });
        setHeaders(items);
    };

    return (
        <motion.tr
            key={`nav-item-${item.id}`}
            className='flex w-full justify-between items-center p-2'
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.02, backgroundColor: '#1f2937' }}
            transition={{ duration: 0.3 }}
        >
            <td className='p-2 hover:bg-gray-700 rounded-sm'>
                <motion.span whileTap={{ scale: 0.9 }}>
                    <FaRegTrashAlt
                        onClick={() => {
                            setSelectedNavigationItem(item);
                            setOpenDeleteModal(true);
                        }}
                        title='Delete Item'
                        className='text-red-500 cursor-pointer'
                    />
                </motion.span>
            </td>
            <td className='p-2 hover:bg-gray-700 rounded-sm'>
                <motion.span
                    whileTap={{ scale: 0.9 }}
                >
                    <MdModeEditOutline
                        onClick={() => {
                            setSelectedNavigationItem(item);
                            setOpenEditNavigationItemModal(true);
                        }}
                        title='Edit Item'
                        className='text-blue-500 cursor-pointer'
                    />
                </motion.span>
            </td>
            <td className='p-2 flex-1'>
                <motion.input
                    type='text'
                    className='text-white bg-black text-center hover:border hover:border-white rounded-sm w-full p-1'
                    value={item.name}
                    onChange={(e) => handleNameChangeNavigationItem(item, e.target.value)}
                    whileFocus={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                />
            </td>
            <td className='p-2 flex space-x-2'>
                <motion.button
                    onClick={() => handleMoveUp(item)}
                    className='text-lg hover:text-gray-300'
                    whileTap={{ scale: 0.8 }}
                    title='Move Up'
                >
                    <IoArrowUp />
                </motion.button>
                <motion.button
                    onClick={() => handleMoveDown(item)}
                    className='text-lg hover:text-gray-300'
                    whileTap={{ scale: 0.8 }}
                    title='Move Down'
                >
                    <IoArrowDown />
                </motion.button>
            </td>
        </motion.tr>
    );
};

export default NavigationItem;
