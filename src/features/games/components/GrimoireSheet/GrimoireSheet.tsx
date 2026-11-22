import { useState } from 'react';
import { BookOpen, ChevronRight, Ghost, NotebookPen, Skull } from 'lucide-react';
import { Button } from '@common/components/Button/Button';
import { FullScreenSheet } from '@common/components/FullScreenSheet/FullScreenSheet';
import { Loading } from '@common/components/Loading/Loading';
import { PlayerDisc } from '@common/components/PlayerDisc/PlayerDisc';
import { Pill } from '@common/components/Pill/Pill';
import { showSuccess } from '@common/utils/toast.utils';
import { cx } from '@common/utils/className.utils';
import { getTeamLabel } from '@scripts/utils/role.utils';
import { useGrimoireQuery } from '../../api/useGrimoireQuery';
import { useCorrectPlayerMutation } from '../../api/useCorrectPlayerMutation';
import { useScriptRolesQuery } from '../../api/useScriptRolesQuery';
import type { Game } from '../../types/game.types';
import type { GrimoirePlayer, PlayerStateCorrection } from '../../types/grimoire.types';
import { CorrectionSheet } from '../CorrectionSheet/CorrectionSheet';
import { EndGameSheet } from '../EndGameSheet/EndGameSheet';
import { GameScriptRolesSheet } from '../ScriptRolesAction/ScriptRolesAction';
import styles from './GrimoireSheet.module.scss';

interface GrimoireSheetProps {
  game: Game;
  onClose: () => void;
}

const describeRole = (player: GrimoirePlayer) => {
  const parts = [player.role?.name ?? 'Sans rôle'];
  if (player.alignment) parts.push(getTeamLabel(player.alignment).toLowerCase());
  return parts.join(' · ');
};

/**
 * Grimoire, vue liste (design/C4-Grimoire 13a) : chaque joueur avec son rôle, son équipe, sa vie
 * et son vote fantôme. Un appui ouvre la fiche de correction.
 */
export const GrimoireSheet = ({ game, onClose }: GrimoireSheetProps) => {
  const { data: players, isLoading } = useGrimoireQuery(game.id);
  const { data: roles = [] } = useScriptRolesQuery(game.id);
  const { mutateAsync: correct, isPending } = useCorrectPlayerMutation();
  const [selectedId, setSelectedId] = useState<string>();
  const [showRoles, setShowRoles] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
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

  return (
    <FullScreenSheet title="Grimoire" closeLabel="Fermer le grimoire" onClose={onClose}>
      <Button
        variant="ghost"
        leadingIcon={<BookOpen aria-hidden="true" />}
        onClick={() => setShowRoles(true)}
      >
        Rôles du script · en jeu et absents
      </Button>
      {isLoading || !players ? (
        <Loading label="Lecture du grimoire…" />
      ) : (
        <ul className={styles.list} aria-label="Joueurs du grimoire">
          {players.map((player) => (
            <li key={player.id}>
              <button
                type="button"
                className={cx(styles.row, !player.is_alive && styles.dead)}
                onClick={() => setSelectedId(player.id)}
              >
                <PlayerDisc name={player.pseudo} dead={!player.is_alive} />
                <span className={styles.text}>
                  <span className={styles.name}>{player.pseudo}</span>
                  <span className={cx(styles.role, player.alignment === 'Evil' && styles.evil)}>
                    {describeRole(player)}
                  </span>
                  {player.shown_role && <small>Croit être {player.shown_role.name}</small>}
                  {player.registered_role && (
                    <small>Perçu comme {player.registered_role.name}</small>
                  )}
                </span>
                <span className={styles.states}>
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
      )}
      {game.status !== 'Ended' && (
        <Button variant="secondary" onClick={() => setIsEnding(true)}>
          Terminer la partie
        </Button>
      )}
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
