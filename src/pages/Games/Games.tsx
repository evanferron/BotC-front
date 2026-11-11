import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Loading } from '@/components/Loading/Loading';
import { AUTH_ROUTES } from '@/config/routes.config';
import { useAuth } from '@auth/hooks/useAuth';
import { useGamesQuery } from '@games/api/useGamesQuery';
import { GameCard } from '@games/components/GameCard/GameCard';
import styles from './Games.module.scss';

// Écran 23c « Mes parties » (C7-Journal-Parties-Cas) : accueil une fois connecté
export const Games = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: games, isLoading, isError, refetch } = useGamesQuery();

  useEffect(() => {
    document.title = 'Mes parties · Cadran';
  }, []);

  const renderContent = () => {
    if (isLoading) return <Loading />;
    if (isError) {
      return (
        <Card className={styles.empty}>
          <p className={styles.text}>Vos parties n'ont pas pu être chargées.</p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Réessayer
          </Button>
        </Card>
      );
    }
    if (!games?.length) {
      return (
        <Card className={styles.empty}>
          <h2 className={styles.empty_title}>Aucune partie pour l'instant</h2>
          <p className={styles.text}>
            Ouvrez une table, ou rejoignez-en une avec le code du Conteur.
          </p>
        </Card>
      );
    }
    return (
      <ul className={styles.list}>
        {games.map((game) => (
          <li key={game.id}>
            <GameCard game={game} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Screen
      header={
        <PhaseBar
          title="Mes parties"
          actions={
            <PhaseBarAction aria-label="Se déconnecter" onClick={() => void logout()}>
              <LogOut aria-hidden="true" />
            </PhaseBarAction>
          }
        />
      }
      footer={
        <>
          <Button size="xl" onClick={() => void navigate(AUTH_ROUTES.NEW_GAME)}>
            Nouvelle partie
          </Button>
          <Button variant="secondary" onClick={() => void navigate(AUTH_ROUTES.JOIN)}>
            Rejoindre une table
          </Button>
        </>
      }
    >
      {user && (
        <p className={styles.text}>
          Connecté en tant que <strong className={styles.pseudo}>{user.pseudo}</strong>
        </p>
      )}
      {renderContent()}
    </Screen>
  );
};
