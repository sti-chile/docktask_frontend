// src/api/axiosInstance.js
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const buildAxios = (token) => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
  });

  // Interceptor de respuesta
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Redirigir al login solo en errores de autenticación
        window.location.href = `${window.location.origin}/login`;
      }
      return Promise.reject(error);
    }
  );

  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  return instance;
};
