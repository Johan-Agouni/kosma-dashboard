import api from './axios';

export const getOrdersApi = params => api.get('/orders', { params });
export const getOrderApi = id => api.get(`/orders/${id}`);
export const updateOrderStatusApi = (id, data) => api.put(`/orders/${id}/status`, data);
export const addOrderNoteApi = (id, data) => api.post(`/orders/${id}/notes`, data);
export const getOrderTimelineApi = id => api.get(`/orders/${id}/timeline`);
