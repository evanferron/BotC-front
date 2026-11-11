import { useEffect, useId } from 'react';
import styles from './Sheet.module.scss';

export interface SheetProps {
  open: boolean;
  title: string;
  description?: string;
  // Contenu défilant (listes de joueurs, de rôles, champs)
  children?: React.ReactNode;
  // Actions en bas de la feuille
  footer?: React.ReactNode;
  onClose: () => void;
}

/**
 * Feuille du bas avec contenu libre (design/Retours.dc.html), même allure que ConfirmSheet.
 * Échap ou un appui sur le voile la ferme.
 */
export const Sheet = ({ open, title, description, children, footer, onClose }: SheetProps) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <i className={styles.grab} aria-hidden="true" />
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && <p className={styles.description}>{description}</p>}
        {children && <div className={styles.content}>{children}</div>}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};
