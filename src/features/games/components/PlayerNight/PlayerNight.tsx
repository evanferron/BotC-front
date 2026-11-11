import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IdCard } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { Button } from '@/components/Button/Button';
import { Dial } from '@/components/Dial/Dial';
import { AUTH_ROUTES } from '@/config/routes.config';
import { useAuth } from '@auth/hooks/useAuth';
import { usePlayersQuery } from '../../api/usePlayersQuery';
import { useScriptRolesQuery } from '../../api/useScriptRolesQuery';
import { usePromptQuery } from '../../api/usePromptQuery';
import { useRespondMutation } from '../../api/useRespondMutation';
import { useMessagesQuery } from '../../api/useMessagesQuery';
import { useReadMessageMutation } from '../../api/useReadMessageMutation';
import { useCardsQuery } from '../../api/useCardsQuery';
import type { Game } from '../../types/game.types';
import type { ActionKind } from '../../types/night.types';
import { getPhaseLabel } from '../../utils/game.utils';
import { getChoiceShape, isChoiceComplete, toStepChoice } from '../../utils/night.utils';
import { hasSeenRole, markRoleSeen } from '../../utils/roleSeen.utils';
import { MessageView } from '../MessageView/MessageView';
import { MyRoleSheet } from '../MyRoleSheet/MyRoleSheet';
import { PlayerPicker } from '../PlayerPicker/PlayerPicker';
import { RoleCard } from '../RoleCard/RoleCard';
import { RolePicker } from '../RolePicker/RolePicker';
import styles from './PlayerNight.module.scss';

interface PlayerNightProps {
  game: Game;
}

const PROMPT_TEXTS: Record<ActionKind, { title: string; text: string }> = {
  ChooseOnePlayer: { title: 'Qui désignez-vous ?', text: 'Touchez un joueur, puis confirmez.' },
  ChooseTwoPlayers: { title: 'Deux joueurs', text: 'Choisissez deux joueurs différents.' },
  ChooseRole: { title: 'Quel rôle ?', text: 'Un rôle parmi ceux du script.' },
  Confirm: {
    title: 'Le Conteur vous parle.',
    text: "Touchez quand vous avez compris, l'écran se rendormira.",
  },
  None: {
    title: 'Le Conteur vous parle.',
    text: "Touchez quand vous avez compris, l'écran se rendormira.",
  },
};

/**
 * Écran 11 (J3-Nuit) : la nuit, tous les téléphones se ressemblent. L'attente est identique pour
 * tous ; un message ou une demande du Conteur prend sa place, puis l'écran retombe sur l'attente.
 */
