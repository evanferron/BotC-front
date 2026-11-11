import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { Button } from '@/components/Button/Button';
import { Loading } from '@/components/Loading/Loading';
import { AUTH_ROUTES } from '@/config/routes.config';
import { getErrorStatus } from '@/utils/api.utils';
import { useAuth } from '@auth/hooks/useAuth';
import { useGameQuery } from '@games/api/useGameQuery';
import { StorytellerLobby } from '@games/components/StorytellerLobby/StorytellerLobby';
import { WaitingRoom } from '@games/components/WaitingRoom/WaitingRoom';
import { GameStarted } from '@games/components/GameStarted/GameStarted';
import { PlayerDistribution } from '@games/components/PlayerDistribution/PlayerDistribution';
import { StorytellerDistribution } from '@games/components/StorytellerDistribution/StorytellerDistribution';
import { StorytellerNight } from '@games/components/StorytellerNight/StorytellerNight';
import { PlayerNight } from '@games/components/PlayerNight/PlayerNight';
import { DayView } from '@games/components/DayView/DayView';
import styles from './Game.module.scss';

/**
 * Point d'entrée d'une partie : choisit l'écran selon la phase et la place du compte
 * (conteur ou joueur).
 */
export const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { data: game, isLoading, error } = useGameQuery(gameId);

  useEffect(() => {
    document.title = game ? `Partie ${game.room_code} · BotC` : 'Partie · BotC';
  }, [game]);

  // Après une exclusion, la partie répond 404 alors que l'ancienne version reste en cache :
  // l'erreur l'emporte sur les données.
  const status = getErrorStatus(error);
  const isGone = status === 404 || status === 400;

  if (isLoading) {
    return (
      <Screen header={<PhaseBar title="Partie" />}>
        <Loading />
      </Screen>
    );
  }

  if (!game || isGone) {
    return (
      <Screen
        header={
          <PhaseBar
            title="Partie"
            actions={
              <PhaseBarAction
                aria-label="Retour à mes parties"
                onClick={() => void navigate(AUTH_ROUTES.GAMES)}
              >
                <ArrowLeft aria-hidden="true" />
              </PhaseBarAction>
            }
          />
        }
        footer={
          <Button variant="secondary" onClick={() => void navigate(AUTH_ROUTES.GAMES)}>
            Mes parties
          </Button>
        }
        centered
      >
        <h2 className={styles.title}>{isGone ? 'Table introuvable' : 'Partie indisponible'}</h2>
        <p className={styles.text}>
          {isGone
            ? "Cette table n'existe pas ou vous n'en faites plus partie."
            : "La partie n'a pas pu être chargée. Vérifiez votre connexion."}
        </p>
      </Screen>
    );
  }

  const isStoryteller = game.storyteller_id === userId;
  switch (game.status) {
    case 'Lobby':
      return isStoryteller ? <StorytellerLobby game={game} /> : <WaitingRoom game={game} />;
    case 'Distribution':
      return isStoryteller ? (
        <StorytellerDistribution game={game} />
      ) : (
        <PlayerDistribution game={game} />
      );
    case 'FirstNight':
    case 'Night':
      return isStoryteller ? <StorytellerNight game={game} /> : <PlayerNight game={game} />;
    // Le conseil et le vote (étape 7) s'afficheront ici ; en attendant, l'écran du jour
    case 'Day':
    case 'Council':
    case 'Voting':
      return <DayView game={game} isStoryteller={isStoryteller} />;
    default:
      return <GameStarted game={game} />;
  }
};
