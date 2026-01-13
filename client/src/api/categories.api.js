import api from './axios';

export const getCategoriesApi = () => api.get('/categories');
export const getCategoryApi = id => api.get(`/categories/${id}`);
export const createCategoryApi = data => api.post('/categories', data);
export const updateCategoryApi = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategoryApi = id => api.delete(`/categories/${id}`);
