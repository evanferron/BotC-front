import { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { showError } from '@/services/toast.service';
import { useSessionQuery } from '../api/useSessionQuery';
import { useUserQuery } from '../api/useUserQuery';
import { useLogoutMutation } from '../api/useLogoutMutation';
import { AuthContext } from '../hooks/useAuth';
import { subscribeAuthEvent } from '../utils/authEvent.utils';
import { clearSession } from '../utils/session.utils';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();

  // Session (reprise via le cookie de refresh au chargement)
  const { data: session, isLoading } = useSessionQuery();
  const userId = session?.userId;

  // Profil du compte
  const { data: user } = useUserQuery(userId);

  // Déconnexion
  const { mutateAsync: logoutRequest } = useLogoutMutation();
  const logout = useCallback(async () => {
    await logoutRequest().catch(() => undefined);
  }, [logoutRequest]);

  // Refresh impossible pendant une requête : la session est terminée
  useEffect(
    () =>
      subscribeAuthEvent((event) => {
        if (event === 'EXPIRED') {
          clearSession(queryClient);
          showError('Session expirée, veuillez vous reconnecter.', { id: 'session-expired' });
        }
      }),
    [queryClient]
  );

  const contextValue = useMemo(
    () => ({
      isAuthenticated: !!session,
      isLoading,
      userId,
      user,
      logout,
    }),
    [session, isLoading, userId, user, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
