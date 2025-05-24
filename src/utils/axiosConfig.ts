import axios from 'axios';
import { signOut } from 'next-auth/react';

const axiosInstance = axios.create({
  baseURL: process.env.NEXTAUTH_BACKEND_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const isAdmin = userData?.role === 'admin';

        localStorage.removeItem('token');
        localStorage.removeItem('userData');

        await signOut({ redirect: false });
        
        window.location.href = isAdmin ? '/admin/login' : '/login';
        
        throw new Error('Session expired. Please login again.');
      } catch {
        throw new Error('Authentication failed.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
