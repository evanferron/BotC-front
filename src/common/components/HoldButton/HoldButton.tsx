import { useState } from 'react';
import { cx } from '@common/utils/className.utils';
import { Spinner } from '../Spinner/Spinner';
import styles from './HoldButton.module.scss';

export interface HoldButtonProps {
  // « Maintenir pour fermer la table »
  children: React.ReactNode;
  onConfirm: () => void;
  // Durée d'appui avant validation
  durationMs?: number;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Bouton à maintenir appuyé pour les actions irréversibles (design/C7 23f et 23g) : une barre se
 * remplit pendant l'appui, l'action part quand elle est pleine, relâcher avant annule. Au clavier,
 * maintenir Espace ou Entrée.
 */
export const HoldButton = ({
  children,
  onConfirm,
  durationMs = 1200,
  isLoading = false,
  disabled = false,
}: HoldButtonProps) => {
  const [holding, setHolding] = useState(false);
  const inactive = disabled || isLoading;
  const start = () => {
    if (!inactive) setHolding(true);
  };
  const stop = () => setHolding(false);

  return (
    <button
      type="button"
      className={cx(styles.button, holding && styles.holding)}
      style={{ '--hold-duration': `${durationMs}ms` } as React.CSSProperties}
      disabled={inactive}
      aria-busy={isLoading || undefined}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(event) => {
        if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
          event.preventDefault();
          start();
        }
      }}
      onKeyUp={stop}
      onBlur={stop}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span
        className={styles.fill}
        aria-hidden="true"
        onAnimationEnd={() => {
          setHolding(false);
          onConfirm();
        }}
      />
      <span className={styles.label}>
        {isLoading && <Spinner />}
        {children}
      </span>
    </button>
  );
};
