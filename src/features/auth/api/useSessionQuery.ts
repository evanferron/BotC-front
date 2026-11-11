import { useQuery } from '@tanstack/react-query';
import { getAccessToken, getUserIdFromToken } from '../utils/token.utils';
import type { Session } from '../types/auth.types';
import { AUTH_KEYS } from './AUTH_CONF';
import { refreshAccessToken } from './refreshAccessToken';

/**
 * Session courante. Au premier chargement, l'access token n'existe pas encore :
 * on tente un refresh avec le cookie. Pas de cookie valide = pas de session (null, pas une erreur).
 */
const getSession = async (): Promise<Session | null> => {
  let token = getAccessToken();
  if (!token) {
    try {
      token = await refreshAccessToken();
    } catch {
      return null;
    }
  }
  const userId = getUserIdFromToken(token);
  return userId ? { userId } : null;
};

export const useSessionQuery = () =>
  useQuery({
    queryKey: AUTH_KEYS.session(),
    queryFn: getSession,
    // La session est mise à jour à la main (login, logout, expiration)
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
