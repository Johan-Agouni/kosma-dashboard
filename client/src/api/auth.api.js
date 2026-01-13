import api from './axios';

export const loginApi = credentials => api.post('/auth/login', credentials);
export const registerApi = data => api.post('/auth/register', data);
export const refreshApi = refreshToken => api.post('/auth/refresh', { refreshToken });
export const logoutApi = refreshToken => api.post('/auth/logout', { refreshToken });
export const getMeApi = () => api.get('/auth/me');
export const updateMeApi = data => api.put('/auth/me', data);
export const changePasswordApi = data => api.put('/auth/change-password', data);
