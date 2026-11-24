import { cx } from '@common/utils/className.utils';
import { TEAM_ICONS } from '../../constants/ROLE_ICONS';
import type { CharacterType, Team } from '../../types/script.types';
import { getTeamLabel, getTypeLabel } from '../../utils/role.utils';
import styles from './RoleBadge.module.scss';

// Badge d'équipe : toujours icône et libellé, seule l'équipe prend une couleur
export const TeamBadge = ({ team }: { team: Team }) => {
  const Icon = TEAM_ICONS[team];
  return (
    <span className={cx(styles.badge, team === 'Evil' ? styles.evil : styles.good)}>
      <Icon aria-hidden="true" />
      {getTeamLabel(team)}
    </span>
  );
};

// Badge de type (Villageois, Étranger, Sbire, Démon) : reste neutre
export const TypeBadge = ({ type }: { type: CharacterType }) => (
  <span className={cx(styles.badge, styles.neutral)}>{getTypeLabel(type)}</span>
);
