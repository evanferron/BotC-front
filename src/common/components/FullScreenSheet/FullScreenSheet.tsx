import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PhaseBar, PhaseBarAction } from '../PhaseBar/PhaseBar';
import styles from './FullScreenSheet.module.scss';

export interface FullScreenSheetProps {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Feuille plein écran posée par-dessus l'écran courant, sans le modifier
 * (design/Navigation-Vibrations.dc.html). Bandeau neutre avec bouton de fermeture, corps défilant.
 * Échap la ferme ; une feuille ouverte par-dessus (Sheet) intercepte Échap en phase de capture.
 */
export const FullScreenSheet = ({ title, closeLabel, onClose, children }: FullScreenSheetProps) => {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={styles.panel}>
        <PhaseBar
          title={title}
          titleId={titleId}
          // Bandeau neutre (fond de base, filet plein)
          variant="night"
          actions={
            <PhaseBarAction aria-label={closeLabel} onClick={onClose}>
              <X aria-hidden="true" />
            </PhaseBarAction>
          }
        />
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
};
