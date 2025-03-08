import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brand } from '@/types';
import axios from 'axios';

interface BrandSelectProps {
  productBrand: Brand | null;
  setProductBrand: (brand: Brand | null) => void;
}

const BrandSelect: React.FC<BrandSelectProps> = ({ productBrand, setProductBrand }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/brands/getallbrands');
        setBrands(response.data);
      } catch (err) {
        console.error('Failed to fetch brands', err);
        setError('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandChange = (brandId: string) => {
    const selectedBrand = brands.find((brand) => brand.id === parseInt(brandId));
    setProductBrand(selectedBrand || null);
  };

  if (loading) {
    return <div>Loading brands...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <Select 
        value={productBrand?.id?.toString() || ""} 
        onValueChange={handleBrandChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a brand (optional)" />
        </SelectTrigger>
        <SelectContent>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id.toString()}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BrandSelect;
