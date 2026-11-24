import { cx } from '@common/utils/className.utils';
import { TEAM_ICONS, TYPE_ICONS } from '../../constants/ROLE_ICONS';
import type { ScriptRole } from '../../types/script.types';
import { getTeamLabel } from '../../utils/role.utils';
import styles from './RoleRow.module.scss';

interface RoleRowProps {
  role: ScriptRole;
  onSelect: (role: ScriptRole) => void;
  // Fiche ouverte sur ce rôle
  selected?: boolean;
  // Variante conteur : rôle en jeu (filet laiton)
  inPlay?: boolean;
  // Remplace l'icône d'équipe à droite (ex. pseudos des joueurs pour le conteur)
  trailing?: React.ReactNode;
}

// Ligne de rôle 56 px : médaille, nom en Cormorant, icône d'équipe (design/R1-Roles-du-script)
export const RoleRow = ({
  role,
  onSelect,
  selected = false,
  inPlay = false,
  trailing,
}: RoleRowProps) => {
  const Icon = TYPE_ICONS[role.character_type];
  const TeamIcon = TEAM_ICONS[role.default_alignment];
  const evil = role.default_alignment === 'Evil';

  return (
    <button
      type="button"
      className={cx(styles.row, selected && styles.selected, inPlay && styles.in_play)}
      onClick={() => onSelect(role)}
    >
      <span className={styles.medal} aria-hidden="true">
        <Icon />
      </span>
      <span className={styles.name}>{role.name}</span>
      {trailing ?? (
        <TeamIcon
          className={cx(styles.team, evil ? styles.evil : styles.good)}
          aria-label={getTeamLabel(role.default_alignment)}
          role="img"
        />
      )}
    </button>
  );
};
