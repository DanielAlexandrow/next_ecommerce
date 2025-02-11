export const brandSchema = {
    // Define your schema validation here
};

export const createBrand = async (brandData) => {
    const response = await axios.post('/api/brands', brandData);
    return response.data;
};

export const getBrands = async () => {
    const response = await axios.get('/api/brands');
    return response.data;
};
