import React, { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Brand } from '@/types';
import { brandApi } from '@/api/brandApi';
import { toast } from 'react-toastify';

interface BrandSelectProps {
  selectedBrands: number[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<number[]>>;
}

const BrandSelect: React.FC<BrandSelectProps> = ({ 
  selectedBrands, 
  setSelectedBrands 
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const data = await brandApi.getAllBrands();
        setBrands(data);
      } catch (err) {
        console.error('Failed to fetch brands', err);
        toast.error('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handleBrandChange = (brandId: number) => {
    // For this implementation, we'll use radio-like behavior (only one brand can be selected)
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands([brandId]);
    }
  };

  if (loading) {
    return <div className="py-2 text-sm">Loading brands...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium mb-2">Select Brand</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center space-x-2">
            <Checkbox
              id={`brand-${brand.id}`}
              checked={selectedBrands.includes(brand.id)}
              onCheckedChange={() => handleBrandChange(brand.id)}
            />
            <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer">
              {brand.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandSelect;
