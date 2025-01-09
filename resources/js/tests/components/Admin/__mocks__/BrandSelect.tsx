import React from 'react';

const BrandSelect = ({ productBrand, setProductBrand }: any) => (
    <div data-testid="brand-select-wrapper">
        <div className="text-center text-sm font-medium mb-4">Brand</div>
        <div data-testid="brand-select-section">
            <button onClick={() => setProductBrand(null)}>Select Brand</button>
        </div>
    </div>
);

export default BrandSelect; 