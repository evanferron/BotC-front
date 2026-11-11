import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IdCard, MessageSquare, Skull } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { Button } from '@/components/Button/Button';
import { ConfirmSheet } from '@/components/ConfirmSheet/ConfirmSheet';
import { PlayerDisc } from '@/components/PlayerDisc/PlayerDisc';
import { Pill } from '@/components/Pill/Pill';
import { AUTH_ROUTES } from '@/config/routes.config';
import { useAuth } from '@auth/hooks/useAuth';
import { usePlayersQuery } from '../../api/usePlayersQuery';
import { useScriptRolesQuery } from '../../api/useScriptRolesQuery';
import { useMessagesQuery } from '../../api/useMessagesQuery';
import { useReadMessageMutation } from '../../api/useReadMessageMutation';
import { useStartNightMutation } from '../../api/useStartNightMutation';
import type { Game } from '../../types/game.types';
import { getPhaseLabel, getPhaseVariant } from '../../utils/game.utils';
import { MessageView } from '../MessageView/MessageView';
import { MyRoleSheet } from '../MyRoleSheet/MyRoleSheet';
import { SendInfoSheet } from '../SendInfoSheet/SendInfoSheet';
import styles from './DayView.module.scss';

interface DayViewProps {
  game: Game;
  isStoryteller: boolean;
}

type OpenSheet = 'night' | 'info' | 'role';

/**
 * Jour : la table discute. Les nominations et le vote arrivent à l'étape suivante ; pour l'instant
 * le jour montre qui est en vie et permet au Conteur de faire tomber la nuit.
 */
export const DayView = ({ game, isStoryteller }: DayViewProps) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { data: players = [] } = usePlayersQuery(game.id, true);
  const { data: roles = [] } = useScriptRolesQuery(game.id);
  const { data: messages = [] } = useMessagesQuery(game.id, !isStoryteller);
  const { mutate: readMessage } = useReadMessageMutation();
  const { mutateAsync: startNight, isPending: isStarting } = useStartNightMutation();
  const [openSheet, setOpenSheet] = useState<OpenSheet>();
  const closeSheet = useCallback(() => setOpenSheet(undefined), []);

  const sorted = [...players].sort(
    (a, b) => (a.seat_position ?? Infinity) - (b.seat_position ?? Infinity)
  );
  const alive = players.filter((p) => p.is_alive).length;
  const unread = isStoryteller ? undefined : messages.find((m) => !m.read_at);

  const handleStartNight = async () => {
    try {
      await startNight(game.id);
    } catch {
      // Toast affiché par la mutation
    } finally {
      setOpenSheet(undefined);
    }
  };

  const header = (
    <PhaseBar
      title={getPhaseLabel(game)}
      variant={getPhaseVariant(game.status)}
      meta={`${alive} en vie`}
      actions={
        <>
          {isStoryteller ? (
            <PhaseBarAction
              aria-label="Envoyer une information"
              onClick={() => setOpenSheet('info')}
            >
              <MessageSquare aria-hidden="true" />
            </PhaseBarAction>
          ) : (
            <PhaseBarAction aria-label="Mon rôle" onClick={() => setOpenSheet('role')}>
              <IdCard aria-hidden="true" />
            </PhaseBarAction>
          )}
          <PhaseBarAction
            aria-label="Retour à mes parties"
            onClick={() => void navigate(AUTH_ROUTES.GAMES)}
          >
            <ArrowLeft aria-hidden="true" />
          </PhaseBarAction>
        </>
      }
    />
  );

  if (unread) {
    return (
      <Screen
        header={header}
        centered
        footer={
          <Button size="xl" onClick={() => readMessage({ gameId: game.id, messageId: unread.id })}>
            Compris
          </Button>
        }
      >
        <MessageView message={unread} players={players} roles={roles} />
      </Screen>
    );
  }

  return (
    <Screen
      header={header}
      footer={
        isStoryteller ? (
          <>
            <p className={styles.footnote}>
              Les nominations et le vote arrivent à la prochaine étape.
            </p>
            <Button size="xl" onClick={() => setOpenSheet('night')}>
              Faire tomber la nuit
            </Button>
          </>
        ) : (
          <p className={styles.footnote}>Discutez. Le Conteur annoncera la suite.</p>
        )
      }
    >
      <span className={styles.eyebrow}>Le jour se lève</span>
      <h2 className={styles.title}>
        {alive} joueur{alive > 1 ? 's' : ''} en vie
      </h2>

      <ul className={styles.list} aria-label="Joueurs">
        {sorted.map((player) => (
          <li key={player.id} className={styles.row}>
            <PlayerDisc name={player.pseudo} dead={!player.is_alive} />
            <span className={styles.name}>
              {player.pseudo}
              {player.user_id === userId && <small>Vous</small>}
            </span>
            {!player.is_alive && <Pill icon={<Skull aria-hidden="true" />}>Mort</Pill>}
          </li>
        ))}
      </ul>

      <ConfirmSheet
        open={openSheet === 'night'}
        title="Faire tomber la nuit ?"
        description="Tous les joueurs ferment les yeux. Vous déroulerez ensuite l'ordre de nuit."
        confirmLabel="Faire tomber la nuit"
        tone="primary"
        isLoading={isStarting}
        onConfirm={() => void handleStartNight()}
        onCancel={closeSheet}
      />
      {openSheet === 'info' && (
        <SendInfoSheet gameId={game.id} players={players} roles={roles} onClose={closeSheet} />
      )}
      {openSheet === 'role' && <MyRoleSheet gameId={game.id} onClose={closeSheet} />}
    </Screen>
  );
};
