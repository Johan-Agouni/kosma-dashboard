import api from './axios';

export const getStatsApi = () => api.get('/dashboard/stats');
export const getRevenueApi = months => api.get(`/dashboard/revenue?months=${months || 12}`);
export const getTopProductsApi = limit => api.get(`/dashboard/top-products?limit=${limit || 10}`);
export const getRecentOrdersApi = limit => api.get(`/dashboard/recent-orders?limit=${limit || 10}`);
export const getLowStockApi = () => api.get('/dashboard/low-stock');
