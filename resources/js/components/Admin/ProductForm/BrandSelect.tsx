import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Brand } from '@/types';
import { brandApi } from '@/api/brandApi';
import { styles } from './BrandSelect.styles';

interface BrandSelectProps {
    productBrand: Brand | null;
    setProductBrand: React.Dispatch<React.SetStateAction<Brand | null>>;
}

const BrandSelect: React.FC<BrandSelectProps> = ({ productBrand, setProductBrand }) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);

    useEffect(() => {
        fetchBrands();
    }, []);

    useEffect(() => {
        const filtered = brands.filter(brand =>
            brand.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBrands(filtered);
    }, [searchTerm, brands]);

    const fetchBrands = async () => {
        try {
            const brandsData = await brandApi.getAllBrands();
            setBrands(brandsData);
            setFilteredBrands(brandsData);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const handleBrandSelect = (brand: Brand) => {
        setProductBrand(productBrand?.id === brand.id ? null : brand);
    };

    return (
        <div>
            <Input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
            />

            <div className={styles.brandList}>
                {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                        <div
                            key={brand.id}
                            onClick={() => handleBrandSelect(brand)}
                            className={styles.brandItem(productBrand?.id === brand.id)}
                        >
                            <span className={styles.brandName}>{brand.name}</span>
                        </div>
                    ))
                ) : (
                    <div className={styles.noResults}>No brands found</div>
                )}
            </div>
        </div>
    );
};

export default BrandSelect;
