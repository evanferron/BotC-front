import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IdCard, MessageSquare } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { Button } from '@common/components/Button/Button';
import { AUTH_ROUTES } from '@common/config/routes.config';
import { useAuth } from '@auth/hooks/useAuth';
import { usePlayersQuery } from '@games/api/games.api';
import { useScriptRoles } from '@scripts/api/useScriptQuery';
import { useMessagesQuery, useReadMessageMutation } from '@games/api/messages.api';
import type { Game } from '@games/types/game.types';
import { getPhaseLabel, getPhaseVariant } from '@games/utils/game.utils';
import { GrimoireAction } from '@games/components/table/GrimoireAction/GrimoireAction';
import { PauseAction } from '@games/components/table/PauseAction/PauseAction';
import { MessageView } from '@games/components/shared/MessageView/MessageView';
import { MyRoleSheet } from '@games/components/shared/MyRoleSheet/MyRoleSheet';
import { PlayerDay } from '../PlayerDay/PlayerDay';
import { ScriptRolesAction } from '@games/components/shared/ScriptRolesAction/ScriptRolesAction';
import { SendInfoSheet } from '@games/components/table/SendInfoSheet/SendInfoSheet';
import { StorytellerDay } from '../StorytellerDay/StorytellerDay';

interface DayViewProps {
  game: Game;
  isStoryteller: boolean;
}

type OpenSheet = 'info' | 'role';

/**
 * Jour, conseil et vote (phases Day, Council, Voting) : le bandeau et les messages du conteur
 * sont communs ; le reste dépend de la place (conteur ou joueur).
 */
export const DayView = ({ game, isStoryteller }: DayViewProps) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { data: players = [] } = usePlayersQuery(game.id, true);
  const roles = useScriptRoles(game.script_id) ?? [];
  const { data: messages = [] } = useMessagesQuery(game.id, !isStoryteller);
  const { mutate: readMessage } = useReadMessageMutation();
  const [openSheet, setOpenSheet] = useState<OpenSheet>();
  const closeSheet = useCallback(() => setOpenSheet(undefined), []);

  const alive = players.filter((p) => p.is_alive).length;
  const isDead = players.find((p) => p.user_id === userId)?.is_alive === false;
  const unread = isStoryteller ? undefined : messages.find((m) => !m.read_at);

  const header = (
    <PhaseBar
      title={getPhaseLabel(game)}
      variant={getPhaseVariant(game.status)}
      // Pour un mort, l'étiquette remplace le compteur (visible dans la liste) : le titre reste lisible
      meta={isDead ? undefined : `${alive} en vie`}
      tag={isDead ? 'Mort' : undefined}
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
          {isStoryteller && <PauseAction game={game} />}
          {isStoryteller ? <GrimoireAction game={game} /> : <ScriptRolesAction game={game} />}
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

  const sheets = (
    <>
      {openSheet === 'info' && (
        <SendInfoSheet gameId={game.id} players={players} roles={roles} onClose={closeSheet} />
      )}
      {openSheet === 'role' && <MyRoleSheet gameId={game.id} onClose={closeSheet} />}
    </>
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
        {sheets}
      </Screen>
    );
  }

  return (
    <>
      {isStoryteller ? (
        <StorytellerDay game={game} players={players} header={header} />
      ) : (
        <PlayerDay game={game} players={players} header={header} />
      )}
      {sheets}
    </>
  );
};
