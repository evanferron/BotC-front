import { useState } from 'react';
import {
  ArrowDownUp,
  BookOpen,
  ChevronRight,
  Ghost,
  NotebookPen,
  ScrollText,
  Skull,
} from 'lucide-react';
import { Button } from '@common/components/Button/Button';
import { FullScreenSheet } from '@common/components/FullScreenSheet/FullScreenSheet';
import { Loading } from '@common/components/Loading/Loading';
import { PlayerDisc } from '@common/components/PlayerDisc/PlayerDisc';
import { Pill } from '@common/components/Pill/Pill';
import { Segmented } from '@common/components/Segmented/Segmented';
import { showSuccess } from '@common/utils/toast.utils';
import { cx } from '@common/utils/className.utils';
import { getTeamLabel } from '@scripts/utils/role.utils';
import { useGrimoireQuery } from '../../api/useGrimoireQuery';
import { useCorrectPlayerMutation } from '../../api/useCorrectPlayerMutation';
import { useReorderSeatsMutation } from '../../api/useReorderSeatsMutation';
import { useScriptRolesQuery } from '../../api/useScriptRolesQuery';
import type { Game } from '../../types/game.types';
import type { GrimoirePlayer, PlayerStateCorrection } from '../../types/grimoire.types';
import { CorrectionSheet } from '../CorrectionSheet/CorrectionSheet';
import { EndGameSheet } from '../EndGameSheet/EndGameSheet';
import { GrimoireCircle } from '../GrimoireCircle/GrimoireCircle';
import { JournalSheet } from '../JournalSheet/JournalSheet';
import { GameScriptRolesSheet } from '../ScriptRolesAction/ScriptRolesAction';
import { SeatOrderList } from '../SeatOrderList/SeatOrderList';
import { TokenBadges } from '../TokenBadges/TokenBadges';
import styles from './GrimoireSheet.module.scss';

interface GrimoireSheetProps {
  game: Game;
  onClose: () => void;
}

type GrimoireView = 'list' | 'circle';

const VIEW_OPTIONS = [
  { value: 'list' as const, label: 'Liste' },
  { value: 'circle' as const, label: 'Cercle' },
];

const describeRole = (player: GrimoirePlayer) => {
  const parts = [player.role?.name ?? 'Sans rôle'];
  if (player.alignment) parts.push(getTeamLabel(player.alignment).toLowerCase());
  return parts.join(' · ');
};

interface GrimoireListProps {
  players: GrimoirePlayer[];
  onSelect: (player: GrimoirePlayer) => void;
}

// Vue liste (13a) : une ligne par joueur, dans l'ordre de la table
const GrimoireList = ({ players, onSelect }: GrimoireListProps) => (
  <ul className={styles.list} aria-label="Joueurs du grimoire">
    {players.map((player) => (
      <li key={player.id}>
        <button
          type="button"
          className={cx(styles.row, !player.is_alive && styles.dead)}
          onClick={() => onSelect(player)}
        >
          <PlayerDisc name={player.pseudo} dead={!player.is_alive} />
          <span className={styles.text}>
            <span className={styles.name}>{player.pseudo}</span>
            <span className={cx(styles.role, player.alignment === 'Evil' && styles.evil)}>
              {describeRole(player)}
            </span>
            {player.shown_role && <small>Croit être {player.shown_role.name}</small>}
            {player.registered_role && <small>Perçu comme {player.registered_role.name}</small>}
          </span>
          <span className={styles.states}>
            <TokenBadges tokens={player.tokens} />
            {!player.is_alive &&
              (player.has_ghost_vote ? (
                <Pill icon={<Ghost aria-hidden="true" />}>Voix</Pill>
              ) : (
                <Pill icon={<Skull aria-hidden="true" />}>Mort</Pill>
              ))}
            {player.note && <NotebookPen aria-label="Note" className={styles.note} />}
          </span>
          <ChevronRight aria-hidden="true" className={styles.chevron} />
        </button>
      </li>
    ))}
  </ul>
);

