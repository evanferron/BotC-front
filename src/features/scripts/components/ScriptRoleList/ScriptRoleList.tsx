import { useId, useMemo, useState } from 'react';
import { SearchX, WifiOff } from 'lucide-react';
import { Button } from '@common/components/Button/Button';
import { Pill } from '@common/components/Pill/Pill';
import { HAPTICS, vibrate } from '@common/utils/haptics.utils';
import { cx } from '@common/utils/className.utils';
import { TEAM_ICONS } from '../../constants/ROLE_ICONS';
import type { CharacterType, PinnedRole, RolesInPlay, ScriptRole } from '../../types/script.types';
import {
  CHARACTER_TYPES,
  getGroupLabel,
  getTeamLabel,
  getTypeTeam,
  groupByType,
  matchesSearch,
} from '../../utils/role.utils';
import { PinnedRoleRow } from '../PinnedRoleRow/PinnedRoleRow';
import { RoleDetailSheet } from '../RoleDetailSheet/RoleDetailSheet';
import { RoleRow } from '../RoleRow/RoleRow';
import styles from './ScriptRoleList.module.scss';

type TypeFilter = 'all' | CharacterType;
type PlayFilter = 'all' | 'in_play' | 'absent';

interface ScriptRoleListProps {
  roles: ScriptRole[];
  // Rôle du joueur, épinglé en haut et masqué (vue joueur en partie)
  pinned?: PinnedRole | null;
  // Variante conteur : rôles réellement en jeu et pseudos de leurs joueurs
  inPlay?: RolesInPlay;
  // Liste affichée depuis la copie locale, faute de connexion (écran R9)
  isOffline?: boolean;
}

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

const Chips = <T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) => (
  <div className={styles.chips} role="group" aria-label={label}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={cx(styles.chip, value === option.value && styles.chip_on)}
        aria-pressed={value === option.value}
        onClick={() => {
          vibrate(HAPTICS.select);
          onChange(option.value);
        }}
      >
        {option.label}
      </button>
    ))}
  </div>
);

/**
 * Rôles d'un script : recherche, filtres, groupes par type et fiche détail
 * (design/R1-Roles-du-script.dc.html). Le même contenu sert à la page hors partie et à la
 * feuille « Rôles » en partie. Côté joueur, jamais la composition réelle : seulement le script.
 */
export const ScriptRoleList = ({
  roles,
  pinned,
  inPlay,
  isOffline = false,
}: ScriptRoleListProps) => {
  const searchId = useId();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [playFilter, setPlayFilter] = useState<PlayFilter>('all');
  const [selected, setSelected] = useState<ScriptRole>();

  const isStorytellerView = inPlay !== undefined;

  const typeOptions = useMemo<ChipOption<TypeFilter>[]>(
    () => [
      { value: 'all', label: 'Tous' },
      ...CHARACTER_TYPES.filter((type) => roles.some((role) => role.character_type === type)).map(
        (type) => ({
          value: type,
          label: getGroupLabel(type, roles.filter((role) => role.character_type === type).length),
        })
      ),
    ],
    [roles]
  );

  const inPlayCount = isStorytellerView ? roles.filter((role) => inPlay.has(role.id)).length : 0;

  const visible = roles.filter((role) => {
    if (!matchesSearch(role, search)) return false;
    if (isStorytellerView) {
      if (playFilter === 'in_play') return inPlay.has(role.id);
      if (playFilter === 'absent') return !inPlay.has(role.id);
      return true;
    }
    return typeFilter === 'all' || role.character_type === typeFilter;
  });
  const groups = groupByType(visible);

  const reset = () => {
    setSearch('');
    setTypeFilter('all');
    setPlayFilter('all');
  };

  const select = (role: ScriptRole) => {
    vibrate(HAPTICS.tap);
    setSelected(role);
  };

  return (
    <div className={styles.list}>
      {isOffline && (
        <p className={styles.offline} role="status">
          <WifiOff aria-hidden="true" />
          Connexion perdue. Cette liste reste disponible.
        </p>
      )}

      {pinned && <PinnedRoleRow role={pinned} />}

      {isStorytellerView && (
        <div className={styles.storyteller}>
          <span className={styles.eyebrow}>Vue conteur</span>
          <span className={styles.count}>
            {inPlayCount} / {roles.length} en jeu
          </span>
        </div>
      )}

      <input
        id={searchId}
        type="search"
        className={styles.search}
        placeholder="Rechercher un rôle"
        aria-label="Rechercher un rôle"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        autoComplete="off"
        enterKeyHint="search"
      />

      {isStorytellerView ? (
        <Chips
          label="Filtrer"
          value={playFilter}
          onChange={setPlayFilter}
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'in_play', label: 'En jeu' },
            { value: 'absent', label: 'Absents' },
          ]}
        />
      ) : (
        <Chips
          label="Filtrer par type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
        />
      )}

      {search.trim() !== '' && visible.length > 0 && (
        <p className={styles.results} aria-live="polite">
          {visible.length > 1 ? `${visible.length} rôles trouvés` : '1 rôle trouvé'}
        </p>
      )}

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <SearchX aria-hidden="true" />
          <h2 className={styles.empty_title}>Aucun rôle ne correspond.</h2>
          <p className={styles.empty_text}>Vérifiez l'orthographe ou retirez le filtre.</p>
          <Button variant="secondary" fullWidth={false} onClick={reset}>
            Effacer la recherche
          </Button>
        </div>
      ) : (
        groups.map((group) => {
          const team = getTypeTeam(group.type);
          const TeamIcon = TEAM_ICONS[team];
          const titleId = `${searchId}-${group.type}`;
          return (
            <section key={group.type} className={styles.group} aria-labelledby={titleId}>
              <h3 id={titleId} className={styles.group_head}>
                <TeamIcon
                  aria-hidden="true"
                  className={team === 'Evil' ? styles.evil : styles.good}
                />
                <span className={styles.group_title}>
                  {getGroupLabel(group.type, group.roles.length)} · {group.roles.length}
                </span>
                <small className={styles.group_team}>{getTeamLabel(team)}</small>
              </h3>
              <ul className={styles.rows}>
                {group.roles.map((role) => {
                  const holders = inPlay?.get(role.id);
                  return (
                    <li key={role.id}>
                      <RoleRow
                        role={role}
                        onSelect={select}
                        selected={selected?.id === role.id}
                        inPlay={holders !== undefined}
                        trailing={
                          holders !== undefined ? (
                            <Pill tone="highlight">
                              {holders.length > 0 ? holders.join(', ') : 'Non piochée'}
                            </Pill>
                          ) : undefined
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}

      {selected && (
        <RoleDetailSheet
          role={selected}
          holders={inPlay?.get(selected.id)}
          onClose={() => setSelected(undefined)}
        />
      )}
    </div>
  );
};