export const PlayerNight = ({ game }: PlayerNightProps) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { data: players = [] } = usePlayersQuery(game.id);
  const { data: roles = [] } = useScriptRolesQuery(game.id);
  const { data: promptData } = usePromptQuery(game.id, true);
  const { data: messages = [] } = useMessagesQuery(game.id, true);
  const { data: distribution } = useCardsQuery(game.id);
  const { mutateAsync: respond, isPending: isResponding } = useRespondMutation();
  const { mutate: readMessage } = useReadMessageMutation();

  // Première nuit : le joueur découvre d'abord sa carte, s'il ne l'a pas encore vue
  const [isRevealing, setIsRevealing] = useState(
    () => game.status === 'FirstNight' && !hasSeenRole(game.id)
  );
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);
  const closeRoleSheet = useCallback(() => setIsRoleSheetOpen(false), []);

  // Sélection en cours, remise à zéro à chaque nouvelle demande
  const [selection, setSelection] = useState<{
    stepId?: string;
    players: string[];
    roles: string[];
  }>({ players: [], roles: [] });

  const prompt = promptData?.prompt;
  const unread = messages.find((m) => !m.read_at);
  const myRole = distribution?.my_role;
  const selectedPlayers = selection.stepId === prompt?.step_id ? selection.players : [];
  const selectedRoles = selection.stepId === prompt?.step_id ? selection.roles : [];

  const header = (
    <PhaseBar
      title="Nuit"
      variant="night"
      tag={getPhaseLabel(game)}
      actions={
        <>
          {myRole && !isRevealing && (
            <PhaseBarAction aria-label="Mon rôle" onClick={() => setIsRoleSheetOpen(true)}>
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

  const roleSheet = isRoleSheetOpen && <MyRoleSheet gameId={game.id} onClose={closeRoleSheet} />;

  // 08a / 08b : découverte de la carte au début de la première nuit
  if (isRevealing && myRole) {
    return (
      <Screen
        header={header}
        centered
        footer={
          <>
            <p className={styles.footnote}>Gardez votre rôle secret.</p>
            <Button
              disabled={!hasRevealed}
              onClick={() => {
                markRoleSeen(game.id);
                setIsRevealing(false);
              }}
            >
              J'ai vu mon rôle
            </Button>
          </>
        }
      >
        <span className={styles.eyebrow}>Votre carte</span>
        <RoleCard role={myRole} masked onReveal={() => setHasRevealed(true)} />
      </Screen>
    );
  }

  // 11b : information du Conteur
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
        {roleSheet}
      </Screen>
    );
  }

  // 11c à 11f : demande du Conteur selon le gabarit
  if (prompt) {
    const kind = prompt.action_kind;
    const shape = getChoiceShape(kind);
    const texts = PROMPT_TEXTS[kind];
    const complete = isChoiceComplete(kind, selectedPlayers, selectedRoles);
    const names = [
      ...selectedPlayers.map((id) => players.find((p) => p.id === id)?.pseudo),
      ...selectedRoles.map((id) => roles.find((r) => r.id === id)?.name),
    ].filter(Boolean);

    let confirmLabel = "J'ai compris";
    if (shape.players + shape.roles > 0) {
      confirmLabel = complete ? `Confirmer : ${names.join(' et ')}` : 'Faites votre choix';
      if (shape.players === 2 && selectedPlayers.length === 1) {
        confirmLabel = 'Choisissez un second joueur';
      }
    }

    const handleConfirm = async () => {
      try {
        await respond({ gameId: game.id, choice: toStepChoice(selectedPlayers, selectedRoles) });
        setSelection({ players: [], roles: [] });
      } catch {
        // Toast affiché par la mutation
      }
    };

    return (
      <Screen
        header={header}
        centered={shape.players + shape.roles === 0}
        footer={
          <Button
            size="xl"
            disabled={!complete}
            isLoading={isResponding}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        }
      >
        <h2 className={styles.title}>
          {texts.title}
          {shape.players === 2 && (
            <span className={styles.counter}> {selectedPlayers.length} / 2</span>
          )}
        </h2>
        <p className={styles.text}>{texts.text}</p>
        {shape.players > 0 && (
          <PlayerPicker
            players={players}
            selected={selectedPlayers}
            max={shape.players}
            currentUserId={userId}
            onChange={(ids) =>
              setSelection({ stepId: prompt.step_id, players: ids, roles: selectedRoles })
            }
            label="Joueurs"
          />
        )}
        {shape.roles > 0 && (
          <RolePicker
            roles={roles}
            selected={selectedRoles}
            max={shape.roles}
            onChange={(ids) =>
              setSelection({ stepId: prompt.step_id, players: selectedPlayers, roles: ids })
            }
            label="Rôles du script"
          />
        )}
        {roleSheet}
      </Screen>
    );
  }

  // 11a : attente neutre, identique pour tous
  return (
    <Screen header={header} centered>
      <Dial size="xl" angle={0} />
      <h2 className={styles.title}>Le village veille.</h2>
      <p className={styles.text}>Fermez les yeux. Le Conteur vous réveillera si besoin.</p>
      {roleSheet}
    </Screen>
  );
};
