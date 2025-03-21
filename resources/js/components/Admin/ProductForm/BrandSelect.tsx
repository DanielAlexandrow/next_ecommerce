import React, { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Brand } from '@/types';
import { brandApi } from '@/api/brandApi';
import { toast } from 'react-toastify';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

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
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await brandApi.getAllBrands();
        setBrands(data || []);
      } catch (err) {
        console.error('Failed to fetch brands', err);
        setError('Failed to load brands. Please try again.');
        toast.error('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handleBrandChange = (brandId: number) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands([brandId]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium mb-2">Select Brand</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-50 text-red-800 border border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-2">
        No brands available. Please create a brand first.
      </div>
    );
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
