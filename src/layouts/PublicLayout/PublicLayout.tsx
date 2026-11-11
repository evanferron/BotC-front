import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom';
import { useAuth } from '@auth/hooks/useAuth';
import { AUTH_ROUTES } from '@/config/routes.config';
import { Loading } from '@/components/Loading/Loading';

// Pages de connexion : un utilisateur déjà connecté repart là où il voulait aller
export const PublicLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from;

  if (isLoading) return <Loading label="Retour à la table…" />;
  if (isAuthenticated) {
    return <Navigate to={from ? `${from.pathname}${from.search}` : AUTH_ROUTES.GAMES} replace />;
  }
  return <Outlet />;
};
