import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { Button } from '@/components/Button/Button';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { ConfirmSheet } from '@/components/ConfirmSheet/ConfirmSheet';
import { Loading } from '@/components/Loading/Loading';
import { ENV } from '@/config/api.config';
import { AUTH_ROUTES } from '@/config/routes.config';
import { useAuth } from '@auth/hooks/useAuth';
import { usePlayersQuery } from '../../api/usePlayersQuery';
import { useKickPlayerMutation } from '../../api/useKickPlayerMutation';
import { useStartGameMutation } from '../../api/useStartGameMutation';
import { useDevFillMutation } from '../../api/useDevFillMutation';
import { getScriptName } from '../../constants/SCRIPTS';
import type { Game, Player } from '../../types/game.types';
import { PlayerList } from '../PlayerList/PlayerList';
import { RoomCodeCard } from '../RoomCodeCard/RoomCodeCard';
import styles from './StorytellerLobby.module.scss';

interface StorytellerLobbyProps {
  game: Game;
}

// Écrans 03 et 06a/06b (C1-Creation, C2-Lobby) : le conteur partage le code et voit la table se remplir
export const StorytellerLobby = ({ game }: StorytellerLobbyProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: players, isLoading } = usePlayersQuery(game.id, true);
  const { mutateAsync: kickPlayer, isPending: isKicking } = useKickPlayerMutation();
  const { mutateAsync: startGame, isPending: isStarting } = useStartGameMutation();
  const { mutate: devFill, isPending: isFilling } = useDevFillMutation();

  // Joueur dont l'exclusion attend confirmation
  const [playerToKick, setPlayerToKick] = useState<Player>();
  const closeKickSheet = useCallback(() => setPlayerToKick(undefined), []);
  const [isStartSheetOpen, setIsStartSheetOpen] = useState(false);
  const closeStartSheet = useCallback(() => setIsStartSheetOpen(false), []);

  const joined = players?.length ?? 0;
  const missing = Math.max(0, game.player_count - joined);

  const handleStart = async () => {
    try {
      // La partie passe en distribution : la page affiche l'écran suivant
      await startGame(game.id);
    } catch {
      // Toast affiché par la mutation
    } finally {
      setIsStartSheetOpen(false);
    }
  };

  const handleKick = async () => {
    if (!playerToKick) return;
    try {
      await kickPlayer({ gameId: game.id, player: playerToKick });
    } finally {
      setPlayerToKick(undefined);
    }
  };

  return (
    <Screen
      header={
        <PhaseBar
          title="Lobby"
          tag="Lobby"
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
        <>
          <p className={styles.footnote}>
            {missing > 0
              ? `Il manque ${missing} joueur${missing > 1 ? 's' : ''} pour lancer.`
              : 'La table est complète.'}
          </p>
          <Button
            size="xl"
            disabled={missing > 0 || isLoading}
            onClick={() => setIsStartSheetOpen(true)}
          >
            Lancer la partie
          </Button>
          {ENV === 'DEV' && missing > 0 && (
            <Button variant="ghost" isLoading={isFilling} onClick={() => devFill(game.id)}>
              Compléter avec des comptes de test
            </Button>
          )}
        </>
      }
    >
      <RoomCodeCard roomCode={game.room_code} />

      <section className={styles.section} aria-labelledby="lobby-count">
        <div className={styles.count_row}>
          <h2 id="lobby-count" className={styles.count}>
            {joined} / {game.player_count} joueurs
          </h2>
          <span className={styles.script}>{getScriptName(game.script_id)}</span>
        </div>
        <ProgressBar value={joined} max={game.player_count} label="Joueurs présents" />

        {isLoading ? (
          <Loading label="Chargement des joueurs…" />
        ) : (
          <PlayerList
            players={players ?? []}
            storytellerPseudo={user?.pseudo}
            currentUserId={user?.id}
            maxPlayers={game.player_count}
            onKick={setPlayerToKick}
          />
        )}
      </section>

      <ConfirmSheet
        open={!!playerToKick}
        title={`Exclure ${playerToKick?.pseudo ?? ''} ?`}
        description="Il quitte la table. Il pourra la rejoindre à nouveau avec le code tant que la partie n'est pas lancée."
        confirmLabel="Exclure de la table"
        isLoading={isKicking}
        onConfirm={() => void handleKick()}
        onCancel={closeKickSheet}
      />

      <ConfirmSheet
        open={isStartSheetOpen}
        title="Lancer la partie ?"
        description="Plus personne ne pourra rejoindre la table. Chaque joueur choisira ensuite une carte face cachée, à son tour."
        confirmLabel="Lancer la partie"
        isLoading={isStarting}
        onConfirm={() => void handleStart()}
        onCancel={closeStartSheet}
      />
    </Screen>
  );
};
