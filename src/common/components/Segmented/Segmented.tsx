import { useId } from 'react';
import { cx } from '@common/utils/className.utils';
import styles from './Segmented.module.scss';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  // Aide sous le contrôle
  hint?: string;
}

// Segments à bascule : un réglage se fait au pouce, sans saisie (design/Correction.dc.html)
export const Segmented = <T extends string>({
  label,
  options,
  value,
  onChange,
  hint,
}: SegmentedProps<T>) => {
  const labelId = useId();
  return (
    <div className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.segments} role="radiogroup" aria-labelledby={labelId}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className={cx(styles.segment, value === option.value && styles.on)}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {hint && <small className={styles.hint}>{hint}</small>}
    </div>
  );
};
