import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@/config/api.config';
import { axiosInstance } from '@/config/axios.config';
import type { Credentials, User } from '../types/auth.types';
import { AUTH_ENDPOINTS, AUTH_KEYS } from './AUTH_CONF';
import { login } from './useLoginMutation';

// Crée le compte puis connecte directement l'utilisateur
const register = async (credentials: Credentials) => {
  await axiosInstance.post<User>(AUTH_ENDPOINTS.register, credentials);
  return login(credentials);
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onError: (error) => {
      if (ENV === 'DEV') console.error('Impossible de créer le compte :', error);
    },
    onSuccess: (session) => {
      queryClient.setQueryData(AUTH_KEYS.session(), session);
    },
  });
};
