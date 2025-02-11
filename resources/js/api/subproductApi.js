export const createSubproduct = async (subproductData) => {
    const response = await axios.post('/api/subproducts', subproductData);
    return response.data;
};

export const getSubproducts = async (productId) => {
    const response = await axios.get(`/api/products/${productId}/subproducts`);
    return response.data;
};
