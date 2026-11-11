import { cx } from '@/utils/className.utils';
import type { RoleSummary } from '../../types/game.types';
import { getCharacterTypeLabel, isEvilType } from '../../utils/role.utils';
import { toggleSelection } from '../../utils/night.utils';
import styles from './RolePicker.module.scss';

interface RolePickerProps {
  roles: RoleSummary[];
  selected: string[];
  max: number;
  onChange: (selected: string[]) => void;
  label: string;
}

// Grille des rôles du script (gabarit 3 de la nuit, informations du conteur)
export const RolePicker = ({ roles, selected, max, onChange, label }: RolePickerProps) => (
  <div className={styles.grid} role="group" aria-label={label}>
    {roles.map((role) => {
      const isSelected = selected.includes(role.id);
      return (
        <button
          key={role.id}
          type="button"
          className={cx(
            styles.role,
            isEvilType(role.character_type) && styles.evil,
            isSelected && styles.selected
          )}
          aria-pressed={isSelected}
          onClick={() => onChange(toggleSelection(selected, role.id, max))}
        >
          <span className={styles.name}>{role.name}</span>
          <span className={styles.type}>{getCharacterTypeLabel(role.character_type)}</span>
        </button>
      );
    })}
  </div>
);
