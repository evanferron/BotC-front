import { Dial } from '@/components/Dial/Dial';
import { cx } from '@/utils/className.utils';
import styles from './CardFan.module.scss';

interface CardFanProps {
  // Positions des cartes encore libres
  positions: number[];
  selected?: number;
  disabled?: boolean;
  onSelect: (position: number) => void;
}

// Écart maximal entre deux cartes et ouverture totale de l'éventail, en degrés
const MAX_STEP = 9;
const MAX_SPREAD = 64;

// Éventail de cartes face cachée (écrans 07a et 07b)
export const CardFan = ({ positions, selected, disabled = false, onSelect }: CardFanProps) => {
  const count = positions.length;
  const step = count > 1 ? Math.min(MAX_STEP, MAX_SPREAD / (count - 1)) : 0;
  const start = (-step * (count - 1)) / 2;

  return (
    <div className={styles.fan} role="group" aria-label="Cartes restantes">
      {positions.map((position, index) => {
        const isSelected = position === selected;
        return (
          <button
            key={position}
            type="button"
            className={cx(styles.card, isSelected && styles.selected)}
            style={
              {
                '--rotate': `${start + index * step}deg`,
                '--lift': isSelected ? '-30px' : '0px',
                zIndex: isSelected ? count + 1 : index,
              } as React.CSSProperties
            }
            aria-label={`Carte ${index + 1}`}
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onSelect(position)}
          >
            <Dial angle={-12} className={styles.dial} />
          </button>
        );
      })}
    </div>
  );
};
