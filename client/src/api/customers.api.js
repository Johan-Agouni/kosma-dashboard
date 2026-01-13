import api from './axios';

export const getCustomersApi = params => api.get('/customers', { params });
export const getCustomerApi = id => api.get(`/customers/${encodeURIComponent(id)}`);
export const getCustomerOrdersApi = (id, params) =>
    api.get(`/customers/${encodeURIComponent(id)}/orders`, { params });
