import axios from 'axios';
import https from 'https';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || 'https://196.189.126.55:9300/api',
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // WARNING: Disables SSL certificate validation (development only)
  }),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token attached to request:', token); // Debug log
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          console.log('Attempting token refresh with:', refreshToken);
          const { data } = await api.post('/auth/refresh', { refreshToken });
          if (data.statusCode === 200) {
            localStorage.setItem('token', data.body.token);
            localStorage.setItem('refreshToken', data.body.refreshToken);
            console.log('Token refreshed successfully:', data.body.token);
            originalRequest.headers.Authorization = `Bearer ${data.body.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    }
    return Promise.reject(error);
  }
);

export const signup = (data) => api.post('/auth/signup', data);
export const signin = (data) => api.post('/auth/signin', data);
export const refreshToken = (refreshToken) => api.post('/auth/refresh', { refreshToken });

export default api;