/**
 * Grimoire (design/C4-Grimoire 13a et 13b, C7 écran 14) : chaque joueur avec son rôle, son équipe,
 * sa vie et son vote fantôme, en liste ou en cercle, dans l'ordre de la table. Un appui ouvre la
 * fiche de correction ; « Réorganiser » reproduit les places réelles.
 */
export const GrimoireSheet = ({ game, onClose }: GrimoireSheetProps) => {
  const { data: players, isLoading } = useGrimoireQuery(game.id);
  const { data: roles = [] } = useScriptRolesQuery(game.id);
  const { mutateAsync: correct, isPending } = useCorrectPlayerMutation();
  const { mutateAsync: reorder, isPending: isReordering } = useReorderSeatsMutation();
  const [view, setView] = useState<GrimoireView>('list');
  const [isReorganising, setIsReorganising] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [showRoles, setShowRoles] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const selected = players?.find((p) => p.id === selectedId);

  const apply = async (player: GrimoirePlayer, correction: PlayerStateCorrection) => {
    try {
      await correct({ gameId: game.id, playerId: player.id, correction });
      showSuccess(`${player.pseudo} corrigé`);
      setSelectedId(undefined);
    } catch {
      // Toast affiché par la mutation
    }
  };

  const saveOrder = async (playerIds: string[]) => {
    try {
      await reorder({ gameId: game.id, playerIds });
      showSuccess('Ordre de la table enregistré');
      setIsReorganising(false);
    } catch {
      // Toast affiché par la mutation
    }
  };

  if (isReorganising && players) {
    return (
      <FullScreenSheet
        title="Réorganiser la table"
        closeLabel="Annuler la réorganisation"
        onClose={() => setIsReorganising(false)}
      >
        <SeatOrderList
          players={players}
          isSaving={isReordering}
          onSave={(playerIds) => void saveOrder(playerIds)}
          onCancel={() => setIsReorganising(false)}
        />
      </FullScreenSheet>
    );
  }

  return (
    <FullScreenSheet title="Grimoire" closeLabel="Fermer le grimoire" onClose={onClose}>
      <Button
        variant="ghost"
        leadingIcon={<BookOpen aria-hidden="true" />}
        onClick={() => setShowRoles(true)}
      >
        Rôles du script · en jeu et absents
      </Button>
      <Button
        variant="ghost"
        leadingIcon={<ScrollText aria-hidden="true" />}
        onClick={() => setShowJournal(true)}
      >
        Journal · tout voir, annuler
      </Button>
      <Segmented label="Affichage" options={VIEW_OPTIONS} value={view} onChange={setView} />
      {(isLoading || !players) && <Loading label="Lecture du grimoire…" />}
      {players && view === 'circle' && (
        <GrimoireCircle players={players} onSelect={(player) => setSelectedId(player.id)} />
      )}
      {players && view === 'list' && (
        <GrimoireList players={players} onSelect={(player) => setSelectedId(player.id)} />
      )}
      {game.status !== 'Ended' && (
        <>
          <Button
            variant="ghost"
            leadingIcon={<ArrowDownUp aria-hidden="true" />}
            disabled={!players}
            onClick={() => setIsReorganising(true)}
          >
            Réorganiser la table
          </Button>
          <Button variant="secondary" onClick={() => setIsEnding(true)}>
            Terminer la partie
          </Button>
        </>
      )}
      {showJournal && <JournalSheet game={game} onClose={() => setShowJournal(false)} />}
      {isEnding && <EndGameSheet game={game} onClose={() => setIsEnding(false)} />}
      {showRoles && (
        <GameScriptRolesSheet game={game} isStoryteller onClose={() => setShowRoles(false)} />
      )}
      {selected && (
        <CorrectionSheet
          key={selected.id}
          player={selected}
          roles={roles}
          isLoading={isPending}
          onApply={(correction) => void apply(selected, correction)}
          onClose={() => setSelectedId(undefined)}
        />
      )}
    </FullScreenSheet>
  );
};
