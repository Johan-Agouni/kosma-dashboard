import api from './axios';

export const getProductsApi = params => api.get('/products', { params });
export const getProductApi = id => api.get(`/products/${id}`);
export const createProductApi = data => api.post('/products', data);
export const updateProductApi = (id, data) => api.put(`/products/${id}`, data);
export const deleteProductApi = id => api.delete(`/products/${id}`);
export const uploadImagesApi = (id, formData) =>
    api.post(`/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
export const deleteImageApi = (id, imageId) => api.delete(`/products/${id}/images/${imageId}`);
export const exportCSVApi = () => api.get('/products/export/csv', { responseType: 'blob' });
