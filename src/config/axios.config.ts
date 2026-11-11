import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './api.config';
import { emitAuthEvent } from '@auth/utils/authEvent.utils';
import { getAccessToken } from '@auth/utils/token.utils';
import { refreshAccessToken } from '@auth/api/refreshAccessToken';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Ajoute le jeton du compte à chaque requête
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Access token expiré (401) : un refresh, puis on rejoue la requête une seule fois
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthRoute = originalRequest?.url?.startsWith('/auth/') ?? false;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRoute
    ) {
      throw error;
    }

    originalRequest._retry = true;
    try {
      const token = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return await axiosInstance(originalRequest);
    } catch {
      emitAuthEvent('EXPIRED');
      throw error;
    }
  }
);
