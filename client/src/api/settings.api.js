import api from './axios';

export const getStoreSettingsApi = () => api.get('/settings/store');
export const updateStoreSettingsApi = data => api.put('/settings/store', data);
export const getAuditLogApi = params => api.get('/settings/audit-log', { params });
