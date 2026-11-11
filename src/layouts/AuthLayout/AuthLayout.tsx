import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@auth/hooks/useAuth';
import { PUBLIC_ROUTES } from '@/config/routes.config';
import { Loading } from '@/components/Loading/Loading';

// Garde des routes protégées : sans session, retour à la connexion (puis retour ici)
export const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loading label="Retour à la table…" />;
  if (!isAuthenticated)
    return <Navigate to={PUBLIC_ROUTES.LOGIN} replace state={{ from: location }} />;
  return <Outlet />;
};
