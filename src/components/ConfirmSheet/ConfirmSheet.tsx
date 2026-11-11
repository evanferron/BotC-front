import { useEffect, useId, useRef } from 'react';
import styles from './ConfirmSheet.module.scss';
import { Button } from '../Button/Button';

export interface ConfirmSheetProps {
  open: boolean;
  title: string;
  // Conséquence de l'action, en une phrase
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  // danger : action destructrice (aplat sang)
  tone?: 'primary' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Feuille de confirmation qui monte du bas de l'écran (design/Retours.dc.html).
 * Le focus va sur « Annuler » : une action lourde ne se valide jamais par réflexe.
 */
export const ConfirmSheet = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Annuler',
  tone = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.scrim} onClick={onCancel} aria-hidden="true" />
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <i className={styles.grab} aria-hidden="true" />
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}
        <Button variant={tone} isLoading={isLoading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
};
