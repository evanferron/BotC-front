import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@/config/api.config';
import { axiosInstance } from '@/config/axios.config';
import { getUserIdFromToken, setAccessToken } from '../utils/token.utils';
import type { Credentials, Session, TokenResponse } from '../types/auth.types';
import { AUTH_ENDPOINTS, AUTH_KEYS } from './AUTH_CONF';

// Connecte le compte et garde l'access token en mémoire (le refresh arrive en cookie HttpOnly)
export const login = async (credentials: Credentials): Promise<Session> => {
  const { data } = await axiosInstance.post<TokenResponse>(AUTH_ENDPOINTS.login, credentials);
  const userId = getUserIdFromToken(data.access_token);
  if (!userId) throw new Error('Jeton reçu illisible');
  setAccessToken(data.access_token);
  return { userId };
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onError: (error) => {
      if (ENV === 'DEV') console.error('Impossible de se connecter :', error);
    },
    onSuccess: (session) => {
      queryClient.setQueryData(AUTH_KEYS.session(), session);
    },
  });
};
