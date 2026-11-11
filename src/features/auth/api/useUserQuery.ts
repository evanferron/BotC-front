import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/config/axios.config';
import { DEFAULT_QUERY_GC_TIME, DEFAULT_QUERY_STALE_TIME } from '@/constants/QUERY';
import type { User } from '../types/auth.types';
import { AUTH_ENDPOINTS, AUTH_KEYS } from './AUTH_CONF';

const getUser = async (id: string) => (await axiosInstance.get<User>(AUTH_ENDPOINTS.user(id))).data;

// Profil public d'un compte (pseudo). Sert pour le compte connecté comme pour le conteur d'une partie.
export const useUserQuery = (
  id: string | undefined,
  errorMessage = 'Impossible de récupérer votre profil'
) =>
  useQuery({
    queryKey: AUTH_KEYS.user(id ?? ''),
    queryFn: () => getUser(id ?? ''),
    enabled: !!id,
    staleTime: DEFAULT_QUERY_STALE_TIME,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage },
  });
