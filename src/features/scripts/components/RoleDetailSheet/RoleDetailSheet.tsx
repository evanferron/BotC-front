import { Sheet } from '@common/components/Sheet/Sheet';
import { Button } from '@common/components/Button/Button';
import { TYPE_ICONS } from '../../constants/ROLE_ICONS';
import type { ScriptRole } from '../../types/script.types';
import { TeamBadge, TypeBadge } from '../RoleBadge/RoleBadge';
import styles from './RoleDetailSheet.module.scss';

interface RoleDetailSheetProps {
  role: ScriptRole;
  // Variante conteur : joueurs qui ont ce rôle
  holders?: string[];
  onClose: () => void;
}

/**
 * Fiche d'un rôle (écrans R6 et R7). Ordre fixe : icône, nom, type, équipe, capacité, Fermer.
 * Le rouge reste un badge : la fiche d'un rôle maléfique garde le même fond.
 */
export const RoleDetailSheet = ({ role, holders, onClose }: RoleDetailSheetProps) => {
  const Icon = TYPE_ICONS[role.character_type];
  return (
    <Sheet
      open
      title={role.name}
      hideTitle
      onClose={onClose}
      footer={
        <Button variant="secondary" size="xl" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className={styles.head}>
        <span className={styles.medal} aria-hidden="true">
          <Icon />
        </span>
        <div className={styles.identity}>
          <span className={styles.name} aria-hidden="true">
            {role.name}
          </span>
          <TypeBadge type={role.character_type} />
        </div>
      </div>
      <div className={styles.team}>
        <TeamBadge team={role.default_alignment} />
      </div>
      {role.ability_description && <p className={styles.ability}>{role.ability_description}</p>}
      {holders && holders.length > 0 && (
        <p className={styles.holders}>En jeu : {holders.join(', ')}</p>
      )}
    </Sheet>
  );
};
