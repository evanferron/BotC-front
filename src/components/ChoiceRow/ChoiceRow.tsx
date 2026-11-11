import { Check } from 'lucide-react';
import styles from './ChoiceRow.module.scss';
import { cx } from '@/utils/className.utils';

export interface ChoiceRowProps extends Omit<React.ComponentProps<'button'>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  selected?: boolean;
  // Remplace l'indicateur radio (ex. une étiquette « Bientôt »)
  trailing?: React.ReactNode;
}

// Ligne de choix unique (radio) : script, joueur, option
export const ChoiceRow = ({
  title,
  description,
  selected = false,
  trailing,
  className,
  ...props
}: ChoiceRowProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    className={cx(styles.row, selected && styles.selected, className)}
    {...props}
  >
    <span className={styles.text}>
      <span className={styles.title}>{title}</span>
      {description && <span className={styles.description}>{description}</span>}
    </span>
    {trailing ?? (
      <span className={styles.indicator} aria-hidden="true">
        <Check />
      </span>
    )}
  </button>
);
