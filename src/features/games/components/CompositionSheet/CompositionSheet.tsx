import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@common/components/Button/Button';
import { CheckboxRow } from '@common/components/CheckboxRow/CheckboxRow';
import { FullScreenSheet } from '@common/components/FullScreenSheet/FullScreenSheet';
import { Loading } from '@common/components/Loading/Loading';
import { Segmented } from '@common/components/Segmented/Segmented';
import { showSuccess } from '@common/utils/toast.utils';
import { cx } from '@common/utils/className.utils';
import { CHARACTER_TYPES, getGroupLabel } from '@scripts/utils/role.utils';
import { useCompositionQuery } from '../../api/useCompositionQuery';
import { useScriptRolesQuery } from '../../api/useScriptRolesQuery';
import { useSetCompositionMutation } from '../../api/useSetCompositionMutation';
import type { Composition } from '../../types/composition.types';
import type { Game, RoleSummary } from '../../types/game.types';
import {
  DRUNK_ROLE_ID,
  countByType,
  describeBreakdown,
  describeDeviation,
  expectedBreakdown,
  getCompositionStatus,
} from '../../utils/composition.utils';
import { RolePicker } from '../RolePicker/RolePicker';
import styles from './CompositionSheet.module.scss';

type Mode = 'random' | 'chosen';

const MODE_OPTIONS = [
  { value: 'random' as const, label: 'Au hasard' },
  { value: 'chosen' as const, label: 'Choisie' },
];

interface CompositionSheetProps {
  game: Game;
  onClose: () => void;
}

interface CompositionEditorProps extends CompositionSheetProps {
  composition: Composition;
  roles: RoleSummary[];
}

const byName = (a: RoleSummary, b: RoleSummary) => a.name.localeCompare(b.name, 'fr');

/**
 * Composition (design/C1-Creation 02b et 02c) : le conteur choisit les rôles en jeu, ou laisse le
 * tirage au hasard selon la répartition conseillée. Le compteur bloque tant qu'il n'y a pas autant
 * de rôles que de joueurs ; une répartition inhabituelle n'est qu'un avertissement.
 */
const CompositionEditor = ({ game, composition, roles, onClose }: CompositionEditorProps) => {
  const { mutateAsync: save, isPending } = useSetCompositionMutation();
  const [mode, setMode] = useState<Mode>(composition.random ? 'random' : 'chosen');
  const [selected, setSelected] = useState(() => composition.cards.map((c) => c.role_id));
  const [drunkShown, setDrunkShown] = useState(
    () => composition.cards.find((c) => c.role_id === DRUNK_ROLE_ID)?.shown_role_id ?? undefined
  );

  const counts = countByType(selected, roles);
  const expected = composition.recommended
    ? expectedBreakdown(composition.recommended, selected)
    : undefined;
  const status = getCompositionStatus(selected, roles, game.player_count);
  const deviation = expected && status.ready ? describeDeviation(counts, expected) : undefined;
  const hasDrunk = selected.includes(DRUNK_ROLE_ID);
  const freeTownsfolk = roles
    .filter((r) => r.character_type === 'Townsfolk' && !selected.includes(r.id))
    .sort(byName);
  // Un rôle affiché devenu en jeu n'est plus valable : retour au tirage
  const shown = drunkShown && !selected.includes(drunkShown) ? drunkShown : undefined;

  const toggle = (roleId: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, roleId] : current.filter((id) => id !== roleId)
    );

  const submit = async () => {
    const cards =
      mode === 'random'
        ? []
        : selected.map((role_id) => ({
            role_id,
            shown_role_id: role_id === DRUNK_ROLE_ID ? (shown ?? null) : null,
          }));
    try {
      await save({ gameId: game.id, cards });
      showSuccess(mode === 'random' ? 'Composition tirée au lancement' : 'Composition enregistrée');
      onClose();
    } catch {
      // Toast affiché par la mutation
    }
  };

  return (
    <FullScreenSheet title="Composition" closeLabel="Fermer la composition" onClose={onClose}>
      <Segmented label="Rôles en jeu" options={MODE_OPTIONS} value={mode} onChange={setMode} />

      {mode === 'random' ? (
        <p className={styles.hint}>
          Les rôles seront tirés au lancement
          {composition.recommended && ` : ${describeBreakdown(composition.recommended)}`}. Le Baron
          ajoute deux Étrangers, l’Ivrogne reçoit un Villageois absent.
        </p>
      ) : (
        <>
          <div className={cx(styles.counter, !status.ready && styles.invalid)} aria-live="polite">
            <span className={styles.total}>
              {selected.length} rôle{selected.length > 1 ? 's' : ''} / {game.player_count} joueurs
            </span>
            <span className={styles.status}>
              {status.ready ? 'La composition est cohérente.' : status.message}
            </span>
          </div>
          {deviation && (
            <p className={styles.warning}>
              <AlertTriangle aria-hidden="true" />
              {deviation}
            </p>
          )}

          {CHARACTER_TYPES.map((type) => {
            const ofType = roles.filter((r) => r.character_type === type).sort(byName);
            if (ofType.length === 0) return null;
            return (
              <section key={type} className={styles.group} aria-label={getGroupLabel(type, 2)}>
                <h3 className={styles.group_title}>
                  {getGroupLabel(type, 2)}
                  <span className={styles.group_count}>
                    {counts[type]}
                    {expected && ` / ${expected[type]}`}
                  </span>
                </h3>
                {ofType.map((role) => (
                  <CheckboxRow
                    key={role.id}
                    label={role.name}
                    checked={selected.includes(role.id)}
                    onChange={(checked) => toggle(role.id, checked)}
                  />
                ))}
              </section>
            );
          })}

          {hasDrunk && (
            <section className={styles.group}>
              <h3 className={styles.group_title}>L’Ivrogne croit être</h3>
              <p className={styles.hint}>
                {shown
                  ? 'Touchez à nouveau pour revenir au tirage.'
                  : 'Au hasard parmi les Villageois absents, ou choisissez.'}
              </p>
              <RolePicker
                label="Rôle montré à l’Ivrogne"
                roles={freeTownsfolk}
                selected={shown ? [shown] : []}
                max={1}
                onChange={(ids) => setDrunkShown(ids[0])}
              />
            </section>
          )}
        </>
      )}

      <div className={styles.actions}>
        <Button
          isLoading={isPending}
          disabled={mode === 'chosen' && !status.ready}
          onClick={() => void submit()}
        >
          Enregistrer
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </FullScreenSheet>
  );
};

export const CompositionSheet = ({ game, onClose }: CompositionSheetProps) => {
  const { data: composition } = useCompositionQuery(game.id);
  const { data: roles } = useScriptRolesQuery(game.id);

  if (!composition || !roles) {
    return (
      <FullScreenSheet title="Composition" closeLabel="Fermer la composition" onClose={onClose}>
        <Loading label="Lecture de la composition…" />
      </FullScreenSheet>
    );
  }
  return (
    <CompositionEditor game={game} composition={composition} roles={roles} onClose={onClose} />
  );
};
