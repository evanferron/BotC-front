import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { dismissAll } from '@common/utils/toast.utils';
import { setAccessToken } from '../utils/token.utils';
import { AUTH_ENDPOINTS } from './AUTH_CONF';
import { clearSession } from '../utils/session.utils';

const logout = async () => {
  await axiosInstance.post(AUTH_ENDPOINTS.logout);
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onError: (error) => {
      if (ENV === 'DEV') console.error('Impossible de se déconnecter :', error);
    },
    // Même si l'appel échoue, on oublie la session côté client
    onSettled: () => {
      setAccessToken(null);
      dismissAll();
      clearSession(queryClient);
    },
  });
};
