import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

export const mediaBaseUrl = (
    import.meta.env.VITE_MEDIA_BASE_URL || apiBaseUrl.replace(/\/api$/, '')
).replace(/\/+$/, '');

const api = axios.create({
    baseURL: apiBaseUrl,
});

let refreshRequest;

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isAuthRequest = originalRequest?.url?.includes('/accounts/auth/');
        const refreshToken = localStorage.getItem('refresh');

        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest || !refreshToken) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;
        refreshRequest ||= axios.post(`${apiBaseUrl}/accounts/auth/token/refresh/`, { refresh: refreshToken })
            .then(({ data }) => {
                localStorage.setItem('access', data.access);
                if (data.refresh) localStorage.setItem('refresh', data.refresh);
                return data.access;
            })
            .catch((refreshError) => {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                throw refreshError;
            })
            .finally(() => {
                refreshRequest = undefined;
            });

        try {
            const accessToken = await refreshRequest;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    },
);

export default api;
