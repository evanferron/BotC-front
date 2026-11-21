import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@common/config/api.config';

/**
 * Ce dont le client HTTP a besoin pour authentifier ses requêtes. Fourni par la feature `auth`
 * au démarrage (app/), pour que `common` n'importe jamais une feature.
 */
export interface HttpAuth {
  // Access token courant, ou null si personne n'est connecté
  getToken: () => string | null;
  // Obtient un nouvel access token ; rejette si la session est terminée
  refresh: () => Promise<string>;
  // Appelé quand le refresh échoue pendant une requête
  onExpired: () => void;
  // Requêtes d'authentification elles-mêmes : jamais de refresh sur leur 401
  isAuthRequest: (url: string) => boolean;
}

let auth: HttpAuth | undefined;

export const configureHttpAuth = (config: HttpAuth) => {
  auth = config;
};

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Ajoute le jeton du compte à chaque requête
axiosInstance.interceptors.request.use((config) => {
  const token = auth?.getToken();
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

    if (
      !auth ||
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      auth.isAuthRequest(originalRequest.url ?? '')
    ) {
      throw error;
    }

    originalRequest._retry = true;
    try {
      const token = await auth.refresh();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return await axiosInstance(originalRequest);
    } catch {
      auth.onExpired();
      throw error;
    }
  }
);
