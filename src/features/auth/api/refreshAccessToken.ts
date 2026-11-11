import axios from 'axios';
import { API_BASE_URL } from '@/config/api.config';
import { setAccessToken } from '../utils/token.utils';
import type { TokenResponse } from '../types/auth.types';
import { AUTH_ENDPOINTS } from './AUTH_CONF';

// Un seul refresh à la fois : le serveur fait tourner le cookie, deux appels simultanés se gêneraient
let pending: Promise<string> | null = null;

/**
 * Demande un nouvel access token à partir du cookie HttpOnly de refresh.
 * Appel hors de `axiosInstance` pour ne pas repasser par l'intercepteur de 401.
 */
export const refreshAccessToken = (): Promise<string> => {
  pending ??= axios
    .post<TokenResponse>(`${API_BASE_URL}${AUTH_ENDPOINTS.refresh}`, null, {
      withCredentials: true,
    })
    .then((res) => {
      setAccessToken(res.data.access_token);
      return res.data.access_token;
    })
    .catch((error: unknown) => {
      setAccessToken(null);
      throw error;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
};
