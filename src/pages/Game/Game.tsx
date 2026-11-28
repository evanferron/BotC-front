import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { Button } from '@common/components/Button/Button';
import { Loading } from '@common/components/Loading/Loading';
import { AUTH_ROUTES } from '@common/config/routes.config';
import { getErrorCode } from '@common/api/errors';
import { useAuth } from '@auth/hooks/useAuth';
import { useGameQuery } from '@games/api/games.api';
import { useGameRealtime } from '@games/hooks/useGameRealtime';
import { StorytellerLobby } from '@games/components/lobby/StorytellerLobby/StorytellerLobby';
import { WaitingRoom } from '@games/components/lobby/WaitingRoom/WaitingRoom';
import { PlayerDistribution } from '@games/components/distribution/PlayerDistribution/PlayerDistribution';
import { StorytellerDistribution } from '@games/components/distribution/StorytellerDistribution/StorytellerDistribution';
import { StorytellerNight } from '@games/components/night/StorytellerNight/StorytellerNight';
import { PlayerNight } from '@games/components/night/PlayerNight/PlayerNight';
import { DayView } from '@games/components/day/DayView/DayView';
import { EndView } from '@games/components/end/EndView/EndView';
import { PausedView } from '@games/components/table/PausedView/PausedView';
import { ConnectionBanner } from '@games/components/shared/ConnectionBanner/ConnectionBanner';
import type { Game as GameData } from '@games/types/game.types';
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
  // Signaux du serveur : chaque changement de la partie recharge l'écran
  const isLive = useGameRealtime(gameId);

  useEffect(() => {
    document.title = game ? `Partie ${game.room_code} · BotC` : 'Partie · BotC';
  }, [game]);

  // Après une exclusion, la partie répond 404 alors que l'ancienne version reste en cache :
  // l'erreur l'emporte sur les données.
  const code = getErrorCode(error);
  const isGone = code === 'GAME_NOT_FOUND' || code === 'INVALID_PATH_PARAM';

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
  const isPlaying = game.status !== 'Lobby' && game.status !== 'Ended';
  return (
    <>
      {game.paused && game.status !== 'Ended' ? (
        <PausedView game={game} isStoryteller={isStoryteller} />
      ) : (
        <PhaseScreen game={game} isStoryteller={isStoryteller} />
      )}
      <ConnectionBanner
        offline={!isLive}
        storytellerAway={isPlaying && !isStoryteller && !game.storyteller_online}
      />
    </>
  );
};

// Écran de la phase en cours, selon la place du compte
const PhaseScreen = ({ game, isStoryteller }: { game: GameData; isStoryteller: boolean }) => {
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
    // Jour, conseil et vote
    case 'Day':
    case 'Council':
    case 'Voting':
      return <DayView game={game} isStoryteller={isStoryteller} />;
    case 'Ended':
      return <EndView game={game} isStoryteller={isStoryteller} />;
  }
};
