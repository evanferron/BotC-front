import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { Button } from '@common/components/Button/Button';
import { ProgressBar } from '@common/components/ProgressBar/ProgressBar';
import { Loading } from '@common/components/Loading/Loading';
import { AUTH_ROUTES } from '@common/config/routes.config';
import { useAuth } from '@auth/hooks/useAuth';
import { useUserQuery } from '@auth/api/useUserQuery';
import { usePlayersQuery } from '@games/api/games.api';
import { useLeaveGameMutation } from '@games/api/table.api';
import type { Game } from '@games/types/game.types';
import { InstallCard } from '../InstallCard/InstallCard';
import { PlayerList } from '../PlayerList/PlayerList';
import { ScriptRolesAction } from '@games/components/shared/ScriptRolesAction/ScriptRolesAction';
import styles from './WaitingRoom.module.scss';

interface WaitingRoomProps {
  game: Game;
}

// Écran 05a (J1-Rejoindre) : le joueur attend que le conteur lance la partie
export const WaitingRoom = ({ game }: WaitingRoomProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: players, isLoading } = usePlayersQuery(game.id, true);
  const { data: storyteller } = useUserQuery(
    game.storyteller_id,
    'Impossible de récupérer le Conteur'
  );
  const { mutateAsync: leaveGame, isPending: isLeaving } = useLeaveGameMutation();

  const joined = players?.length ?? 0;

  const handleLeave = async () => {
    try {
      await leaveGame(game.id);
      void navigate(AUTH_ROUTES.GAMES, { replace: true });
    } catch {
      // Toast affiché par la mutation
    }
  };

  return (
    <Screen
      header={
        <PhaseBar
          title="Salle d'attente"
          meta={`${joined} / ${game.player_count}`}
          actions={
            <>
              <ScriptRolesAction game={game} />
              <PhaseBarAction
                aria-label="Retour à mes parties"
                onClick={() => void navigate(AUTH_ROUTES.GAMES)}
              >
                <ArrowLeft aria-hidden="true" />
              </PhaseBarAction>
            </>
          }
        />
      }
      footer={
        <>
          <p className={styles.footnote}>La partie commence quand le Conteur la lance.</p>
          <Button variant="ghost" isLoading={isLeaving} onClick={() => void handleLeave()}>
            Quitter la table
          </Button>
        </>
      }
    >
      <div className={styles.table}>
        <span className={styles.eyebrow}>Table</span>
        <span className={styles.code}>{game.room_code}</span>
      </div>
      <p className={styles.text}>En attendant le Conteur.</p>
      <ProgressBar value={joined} max={game.player_count} label="Joueurs présents" />
      <InstallCard />

      {isLoading ? (
        <Loading label="Chargement des joueurs…" />
      ) : (
        <PlayerList
          players={players ?? []}
          storytellerPseudo={storyteller?.pseudo}
          currentUserId={user?.id}
          maxPlayers={game.player_count}
        />
      )}
    </Screen>
  );
};
