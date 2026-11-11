import { CircleAlert } from 'lucide-react';
import styles from './TextField.module.scss';
import { cx } from '@/utils/className.utils';

export interface TextFieldProps extends Omit<React.ComponentProps<'input'>, 'id'> {
  id: string;
  label: string;
  // text : saisie classique · code : code de partie en grand, monospace
  variant?: 'text' | 'code';
  hint?: string;
  error?: string;
  // Affiche le compteur « n / maxLength » à droite du libellé
  showCount?: boolean;
}

export const TextField = ({
  id,
  label,
  variant = 'text',
  hint,
  error,
  showCount = false,
  maxLength,
  value,
  className,
  ...props
}: TextFieldProps) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = error ? `${id}-error` : hintId;
  const count = typeof value === 'string' ? value.length : 0;

  return (
    <div className={cx(styles.field, className)}>
      <label className={styles.label} htmlFor={id}>
        <span>{label}</span>
        {showCount && maxLength && (
          <span className={styles.count}>
            {count}/{maxLength}
          </span>
        )}
      </label>
      <input
        id={id}
        className={cx(styles.input, styles[variant], error && styles.error)}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className={styles.message} role="alert">
          <CircleAlert aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
};
